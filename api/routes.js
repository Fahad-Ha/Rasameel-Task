const express = require("express");
const { getData } = require("./controllers");
const router = express.Router();

router.get("/:date", getData);

module.exports = router;
