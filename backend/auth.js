const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const firebaseApp = require('firebase-admin/app');
const firebaseAuth = require('firebase-admin/auth');
const { docClient, USERS_TABLE, FAMILIES_TABLE } = require("./db-client");
const { HttpError } = require("./http-helpers");

// Firebase Admin SDKの初期化
if (!firebaseApp.getApps().length) {
  try {
    let saValue = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saValue && !saValue.trim().startsWith('{')) {
      try {
        const decoded = Buffer.from(saValue, 'base64').toString('utf-8');
        if (decoded.trim().startsWith('{')) {
          saValue = decoded;
          console.log('[FirebaseInit] Service Account decoded from Base64');
        }
      } catch {
        console.warn('[FirebaseInit] Failed to decode potential Base64 Service Account');
      }
    }

    const serviceAccount = saValue ? JSON.parse(saValue) : null;

    if (serviceAccount) {
      firebaseApp.initializeApp({
        credential: firebaseApp.cert(serviceAccount)
      });
      console.log('[FirebaseInit] Firebase Admin initialized successfully');
    } else {
      console.warn('[FirebaseInit] FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty.');
    }
  } catch (error) {
    console.error('[FirebaseInit] Failed to initialize Firebase Admin:', error.message);
  }
}

const verifyFirebaseToken = async (token) => {
  if (!firebaseApp.getApps().length) {
    throw new Error('Firebase Admin not initialized');
  }
  try {
    const decodedToken = await firebaseAuth.getAuth().verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture
    };
  } catch (error) {
    console.error('[verifyFirebaseToken] Error:', error.message);
    throw error;
  }
};

/**
 * ユーザー情報を同期する。
 */
const syncUserInfo = async (userInfo) => {
  if (!userInfo || !userInfo.userId) return;

  try {
    const now = new Date().toISOString();
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE(),
      Item: {
        ...userInfo,
        updatedAt: now,
      },
    }));
    console.log(`[syncUserInfo] User synced: ${userInfo.userId} (${userInfo.email || 'N/A'})`);
  } catch (error) {
    console.error(`[syncUserInfo] Failed to sync user info for ${userInfo.userId}:`, error.message);
    // ユーザー同期の失敗はAPI全体の失敗とはしない（可用性優先）
  }
};

/**
 * Bearer token を検証し、成功時はuserIdを返す。token自体が不正・未検証の場合はnullを返す
 * （呼び出し側で他の認証経路へフォールバックするため）。検証自体が失敗した場合はHttpErrorを投げる。
 */
const resolveUserIdFromBearerToken = async (token) => {
  try {
    const userInfo = await verifyFirebaseToken(token);
    if (userInfo && userInfo.userId) {
      await syncUserInfo(userInfo);
      return userInfo.userId;
    }
    return null;
  } catch (error) {
    if (error.message === 'Firebase Admin not initialized') {
      // サービスアカウントが未設定の場合の特別なエラー
      throw new HttpError(401, "Authentication Error", "Firebase Service Account is not configured on the server. Please set FIREBASE_SERVICE_ACCOUNT environment variable.");
    }
    throw new HttpError(401, "Invalid Token", error.message);
  }
};

const getUserId = async (event) => {
  if (!event || !event.headers) {
    throw new HttpError(401, "Missing headers");
  }

  const normalizedHeaders = Object.keys(event.headers).reduce((acc, key) => {
    acc[key.toLowerCase()] = event.headers[key];
    return acc;
  }, {});

  const authHeader = normalizedHeaders["authorization"];
  const xUserIdHeader = normalizedHeaders["x-user-id"];

  // 1. Authorization header (Bearer token) を確認
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      const userId = await resolveUserIdFromBearerToken(token);
      if (userId) {
        return userId;
      }
    }
  }

  // 2. テストユーザーの場合は認証なしで許可
  if (xUserIdHeader === 'test-user') {
    return 'test-user';
  }

  // 3. 開発・テスト用: x-user-idヘッダーによるフォールバック
  if (process.env.ALLOW_INSECURE_USER_ID === 'true' || process.env.NODE_ENV === 'test') {
     return xUserIdHeader || "default-user";
  }

  // 認証失敗
  const detail = authHeader ? "Token verification failed and insecure fallback is disabled." : "Authorization header is missing.";
  throw new HttpError(401, "Unauthorized", detail);
};

/**
 * 指定されたユーザーがターゲットユーザーの家族かどうかを検証する。
 */
const checkFamilyPermission = async (userId, targetUserId) => {
  if (userId === targetUserId) return true;
  if (userId === 'test-user') return false;

  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: FAMILIES_TABLE(),
      Key: { userId, familyUserId: targetUserId }
    }));
    return !!Item;
  } catch (error) {
    console.error(`[checkFamilyPermission] Error:`, error.message);
    return false;
  }
};

/**
 * クエリパラメータの`userId`を対象ユーザーとして解決し、家族権限を検証する。
 * 権限が無い場合はHttpError(403)を投げる。
 */
const resolveAuthorizedTargetUserId = async (event, userId, errorMessage) => {
  const targetUserId = event.queryStringParameters?.userId || userId;
  const hasPermission = await checkFamilyPermission(userId, targetUserId);
  if (!hasPermission) {
    throw new HttpError(403, errorMessage);
  }
  return targetUserId;
};

module.exports = {
  verifyFirebaseToken,
  syncUserInfo,
  getUserId,
  checkFamilyPermission,
  resolveAuthorizedTargetUserId,
};
