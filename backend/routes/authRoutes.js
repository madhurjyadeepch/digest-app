const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes — require valid JWT
router.use(authMiddleware);

router
  .route("/profile")
  .get(authController.getProfile)
  .put(authController.updateProfile);

router.delete("/account", authController.deleteAccount);

module.exports = router;
