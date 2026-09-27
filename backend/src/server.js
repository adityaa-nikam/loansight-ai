const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

const start = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`[Server] LoanLens API running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
};

start();
