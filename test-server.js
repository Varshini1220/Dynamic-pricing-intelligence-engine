// Simple test to verify dependencies
console.log('Testing dependencies...');

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const socketIo = require('socket.io');
  console.log('✅ Socket.IO loaded');
  
  const Database = require('better-sqlite3');
  console.log('✅ better-sqlite3 loaded');
  
  const tf = require('@tensorflow/tfjs-node');
  console.log('✅ TensorFlow.js loaded');
  
  console.log('\n🎉 All dependencies are installed correctly!');
  console.log('\nYou can now run the application with:');
  console.log('  npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nPlease run: npm install');
}

