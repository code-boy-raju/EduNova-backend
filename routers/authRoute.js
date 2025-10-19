const express = require("express");
const {studentSignup,verifyStudentOtp, instructorSignup,verifyInstructor,login} = require("../controllers/authController.js");
const {uploadFile}=require('../config/multer.js')
const router = express.Router();



router.post("/studentSignup", studentSignup);
router.post("/verifyotp", verifyStudentOtp)
router.post("/instructorSignup",uploadFile.single("file"), instructorSignup);
router.get("/verifyInstructor", verifyInstructor); // ✅ New route for approve/reject buttons
router.post("/login", login);

module.exports = router;
