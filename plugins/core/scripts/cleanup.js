#!/usr/bin/env node

/**
 * SMITE Core - Session Cleanup Script
 * Runs on session stop to clean up temporary files and logs
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SMITE_DIR = path.join(os.homedir(), '.smite');
const TEMP_DIR = path.join(SMITE_DIR, 'temp');

function cleanup() {
  try {
    // Clean temp directory if it exists
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      let cleaned = 0;

      files.forEach(file => {
        const filePath = path.join(TEMP_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          // Delete files older than 1 hour
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - stats.mtimeMs > oneHour) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        } catch (err) {
          // Ignore individual file errors
        }
      });

      if (cleaned > 0) {
        console.log(`[SMITE Core] Cleaned up ${cleaned} temporary file(s)`);
      }
    }

    // Ensure core directories exist for next session
    const dirs = [
      path.join(SMITE_DIR, 'logs'),
      path.join(SMITE_DIR, 'cache'),
      TEMP_DIR
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

  } catch (err) {
    // Silent fail - cleanup shouldn't break session end
  }
}

cleanup();
