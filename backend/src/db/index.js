/**
 * Database Module
 * Central export for all database connections
 */
const neo4j = require("./neo4j");
const supabase = require("./supabase");

module.exports = {
  neo4j,
  supabase,
};
