const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const companyRoutes = require("./company.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);

module.exports = router;