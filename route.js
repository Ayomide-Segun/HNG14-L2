const express = require("express");
const router = express.Router();
const { addProfile, getProfileUsingParams, getProfileUsingQuery, naturalLanguageQuery, deleteProfiles  } = require("./controller");

router.post('/profiles', addProfile);
router.get('/profiles', getProfileUsingQuery);
router.get('/profiles/search', naturalLanguageQuery);
router.get('/profiles/:id', getProfileUsingParams);
router.delete('/profiles/:id', deleteProfiles);

module.exports = router;