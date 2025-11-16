const fs = require('fs');
const path = require('path');

// Possible paths to check
const possiblePaths = [
  'C:\\Users\\lenovo\\OneDrive\\سطح المكتب\\mazen\\unnamed.jpg',
  'C:\\Users\\lenovo\\OneDrive\\سطح المكتب\\mazen\\unnamed\\jpg',
  path.join('C:\\Users\\lenovo\\OneDrive\\سطح المكتب\\mazen', 'unnamed.jpg'),
];

// Search for JPG files in mazen directory
const mazenDir = 'C:\\Users\\lenovo\\OneDrive\\سطح المكتب\\mazen';
let foundPath = null;

// Try direct paths first
console.log('🔍 Searching for image...');
for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      foundPath = testPath;
      console.log('✅ Found image at:', foundPath);
      break;
    }
  } catch (err) {
    // Continue searching
  }
}

// If not found, search directory recursively
if (!foundPath) {
  try {
    function findJPGFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        try {
          if (entry.isDirectory()) {
            const found = findJPGFiles(fullPath);
            if (found) return found;
          } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.jpg')) {
            return fullPath;
          }
        } catch (err) {
          // Skip inaccessible files/dirs
        }
      }
      return null;
    }
    
    foundPath = findJPGFiles(mazenDir);
    if (foundPath) {
      console.log('✅ Found image at:', foundPath);
    }
  } catch (err) {
    console.error('❌ Error searching directory:', err.message);
  }
}

if (foundPath) {
  try {
    console.log('📸 Reading image file...');
    const imageBuffer = fs.readFileSync(foundPath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // Save to file
    fs.writeFileSync('image-base64.txt', dataUrl, 'utf8');
    console.log('✅ Image converted successfully!');
    console.log('📄 Base64 saved to: image-base64.txt');
    console.log(`📏 Data URL length: ${dataUrl.length} characters`);
    
    // Also save first 200 chars for preview
    console.log(`\nPreview (first 200 chars): ${dataUrl.substring(0, 200)}...`);
    console.log('\n✅ You can now use this in mockData.ts');
  } catch (err) {
    console.error('❌ Error converting image:', err.message);
  }
} else {
  console.error('❌ Image not found. Please check the path.');
  console.log('Searched in:', mazenDir);
  console.log('\n💡 Please verify the path:');
  console.log('   C:\\Users\\lenovo\\OneDrive\\سطح المكتب\\mazen\\unnamed.jpg');
}

