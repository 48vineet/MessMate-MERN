// routes/auth.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  verifyToken,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  adminCreateUser,
  uploadAvatar,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const {
  uploadAvatar: uploadAvatarMiddleware,
} = require("../middleware/upload");

// Validation middleware
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["student", "admin"])
    .withMessage("Invalid role"),
];

const adminCreateUserValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").isIn(["student", "admin"]).withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resettoken", resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post("/logout", logout);
router.get("/me", getMe);
router.get("/verify", verifyToken);
router.put("/update-details", updateDetails);
router.put("/update-password", updatePassword);
router.put("/upload-avatar", uploadAvatarMiddleware, uploadAvatar);
router.put("/profile", updateDetails); // Add profile update route

// Admin routes
router.post(
  "/admin/create-user",
  authorize("admin"),
  adminCreateUserValidation,
  adminCreateUser
);

module.exports = router;
