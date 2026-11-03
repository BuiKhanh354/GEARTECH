const { saveImage } = require('../services/firebaseStorageService');

async function testUpload() {
  console.log('Testing image upload service...');
  const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  
  const result = await saveImage(sampleBuffer, 'test-pixel.png', 'image/png', 'products');
  console.log('Upload Result:', result);
}

testUpload().then(() => process.exit(0)).catch(err => {
  console.error('Upload Error:', err);
  process.exit(1);
});

