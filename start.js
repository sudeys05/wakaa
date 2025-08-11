#!/usr/bin/env node

// Simple startup script to run the JavaScript server
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Import and run the server
import('./server/index.js')
  .then(() => {
    console.log('Server started successfully');
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });