/**
 * Graph Controller
 * Handles graph visualization requests
 */
const { getAllNodesAndEdges, getGraphByDoctor, getGraphByPatient } = require("../../db/neo4j");

/**
 * GET /api/graph
 * Fetch all nodes and edges for visualization
 * Query params:
 *   - doctorId: Filter by doctor's patients
 *   - patientId: Filter by specific patient
 */
async function getGraph(req, res, next) {
  try {
    const { doctorId, patientId } = req.query;
    
    let result;
    let filterInfo = "all";
    
    if (patientId) {
      console.log(`[API] Fetching graph data for patient: ${patientId}...`);
      result = await getGraphByPatient(patientId);
      filterInfo = `patient:${patientId}`;
    } else if (doctorId) {
      console.log(`[API] Fetching graph data for doctor: ${doctorId}...`);
      result = await getGraphByDoctor(doctorId);
      filterInfo = `doctor:${doctorId}`;
    } else {
      console.log("[API] Fetching complete graph data...");
      result = await getAllNodesAndEdges();
    }

    const { nodes, links, nodeTypes } = result;

    console.log(`[API] Graph (${filterInfo}): ${nodes.length} nodes, ${links.length} edges`);

    res.json({
      success: true,
      graph: { nodes, links },
      nodeTypes,
      filter: filterInfo,
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
