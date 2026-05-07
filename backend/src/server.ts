import app from './app';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { Server } from 'http';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
let server: Server;

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Start the server
    server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Server started successfully!');
      console.log('='.repeat(50));
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      try {
        // Close database connection
        await disconnectDatabase();
        console.log('✅ Database connection closed');
        console.log('👋 Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  if (reason?.stack) {
    console.error(reason.stack);
  }
  // Don't exit immediately in development
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});
