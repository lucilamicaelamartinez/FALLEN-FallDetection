// lib/uploadScreenshotToFirebase.ts

import { storage } from './firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';

export async function uploadScreenshotToFirebase(localUri: string): Promise<string | null> {
  try {
    const blob = await getBlobFromUri(localUri);
    const filename = `screenshots/${uuid.v4()}.jpg`; // ✅ UUID compatible
    const storageRef = ref(storage, filename);

    const metadata = { contentType: 'image/jpeg' };
    const uploadTask = await uploadBytesResumable(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return null;
  }
}

async function getBlobFromUri(uri: string): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

