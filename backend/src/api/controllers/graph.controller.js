/**
 * Graph Controller
 * Handles graph visualization requests
 */
const { getAllNodesAndEdges } = require("../../db/neo4j");

/**
 * GET /api/graph
 * Fetch all nodes and edges for visualization
 */
async function getGraph(req, res, next) {
  try {
    console.log("[API] Fetching graph data...");

    const { nodes, links, nodeTypes } = await getAllNodesAndEdges();

    console.log(`[API] Graph: ${nodes.length} nodes, ${links.length} edges`);

    res.json({
      success: true,
      graph: { nodes, links },
      nodeTypes,
      stats: {
        totalNodes: nodes.length,
        totalEdges: links.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGraph,
};
