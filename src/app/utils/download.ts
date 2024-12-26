import fs from 'fs/promises';

/**
 * Downloads a file from a URL and saves it to the specified path using streaming
 * to minimize memory usage.
 * 
 * @param url The URL to download from
 * @param targetPath The path where the file should be saved
 * @throws Error if download fails or if writing to file fails
 */
export async function downloadFileStream(url: string, targetPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  
  if (!response.body) {
    throw new Error('Response body is null');
  }

  // Create a write stream
  const fileHandle = await fs.open(targetPath, 'w');
  const writeStream = fileHandle.createWriteStream();
  
  try {
    // Use the Web Streams API to efficiently pipe the download to file
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Write chunks as they arrive
      await new Promise<void>((resolve, reject) => {
        writeStream.write(value, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  } finally {
    // Ensure streams are properly closed
    writeStream.end();
    await fileHandle.close();
  }
}
