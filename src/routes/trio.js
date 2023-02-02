const express = require("express");

const { validateSignature } = require("../middleware/validate-signature");

const { getPing, postPreAuth, postAuth, postAuthStatus } = require("../controllers/trio");

const router = express.Router();

router.get("/ping", getPing);
router.post("/preauth", validateSignature, postPreAuth);
router.post("/auth", validateSignature, postAuth);
router.get("/auth_status", validateSignature, postAuthStatus);

module.exports = router;
