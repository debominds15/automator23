const router = require("express").Router();

// Controllers
const {
  genReport
} = require("../../app/controllers/api/ReportController");

// Middleware
const {
   auth,
  } = require("../../app/middlewares/auth");

router.get("/", auth, genReport);

module.exports = router;