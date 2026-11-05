// serverless.ymlが`handler.<functionName>`形式で参照するため、各ドメイン別ファイル
// （items-handler.js・stock-handler.js・family-handler.js・ops-alert-handler.js・
// client-error-handler.js）からの再exportに留める。実装自体はファイルサイズ・複雑度の
// lintルールに収まる単位でドメインごとに分割している
const itemsHandler = require("./items-handler");
const stockHandler = require("./stock-handler");
const familyHandler = require("./family-handler");
const opsAlertHandler = require("./ops-alert-handler");
const clientErrorHandler = require("./client-error-handler");

exports.createItem = itemsHandler.createItem;
exports.getItems = itemsHandler.getItems;
exports.updateItem = itemsHandler.updateItem;
exports.deleteItem = itemsHandler.deleteItem;

exports.addStock = stockHandler.addStock;
exports.consumeStock = stockHandler.consumeStock;
exports.getConsumptionHistory = stockHandler.getConsumptionHistory;
exports.getEstimatedDepletionDate = stockHandler.getEstimatedDepletionDate;

exports.createInvitation = familyHandler.createInvitation;
exports.acceptInvitation = familyHandler.acceptInvitation;
exports.getFamilies = familyHandler.getFamilies;

exports.opsAlert = opsAlertHandler.opsAlert;

exports.reportClientError = clientErrorHandler.reportClientError;
