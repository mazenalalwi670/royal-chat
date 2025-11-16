const fs = require('fs');

// Read the base64 image data
console.log('📖 Reading image base64...');
const imageData = fs.readFileSync('image-base64.txt', 'utf8').trim();

// Read mockData.ts
console.log('📖 Reading mockData.ts...');
const mockDataContent = fs.readFileSync('data/mockData.ts', 'utf8');

// Replace the SVG image with the actual image
// Find the line that starts with "const mazenAlalwiPortrait" and replace everything until the closing backtick
const lines = mockDataContent.split('\n');
let foundIndex = -1;
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const mazenAlalwiPortrait')) {
    foundIndex = i;
    startIndex = i;
    // Find where the backtick ends (multiline)
    let lineContent = lines[i];
    let backtickCount = (lineContent.match(/`/g) || []).length;
    
    if (backtickCount === 1) {
      // Continue to next lines until we find the closing backtick
      for (let j = i + 1; j < lines.length; j++) {
        lineContent += '\n' + lines[j];
        backtickCount = (lineContent.match(/`/g) || []).length;
        if (backtickCount === 2) {
          endIndex = j;
          break;
        }
      }
    } else {
      endIndex = i;
    }
    break;
  }
}

if (foundIndex >= 0) {
  // Replace the old SVG with the actual image
  const beforeLines = lines.slice(0, startIndex);
  const afterLines = lines.slice(endIndex + 1);
  
  // Create the new line with the actual image
  const newLine = `const mazenAlalwiPortrait = \`${imageData}\`;`;
  
  // Combine everything
  const newContent = [...beforeLines, newLine, ...afterLines].join('\n');
  
  // Write back to file
  fs.writeFileSync('data/mockData.ts', newContent, 'utf8');
  console.log('✅ Image updated successfully in mockData.ts!');
  console.log(`📏 Image data URL length: ${imageData.length} characters`);
} else {
  console.error('❌ Could not find mazenAlalwiPortrait in mockData.ts');
}

