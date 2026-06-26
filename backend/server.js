const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config');

// ─── Handle uncaught exceptions ───────────────────────
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// ─── Connect to Database & Start Server ───────────────
const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`

     SD COLLECTIONS API Server                      

    Environment : ${config.nodeEnv.padEnd(30)}      
    Port        : ${String(config.port).padEnd(30)} 
    URL         : http://localhost:${String(config.port).padEnd(20)}  
    `);
  });

  // ─── Handle unhandled promise rejections ────────────
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // ─── Graceful shutdown ──────────────────────────────
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  });
};

startServer();
// Nodemon trigger comment for dev reload

