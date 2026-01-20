/**
 * Neo4j Database Driver
 * Handles connection and query execution for Neo4j graph database
 */
const neo4j = require("neo4j-driver");
const config = require("../../config");

let driver = null;

/**
 * Initialize Neo4j driver connection
 */
function initDriver() {
  if (!driver) {
    driver = neo4j.driver(
      config.neo4j.URI,
      neo4j.auth.basic(config.neo4j.USER, config.neo4j.PASSWORD)
    );
    console.log("✅ Neo4j driver initialized");
  }
  return driver;
}

/**
 * Execute a Cypher query
 * @param {string} cypher - Cypher query string
 * @param {object} params - Query parameters
 * @returns {Promise<Array>} Query results as array of objects
 */
async function runQuery(cypher, params = {}) {
  const d = initDriver();
  const session = d.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject());
  } finally {
    await session.close();
  }
}

/**
 * Close the Neo4j driver connection
 */
async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
    console.log("🔌 Neo4j driver closed");
  }
}

/**
 * Get driver instance
 */
function getDriver() {
  return initDriver();
}

/**
 * Verify Neo4j connectivity
 * @returns {Promise<void>}
 */
async function verifyConnectivity() {
  try {
    const d = initDriver();
    await d.verifyConnectivity();
    console.log("✅ Neo4j connectivity verified");
  } catch (error) {
    throw new Error(`Neo4j connection failed: ${error.message}`);
  }
}

module.exports = {
  initDriver,
  runQuery,
  closeDriver,
  getDriver,
  verifyConnectivity,
};
