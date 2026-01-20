/**
 * Neo4j Database Module
 * Re-exports driver and queries for clean imports
 */
const driver = require("./driver");
const queries = require("./queries");

module.exports = {
  ...driver,
  ...queries,
};
