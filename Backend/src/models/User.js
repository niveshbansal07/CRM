// const mongoose = require('mongoose');
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     // Multi Tenant
//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       default: null, // null = Super Admin
//       index: true
//     },

//     // Basic Info
//     firstName: {
//       type: String,
//       trim: true
//     },

//     lastName: {
//       type: String,
//       trim: true
//     },

//     fullName: {
//       type: String,
//       trim: true,
//       index: true
//     },

//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       unique: true,
//       index: true,
//       trim: true
//     },

//     phone: {
//       type: String,
//       trim: true
//     },

//     passwordHash: {
//       type: String,
//       required: true
//     },

//     avatar: {
//       type: String
//     },

//     // Role System (Matches Your UI)
//     role: {
//       type: String,
//       enum: [
//         "super_admin",
//         "company_admin",
//         "user"
//       ],
//       default: "user",
//       index: true
//     },

//     // Organization Info
//     department: {
//       type: String
//     },

//     designation: {
//       type: String
//     },

//     employeeId: {
//       type: String
//     },

//     managerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     // Account Status
//     status: {
//       type: String,
//       enum: [
//         "active",
//         "invited",
//         "suspended",
//         "disabled"
//       ],
//       default: "active",
//       index: true
//     },

//     // Security
//     isEmailVerified: {
//       type: Boolean,
//       default: false
//     },

//     loginAttempts: {
//       type: Number,
//       default: 0
//     },

//     lockUntil: {
//       type: Date
//     },

//     // Activity
//     lastLoginAt: Date,
//     lastActiveAt: Date,

//     // Permission Cache Version
//     permissionsVersion: {
//       type: Number,
//       default: 1
//     },

//     // Audit Fields
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     deletedAt: {
//       type: Date,
//       default: null
//     }

//   },
//   {
//     timestamps: true
//   }
// );

// module.exports = mongoose.model("User", userSchema);



const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Multi-tenant support:
    // super_admin ke liye null
    // company_admin/user ke liye actual company ObjectId
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },

    firstName: {
      type: String,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    fullName: {
      type: String,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["super_admin", "company_admin", "user"],
      default: "user",
      index: true,
    },

    department: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      default: "",
      index: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "invited", "suspended", "disabled"],
      default: "active",
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },

    permissionsVersion: {
      type: Number,
      default: 1,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full name auto build
userSchema.pre("save", function (next) {
  this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  next();
});

// Password compare helper
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Public safe object
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    companyId: this.companyId,
    department: this.department,
    designation: this.designation,
    employeeId: this.employeeId,
    status: this.status,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);





// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     // Multi-tenant reference
//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       default: null, // null for super admin
//       index: true,
//     },

//     // Basic info
//     firstName: {
//       type: String,
//       trim: true,
//       required: true,
//     },

//     lastName: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     fullName: {
//       type: String,
//       trim: true,
//       index: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       unique: true,
//       index: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     passwordHash: {
//       type: String,
//       required: true,
//       select: false,
//     },

//     avatar: {
//       type: String,
//       default: "",
//     },

//     // Current frontend-compatible roles
//     role: {
//       type: String,
//       enum: ["super_admin", "company_admin", "user"],
//       default: "user",
//       index: true,
//     },

//     // Future role model support
//     roleId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Role",
//       default: null,
//     },

//     department: {
//       type: String,
//       default: "",
//     },

//     designation: {
//       type: String,
//       default: "",
//     },

//     employeeId: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     managerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     status: {
//       type: String,
//       enum: ["active", "invited", "suspended", "disabled"],
//       default: "active",
//       index: true,
//     },

//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     loginAttempts: {
//       type: Number,
//       default: 0,
//     },

//     lockUntil: {
//       type: Date,
//       default: null,
//     },

//     lastLoginAt: {
//       type: Date,
//       default: null,
//     },

//     lastActiveAt: {
//       type: Date,
//       default: null,
//     },

//     permissionsVersion: {
//       type: Number,
//       default: 1,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     deletedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Auto full name build
// userSchema.pre("save", function (next) {
//   this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
//   next();
// });

// // Password set helper
// userSchema.methods.setPassword = async function (plainPassword) {
//   const salt = await bcrypt.genSalt(10);
//   this.passwordHash = await bcrypt.hash(plainPassword, salt);
// };

// // Password compare helper
// userSchema.methods.comparePassword = async function (plainPassword) {
//   return bcrypt.compare(plainPassword, this.passwordHash);
// };

// // Safe JSON response
// userSchema.methods.toSafeObject = function () {
//   return {
//     id: this._id,
//     firstName: this.firstName,
//     lastName: this.lastName,
//     fullName: this.fullName,
//     email: this.email,
//     phone: this.phone,
//     avatar: this.avatar,
//     role: this.role,
//     companyId: this.companyId,
//     department: this.department,
//     designation: this.designation,
//     employeeId: this.employeeId,
//     managerId: this.managerId,
//     status: this.status,
//     isEmailVerified: this.isEmailVerified,
//     lastLoginAt: this.lastLoginAt,
//     lastActiveAt: this.lastActiveAt,
//     createdAt: this.createdAt,
//     updatedAt: this.updatedAt,
//   };
// };

// module.exports = mongoose.model("User", userSchema);