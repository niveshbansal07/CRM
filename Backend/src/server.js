const app = require('./app');
const connectDB = require('./configs/dbConnect');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Failed to Start");
    console.error(error);
    process.exit(1);
  }
};

startServer();