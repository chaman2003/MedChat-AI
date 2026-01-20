/**
 * Users Controller
 * Handles doctor and patient data retrieval
 */
const neo4j = require("../../db/neo4j");

/**
 * Get all doctors
 */
async function getAllDoctors(req, res, next) {
  try {
    const doctors = await neo4j.getAllDoctors();
    res.json({
      success: true,
      doctors,
      count: doctors.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get doctor by ID
 */
async function getDoctorById(req, res, next) {
  try {
    const { doctorId } = req.params;
    const doctors = await neo4j.getDoctorById(doctorId);
    
    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        error: "Doctor not found",
      });
    }
    
    res.json({
      success: true,
      doctor: doctors[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patients for a specific doctor
 */
async function getDoctorPatients(req, res, next) {
  try {
    const { doctorId } = req.params;
    const patients = await neo4j.getDoctorPatients(doctorId);
    
    res.json({
      success: true,
      doctorId,
      patients,
      count: patients.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all patients
 */
async function getAllPatients(req, res, next) {
  try {
    const patients = await neo4j.getAllPatients();
    res.json({
      success: true,
      patients,
      count: patients.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient by ID
 */
async function getPatientById(req, res, next) {
  try {
    const { patientId } = req.params;
    const profiles = await neo4j.getPatientProfile(patientId);
    
    if (!profiles.length) {
      return res.status(404).json({
        success: false,
        error: "Patient not found",
      });
    }
    
    res.json({
      success: true,
      patient: profiles[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorPatients,
  getAllPatients,
  getPatientById,
};
