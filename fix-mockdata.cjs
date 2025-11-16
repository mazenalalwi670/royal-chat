const fs = require('fs');

// Read the base64 image data
const imageData = fs.readFileSync('image-base64.txt', 'utf8').trim();

// Read the original mockData.ts to find where to insert
const mockDataContent = fs.readFileSync('data/mockData.ts', 'utf8');

// Find where the SVG starts and ends more accurately
// Look for the line "const mazenAlalwiPortrait = `data:image/svg+xml;base64," 
// and replace everything until we find the closing backtick followed by semicolon

// Split by lines
const lines = mockDataContent.split('\n');

// Find the line with mazenAlalwiPortrait
let portraitLineIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const mazenAlalwiPortrait')) {
    portraitLineIndex = i;
    break;
  }
}

if (portraitLineIndex >= 0) {
  // Read from file start to this line
  const beforeLines = lines.slice(0, portraitLineIndex);
  
  // Find where the old SVG ends (look for closing backtick and semicolon)
  let endIndex = portraitLineIndex;
  let foundClosing = false;
  
  // Check current line first
  if (lines[portraitLineIndex].includes('`;')) {
    endIndex = portraitLineIndex;
    foundClosing = true;
  } else {
    // Search subsequent lines
    for (let i = portraitLineIndex + 1; i < lines.length; i++) {
      if (lines[i].includes('`;')) {
        endIndex = i;
        foundClosing = true;
        break;
      }
    }
  }
  
  // Get lines after the closing
  const afterLines = lines.slice(endIndex + 1);
  
  // Create the new line with actual image
  const newLine = `const mazenAlalwiPortrait = \`${imageData}\`;`;
  
  // Combine everything
  const newContent = [...beforeLines, newLine, ...afterLines].join('\n');
  
  // Write back
  fs.writeFileSync('data/mockData.ts', newContent, 'utf8');
  console.log('✅ Fixed mockData.ts with actual image!');
  console.log(`📏 Image data length: ${imageData.length} characters`);
} else {
  console.error('❌ Could not find mazenAlalwiPortrait');
}

