require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { ensureDefaultSuperAdmin } = require("./services/auth.service");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDB();

    // App start hote hi ensure karega ki ek default super admin ho
    await ensureDefaultSuperAdmin();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Server Failed to Start");
    console.error(error);
    process.exit(1);
  }
};

startServer();