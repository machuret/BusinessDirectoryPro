import { pool } from './server/db.js';

async function clearAllSessions() {
  try {
    console.log('Clearing all sessions from database...');
    
    // Clear sessions table
    const result = await pool.query('DELETE FROM sessions');
    console.log(`Cleared ${result.rowCount} sessions from database`);
    
    // Verify sessions are cleared
    const count = await pool.query('SELECT COUNT(*) FROM sessions');
    console.log(`Remaining sessions: ${count.rows[0].count}`);
    
    console.log('Session cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing sessions:', error);
    process.exit(1);
  }
}

clearAllSessions();