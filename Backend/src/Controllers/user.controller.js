const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const getUsersController = async (req, res, next) => {
    try {
        const query = { deletedAt: null };

        if (req.user.role !== "super_admin") {
            query.companyId = req.user.companyId;
        }

        const users = await User.find(query)
            .select("-passwordHash")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, "Users fetched successfully", {
                count: users.length,
                users: users.map((user) => user.toSafeObject()),
            })
        );
    } catch (error) {
        next(error);
    }
};

const getUserByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = { _id: id, deletedAt: null };

        if (req.user.role !== "super_admin") {
            query.companyId = req.user.companyId;
        }

        const user = await User.findOne(query).select("-passwordHash");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, "User fetched successfully", {
                user: user.toSafeObject(),
            })
        );
    } catch (error) {
        next(error);
    }
};

const updateUserController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = { _id: id, deletedAt: null };

        if (req.user.role !== "super_admin") {
            query.companyId = req.user.companyId;
        }

        const user = await User.findOne(query).select("-passwordHash");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const allowedFields = [
            "fullName",
            "phone",
            "department",
            "designation",
            "status",
            "employeeId",
            "managerId",
            "role",
            "companyId",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        user.updatedBy = req.user._id;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, "User updated successfully", {
                user: user.toSafeObject(),
            })
        );
    } catch (error) {
        next(error);
    }
};

const deleteUserController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = { _id: id, deletedAt: null };

        if (req.user.role !== "super_admin") {
            query.companyId = req.user.companyId;
        }

        const user = await User.findOne(query);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        user.deletedAt = new Date();
        user.updatedBy = req.user._id;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, "User deleted successfully", null)
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
};