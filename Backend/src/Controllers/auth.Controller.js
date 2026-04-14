const ApiResponse = require("../utils/ApiResponse");
const { registerUser, loginUser } = require("../services/auth.service");

const loginController = async (req, res, next) => {
  try {
    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers["user-agent"] || "",
      ipAddress: req.ip || "",
    });

    return res.status(200).json(
      new ApiResponse(200, "Login successful", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        role: result.user.role,
        user: result.user.toSafeObject(),
        company: result.user.companyId ? { id: result.user.companyId } : null,
      })
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const registerController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body, req.user || null);

    return res.status(201).json(
      new ApiResponse(201, "User registered successfully", {
        user: user.toSafeObject(),
      })
    );
  } catch (error) {
    next(error);
  }
};

const meController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
        company: req.user.companyId ? { id: req.user.companyId } : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
};

module.exports = {
  loginController,
  registerController,
  meController,
};