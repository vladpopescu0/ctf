(async () => {
  try {
    // Attempt to fetch the contents of /flag.txt
    const response = await fetch('file:///flag.txt');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read the content of the response
    const content = await response.text();

    // Output the content to the console
    console.log('Content of /flag.txt:', content);
  } catch (error) {
    // Handle any errors
    console.error('Failed to fetch /flag.txt:', error);
  }
})();
