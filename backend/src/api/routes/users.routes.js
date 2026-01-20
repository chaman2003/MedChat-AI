/**
 * Users Routes
 * Routes for doctor and patient data
 */
const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

// Doctor routes
router.get("/doctors", usersController.getAllDoctors);
router.get("/doctors/:doctorId", usersController.getDoctorById);
router.get("/doctors/:doctorId/patients", usersController.getDoctorPatients);

// Patient routes
router.get("/patients", usersController.getAllPatients);
router.get("/patients/:patientId", usersController.getPatientById);

module.exports = router;
