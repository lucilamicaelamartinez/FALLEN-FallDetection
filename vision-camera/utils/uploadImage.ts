import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../libs/firebaseConfig';
import uuid from 'react-native-uuid'; // ✅ compatible con React Native

export async function uploadImageAsync(uri: string): Promise<string | null> {
  try {
    console.log('🧪 URI a subir:', uri);

    const blob = await getBlobFromUri(uri);
    console.log('✅ Blob listo:', blob);
    console.log('📦 Tamaño del blob:', blob.size);

    const path = `screenshots/${uuid.v4()}.jpg`;
    const storageRef = ref(storage, path); // También podrías usar: ref(storage).child(path)

    const metadata = {
      contentType: 'image/jpeg',
    };

    const uploadTask = await uploadBytesResumable(storageRef, blob, metadata);
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




