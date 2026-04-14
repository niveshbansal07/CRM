// Centralized environment variable access.
// Is file ka purpose hai env ko ek jagah validate karke export karna.

const requiredEnvVars = [
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

const env = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    defaultSuperAdminEmail: process.env.DEFAULT_SUPERADMIN_EMAIL,
    defaultSuperAdminPassword: process.env.DEFAULT_SUPERADMIN_PASSWORD,
    defaultSuperAdminFirstName: process.env.DEFAULT_SUPERADMIN_FIRST_NAME || "TrackField",
    defaultSuperAdminLastName: process.env.DEFAULT_SUPERADMIN_LAST_NAME || "Owner",
};

module.exports = env;