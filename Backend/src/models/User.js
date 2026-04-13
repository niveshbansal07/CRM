const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    // Multi Tenant
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null, // null = Super Admin
      index: true
    },

    // Basic Info
    firstName: {
      type: String,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    fullName: {
      type: String,
      trim: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    avatar: {
      type: String
    },

    // Role System (Matches Your UI)
    role: {
      type: String,
      enum: [
        "super_admin",
        "company_admin",
        "user"
      ],
      default: "user",
      index: true
    },

    // Organization Info
    department: {
      type: String
    },

    designation: {
      type: String
    },

    employeeId: {
      type: String
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Account Status
    status: {
      type: String,
      enum: [
        "active",
        "invited",
        "suspended",
        "disabled"
      ],
      default: "active",
      index: true
    },

    // Security
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date
    },

    // Activity
    lastLoginAt: Date,
    lastActiveAt: Date,

    // Permission Cache Version
    permissionsVersion: {
      type: Number,
      default: 1
    },

    // Audit Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    deletedAt: {
      type: Date,
      default: null
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);