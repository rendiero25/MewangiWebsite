const http = require('http');

const endpoints = [
  '/api/forum', 
  '/api/articles', 
  '/api/reviews',
  '/api/users/top-members',
  '/api/forum/meta/top-categories',
  '/api/articles/meta/top-categories',
  '/api/reviews/meta/top-categories'
];

async function test(ep) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + ep, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`GET ${ep}: SUCCESS (Status ${res.statusCode})`);
          if (Array.isArray(parsed)) {
            console.log('Count:', parsed.length);
          } else {
            console.log('Keys:', Object.keys(parsed));
          }
          resolve();
        } catch (e) {
          console.log(`GET ${ep}: FAILED TO PARSE JSON (Status ${res.statusCode})`);
          console.log('Raw data:', data.substring(0, 100));
          resolve();
        }
      });
    }).on('error', (err) => {
      console.log(`GET ${ep}: CONNECTION FAILED - ${err.message}`);
      resolve();
    });
  });
}

(async () => {
  console.log('--- Testing API Endpoints ---');
  for (const ep of endpoints) {
    await test(ep);
  }
  console.log('--- Test Complete ---');
})();
