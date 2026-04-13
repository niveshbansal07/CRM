const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')


const loginController = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        role: user.role,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          companyId: user.companyId,
        },
        company: user.companyId ? { id: user.companyId } : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const registerController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      companyId,
      department,
      designation
    } = req.body;

    // Validation
    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email and password are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Full Name
    const fullName = `${firstName} ${lastName || ""}`.trim();

    // Create User
    const user = await User.create({
      firstName,
      lastName,
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: role || "user",
      companyId: companyId || null,
      department,
      designation,
      status: "active",
      isEmailVerified: true
    });

    // Generate Token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });

  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




const createSuperAdmin = async () => {

  const exists = await User.findOne({
    role: "super_admin"
  });

  if (exists) {
    console.log("Super admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(
    "trackfield123",
    10
  );

  await User.create({
    firstName: "TrackField",
    lastName: "Owner",
    fullName: "TrackField Owner",
    email: "owner@trackfield.io",
    passwordHash,
    role: "super_admin",
    companyId: null
  });

  console.log("Super Admin Created");
};



module.exports = {
  loginController,
  registerController,
  createSuperAdmin
};