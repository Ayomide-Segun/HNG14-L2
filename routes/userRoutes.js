const express = require("express");
const router = express.Router();
const { githubRedirect, githubCallback } = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get("/github", githubRedirect);
router.get("/github/callback", githubCallback);

module.exports = router;