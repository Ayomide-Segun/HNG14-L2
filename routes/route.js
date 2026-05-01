const express = require("express");
const router = express.Router();
const { addProfile, getProfileUsingParams, getProfileUsingQuery, naturalLanguageQuery, deleteProfiles  } = require("../controllers/controller");
const { githubLogin } = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { versionMiddleware } = require("../middleware/versionMiddleware");
const { exportProfiles } = require("../controllers/exportController");

router.get('profiles/export', authMiddleware, versionMiddleware, exportProfiles);
router.post('/profiles', authMiddleware, versionMiddleware, roleMiddleware("admin"), addProfile);
router.get('/profiles', authMiddleware, versionMiddleware, getProfileUsingQuery);
router.get('/profiles/search', authMiddleware, versionMiddleware, naturalLanguageQuery);
router.get('/profiles/:id', authMiddleware, versionMiddleware, getProfileUsingParams);
router.delete('/profiles/:id', authMiddleware, versionMiddleware, roleMiddleware("admin"), deleteProfiles);

module.exports = router;