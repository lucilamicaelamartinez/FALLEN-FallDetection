// lib/uploadScreenshotToFirebase.ts

import { storage } from './firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';
import * as ImageManipulator from 'expo-image-manipulator';

export async function uploadScreenshotToFirebase(
  localUri: string
): Promise<string | null> {
  try {
    console.log('🧪 URI original:', localUri);

    // Comprimir y redimensionar la captura antes de subirla
    const compressedImage = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('🗜️ URI comprimida:', compressedImage.uri);

    const blob = await getBlobFromUri(compressedImage.uri);

    console.log('✅ Blob comprimido listo');
    console.log('📦 Tamaño del blob:', blob.size);
    console.log(
      '📦 Tamaño comprimido:',
      (blob.size / 1024 / 1024).toFixed(2),
      'MB'
    );

    const filename = `screenshots/${uuid.v4()}.jpg`; // ✅ UUID compatible
    const storageRef = ref(storage, filename);

    const metadata = { contentType: 'image/jpeg' };

    const uploadTask = await uploadBytesResumable(
      storageRef,
      blob,
      metadata
    );

    const downloadURL = await getDownloadURL(uploadTask.ref);

    console.log('✅ Imagen subida. URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading screenshot:', error);
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