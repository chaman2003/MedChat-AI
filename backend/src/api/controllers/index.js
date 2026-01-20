/**
 * Controllers Index
 */
const chatController = require("./chat.controller");
const graphController = require("./graph.controller");
const searchController = require("./search.controller");
const healthController = require("./health.controller");

module.exports = {
  chatController,
  graphController,
  searchController,
  healthController,
};
