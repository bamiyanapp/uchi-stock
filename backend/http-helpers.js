// 全レスポンス共通のCORSヘッダー
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

class HttpError extends Error {
  constructor(statusCode, message, detail = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
    this.detail = detail;
  }
}

/**
 * CORSヘッダー付きの成功レスポンスを生成する。
 */
const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: typeof body === "string" ? body : JSON.stringify(body),
});

/**
 * パスパラメータから`itemId`を取得する。無い場合はHttpError(400)を投げる。
 */
const requireItemId = (event) => {
  const { itemId } = event.pathParameters || {};
  if (!itemId) {
    throw new HttpError(400, "itemId is required");
  }
  return itemId;
};

/**
 * リクエストボディをJSONとしてパースする。
 * ボディが無い、またはJSONとして不正な場合はHttpErrorを投げる。
 */
const parseJsonBody = (event) => {
  if (!event.body) {
    throw new HttpError(400, "Request body is missing");
  }
  try {
    return JSON.parse(event.body);
  } catch {
    throw new HttpError(400, "Invalid JSON in request body");
  }
};

/**
 * 共通のエラーレスポンス生成
 */
const errorResponse = (error, context = "") => {
  console.error(`[errorResponse] ${context}:`, error);
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : "Internal Server Error";
  const detail = error.detail || error.message;

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      message,
      error: detail,
      context,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }),
  };
};

module.exports = {
  CORS_HEADERS,
  HttpError,
  jsonResponse,
  requireItemId,
  parseJsonBody,
  errorResponse,
};
