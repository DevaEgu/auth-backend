const express = require("express");
const {
  signUp,
  signIn,
  signInWithGoogle,
} = require("../controllers/authController");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/google", signInWithGoogle);
module.exports = router;
