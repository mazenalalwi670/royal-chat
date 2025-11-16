const fs = require('fs');

// Read image data
const imageData = fs.readFileSync('image-base64.txt', 'utf8').trim();

// Read mockData.ts
const content = fs.readFileSync('data/mockData.ts', 'utf8');
const lines = content.split('\n');

// Find the line with mazenAlalwiPortrait
let portraitIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const mazenAlalwiPortrait')) {
    portraitIdx = i;
    break;
  }
}

if (portraitIdx >= 0) {
  // Get lines before portrait declaration
  const before = lines.slice(0, portraitIdx);
  
  // Find where export const currentUser starts (this is after the portrait)
  let currentUserIdx = -1;
  for (let i = portraitIdx; i < lines.length; i++) {
    if (lines[i].includes('export const currentUser')) {
      currentUserIdx = i;
      break;
    }
  }
  
  if (currentUserIdx >= 0) {
    // Get lines after currentUser declaration
    const after = lines.slice(currentUserIdx);
    
    // Create new content with actual image
    const newContent = [
      ...before,
      `const mazenAlalwiPortrait = \`${imageData}\`;`,
      '',
      ...after
    ].join('\n');
    
    // Write back
    fs.writeFileSync('data/mockData.ts', newContent, 'utf8');
    console.log('✅ Successfully updated mockData.ts with actual image!');
    console.log(`📏 Image data length: ${imageData.length} characters`);
    console.log(`📄 Total lines before: ${lines.length}`);
    console.log(`📄 Total lines after: ${newContent.split('\n').length}`);
  } else {
    console.error('❌ Could not find "export const currentUser"');
  }
} else {
  console.error('❌ Could not find "const mazenAlalwiPortrait"');
}

