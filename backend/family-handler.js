const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const { docClient, USERS_TABLE, FAMILIES_TABLE, INVITATIONS_TABLE } = require("./db-client");
const { jsonResponse, HttpError, parseJsonBody, errorResponse } = require("./http-helpers");
const { getUserId } = require("./auth");

/**
 * 招待URL用のトークンを発行する。
 */
exports.createInvitation = async (event) => {
  try {
    const userId = await getUserId(event);
    const invitationToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = Math.floor(now.getTime() / 1000) + (24 * 60 * 60); // 24時間後

    await docClient.send(new PutCommand({
      TableName: INVITATIONS_TABLE(),
      Item: {
        invitationToken,
        inviterUserId: userId,
        expiresAt,
        createdAt: now.toISOString(),
      },
    }));

    return jsonResponse(201, { invitationToken, expiresAt });
  } catch (error) {
    return errorResponse(error, "createInvitation");
  }
};

/**
 * 招待を受諾し、家族登録を行う。
 */
exports.acceptInvitation = async (event) => {
  try {
    const userId = await getUserId(event);
    const body = parseJsonBody(event);
    const { invitationToken } = body;
    if (!invitationToken) {
      throw new HttpError(400, "invitationToken is required");
    }

    // 招待情報の取得
    const { Item: invitation } = await docClient.send(new GetCommand({
      TableName: INVITATIONS_TABLE(),
      Key: { invitationToken },
    }));

    if (!invitation) {
      throw new HttpError(404, "Invitation not found or expired");
    }

    const inviterUserId = invitation.inviterUserId;
    if (inviterUserId === userId) {
      throw new HttpError(400, "You cannot invite yourself");
    }

    const now = new Date().toISOString();

    // 双方向の家族関係を登録。
    // 将来的な改善点（docs/internal-design.md「3. データベース整合性」）: DynamoDB Transactionsへの移行を検討する
    await docClient.send(new PutCommand({
      TableName: FAMILIES_TABLE(),
      Item: {
        userId: userId,
        familyUserId: inviterUserId,
        relationType: "member",
        createdAt: now,
      },
    }));

    await docClient.send(new PutCommand({
      TableName: FAMILIES_TABLE(),
      Item: {
        userId: inviterUserId,
        familyUserId: userId,
        relationType: "member",
        createdAt: now,
      },
    }));

    // 招待情報の削除
    await docClient.send(new DeleteCommand({
      TableName: INVITATIONS_TABLE(),
      Key: { invitationToken },
    }));

    return jsonResponse(200, { message: "Family registration successful", familyUserId: inviterUserId });
  } catch (error) {
    return errorResponse(error, "acceptInvitation");
  }
};

/**
 * 家族一覧を取得する。
 */
exports.getFamilies = async (event) => {
  try {
    const userId = await getUserId(event);

    const { Items: families } = await docClient.send(new QueryCommand({
      TableName: FAMILIES_TABLE(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }));

    // 家族のプロフィール情報を取得
    const familyMembers = await Promise.all((families || []).map(async (family) => {
      const { Item: user } = await docClient.send(new GetCommand({
        TableName: USERS_TABLE(),
        Key: { userId: family.familyUserId },
      }));
      return {
        userId: family.familyUserId,
        displayName: user?.displayName || "Unknown User",
        photoURL: user?.photoURL || null,
        email: user?.email || null,
      };
    }));

    return jsonResponse(200, familyMembers);
  } catch (error) {
    return errorResponse(error, "getFamilies");
  }
};
