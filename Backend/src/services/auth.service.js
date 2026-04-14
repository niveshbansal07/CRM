const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const ApiError = require("../utils/ApiError");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const env = require("../config/env");

const buildRefreshExpiryDate = () => {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now;
};

const registerUser = async (payload, creator = null) => {
    const {
        fullName,
        email,
        password,
        phone,
        role,
        companyId,
        department,
        designation,
        employeeId,
    } = payload;

    if (!fullName || !email || !password) {
        throw new ApiError(400, "Full name, email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        email: normalizedEmail,
        deletedAt: null,
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone || "",
        passwordHash,
        role: role || "user",
        companyId: companyId || null,
        department: department || "",
        designation: designation || "",
        employeeId: employeeId || "",
        status: "active",
        isEmailVerified: true,
        createdBy: creator?._id || null,
        updatedBy: creator?._id || null,
    });

    return user;
};

const loginUser = async ({ email, password, userAgent = "", ipAddress = "" }) => {
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail,
        deletedAt: null,
    }).select("+passwordHash");

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (user.status !== "active") {
        throw new ApiError(403, `User account is ${user.status}`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    user.loginAttempts = 0;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: buildRefreshExpiryDate(),
        userAgent,
        ipAddress,
    });

    return {
        user,
        accessToken,
        refreshToken,
        company: user.companyId ? { id: user.companyId } : null,
    };
};

const ensureDefaultSuperAdmin = async () => {
    const existing = await User.findOne({
        role: "super_admin",
        deletedAt: null,
    });

    if (existing) {
        return existing;
    }

    const passwordHash = await bcrypt.hash(env.defaultSuperAdminPassword, 10);

    const superAdmin = await User.create({
        fullName: env.defaultSuperAdminName,
        email: env.defaultSuperAdminEmail,
        passwordHash,
        role: "super_admin",
        companyId: null,
        status: "active",
        isEmailVerified: true,
    });

    console.log(`Default super admin created: ${superAdmin.email}`);
    return superAdmin;
};

module.exports = {
    registerUser,
    loginUser,
    ensureDefaultSuperAdmin,
};