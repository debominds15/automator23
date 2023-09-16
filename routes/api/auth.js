const router = require("express").Router();

// Controllers
const {
  register,
  verify,
  login,
  resendVerification,
  getAuthenticatedUser,
  addScanData,
  editScanData,
  getAllScanData,
  getAllReportData,
  getAllPatients
} = require("../../app/controllers/api/AuthController");

const {
  genReport,
  deleteReport,
  pdf
} = require("../../app/controllers/api/ReportController");

// Middleware
const {
  registerValidation,
  loginValidation,
  scanValidation,
  auth,
} = require("../../app/middlewares/auth");

// Routes
router.post("/register", registerValidation, register);
router.get("/verify/:token", verify);
router.post("/login", loginValidation, login);
router.post("/verify/resend", resendVerification);
router.get("/", auth, getAuthenticatedUser);
router.post("/registerscan", auth, addScanData);
router.put('/registerscan/:scanId', auth, editScanData);
router.get("/scan", auth, getAllScanData);
router.get("/report", auth, getAllReportData);
router.get("/patients", auth, getAllPatients);
router.post('/generatepdf', auth, genReport);
router.get('/deletepdf', auth, deleteReport);

//router.post('/pdf', pdf);
module.exports = router;