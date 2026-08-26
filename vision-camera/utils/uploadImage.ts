import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../libs/firebaseConfig';
import uuid from 'react-native-uuid';
import * as ImageManipulator from 'expo-image-manipulator';

export async function uploadImageAsync(uri: string): Promise<string | null> {
  try {
    console.log('🧪 URI original:', uri);

    // Comprimir y redimensionar ANTES de subir a Firebase
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('🗜️ URI comprimida:', compressedImage.uri);

    const blob = await getBlobFromUri(compressedImage.uri);

    console.log('✅ Blob comprimido listo:', blob);
    console.log('📦 Tamaño del blob:', blob.size);
    console.log(
      '📦 Tamaño comprimido:',
      (blob.size / 1024 / 1024).toFixed(2),
      'MB'
    );

    const path = `screenshots/${uuid.v4()}.jpg`;
    const storageRef = ref(storage, path);

    const metadata = {
      contentType: 'image/jpeg',
    };

    const uploadTask = await uploadBytesResumable(
      storageRef,
      blob,
      metadata
    );

    const url = await getDownloadURL(uploadTask.ref);

    console.log('✅ Imagen subida. URL:', url);

    return url;
  } catch (err) {
    console.error('❌ Error uploading image:', JSON.stringify(err));
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
      reject(new TypeError('❌ Network request failed al obtener blob'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);

    // Este header puede ayudar en algunos Android
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.send(null);
  });
}



