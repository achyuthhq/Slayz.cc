import { initializeApp } from "firebase/app";

// Get environment variables with fallbacks
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY;
//const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  //storageBucket: firebaseStorageBucket,
};

// Initialize Firebase (only for apiKey if needed elsewhere)
initializeApp(firebaseConfig);


// Helper function to upload file to server
export async function uploadToServer(file: File, path: string): Promise<string> {
  if (!file || !path) {
    throw new Error("Invalid file or path provided for upload");
  }

  try {
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum limit of 50MB`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload to server
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed: Unknown error');
  }
}