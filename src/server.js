const app = require('./app');
const connectDB = require('./config/db');
const { version } = require('../package.json');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('📚 BookVault API');
      console.log(`Version: ${version}`);
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
