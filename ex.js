const fs = require('fs');

(async () => {
  try {
    // Path to the local file
    const filePath = '/flag.txt';

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Output the content to the console
    console.log('Content of flag.txt:', content);
  } catch (error) {
    console.error('Failed to read the file:', error);
  }
})();
