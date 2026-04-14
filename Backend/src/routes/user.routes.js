const express = require("express");
const {
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", allowRoles("super_admin", "company_admin"), getUsersController);
router.get("/:id", allowRoles("super_admin", "company_admin"), getUserByIdController);
router.patch("/:id", allowRoles("super_admin", "company_admin"), updateUserController);
router.delete("/:id", allowRoles("super_admin", "company_admin"), deleteUserController);

module.exports = router;