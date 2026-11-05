const { buildClientErrorLogPayload } = require("./client-error-reporting"); // symlink
const { jsonResponse, parseJsonBody, errorResponse, HttpError } = require("./http-helpers");

/**
 * フロントエンドのErrorBoundaryが捕捉した未捕捉例外をCloudWatch Logsへ記録する。
 * 認証の無い公開エンドポイントのため、内容の真偽は検証できない前提とする
 * （dev-standards/docs/client-error-reporting-pattern.md参照）。
 */
exports.reportClientError = async (event) => {
  try {
    const body = parseJsonBody(event);
    const payload = buildClientErrorLogPayload(body);
    if (!payload) {
      throw new HttpError(400, "Invalid input");
    }

    console.error("[ClientError]", payload);

    return jsonResponse(200, { message: "Error reported successfully" });
  } catch (error) {
    return errorResponse(error, "reportClientError");
  }
};
