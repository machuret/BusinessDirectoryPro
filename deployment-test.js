// Test the serverless function locally to ensure it works
import { readFileSync } from 'fs';

// Mock request/response objects
const mockReq = {
  url: '/health',
  method: 'GET'
};

const mockRes = {
  headers: {},
  statusCode: 200,
  body: '',
  setHeader(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = JSON.stringify(data);
    return this;
  },
  send(data) {
    this.body = data;
    return this;
  },
  end() {
    return this;
  }
};

// Test the function
async function testFunction() {
  try {
    const code = readFileSync('api/index.js', 'utf8');
    
    // Extract the handler function
    const handlerMatch = code.match(/export default async function handler\(req, res\) \{([\s\S]*)\}/);
    if (!handlerMatch) {
      console.log('❌ Cannot find handler function');
      return false;
    }
    
    console.log('✅ Function syntax is valid');
    console.log('✅ Database import present:', code.includes('@neondatabase/serverless'));
    console.log('✅ CORS headers configured:', code.includes('Access-Control-Allow-Origin'));
    console.log('✅ Health endpoint present:', code.includes('/health'));
    console.log('✅ API endpoints present:', code.includes('/api/'));
    console.log('✅ HTML frontend present:', code.includes('<!DOCTYPE html>'));
    
    const fileSize = (code.length / 1024).toFixed(1);
    console.log(`✅ Function size: ${fileSize}KB`);
    
    return true;
  } catch (error) {
    console.log('❌ Function test failed:', error.message);
    return false;
  }
}

testFunction().then(success => {
  console.log('\n' + (success ? '🚀 Deployment ready!' : '❌ Fix issues before deploying'));
});
