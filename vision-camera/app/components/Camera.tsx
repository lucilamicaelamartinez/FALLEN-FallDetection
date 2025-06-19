import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Detection {
  left: number;
  top: number;
  right: number;
  bottom: number;
  confidence: number;
  class: string;
  posture: 'de_pie' | 'horizontal';
}

let posturaAnterior: Detection['posture'] = 'de_pie';
const TIEMPO_UMBRAL_MS = 20000;
const horizontalStartTimeRef = { current: null as number | null };

export default function CameraComponent() {
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const poseModel = useTensorflowModel(require('../../assets/models/movenet_lightning_int8.tflite'));
  const model = poseModel.state === 'loaded' ? poseModel.model : undefined;
  const { resize } = useResizePlugin();

  const setDetectionsJS = useRunOnJS(setDetections, [setDetections]);
  const setShowAlertJS = useRunOnJS(setShowAlert, [setShowAlert]);

  useEffect(() => {
    (async () => {
      if (!hasCameraPermission) {
        console.log('[Permisos] Solicitando permiso de cámara');
        await requestCameraPermission();
      }
      if (!hasMicrophonePermission) {
        console.log('[Permisos] Solicitando permiso de micrófono');
        await requestMicrophonePermission();
      }
    })();
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (!model) {
      console.log('🚫 Modelo aún no cargado');
      return;
    }

    try {
      const resized = resize(frame, {
        scale: { width: 192, height: 192 },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      });

      if (!resized || !resized.length) {
        console.log('⛔️ Frame vacío tras resize');
        return;
      }

      const output = model.runSync([resized])[0];
      const raw = output.data ?? output;
      if (!raw || raw.length !== 51) {
        console.log('⛔️ Salida inesperada del modelo');
        return;
      }

      const keypoints: { x: number; y: number; score: number }[] = [];
      for (let i = 0; i < 17; i++) {
        keypoints.push({
          y: raw[i * 3],
          x: raw[i * 3 + 1],
          score: raw[i * 3 + 2],
        });
      }

      const buenos = keypoints.filter(kp => kp.score > 0.3);
      if (buenos.length < 6) {
        console.log('❌ No se detecta persona fiable');
        horizontalStartTimeRef.current = null;
        setShowAlertJS(false);
        setDetectionsJS([]);
        return;
      }

      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const kp of buenos) {
        if (kp.x < minX) minX = kp.x;
        if (kp.y < minY) minY = kp.y;
        if (kp.x > maxX) maxX = kp.x;
        if (kp.y > maxY) maxY = kp.y;
      }

      const width = maxX - minX;
      const height = maxY - minY;
      const aspect = height / width;

      let posturaActual: 'de_pie' | 'horizontal' = posturaAnterior;
      if (aspect > 1.1) posturaActual = 'de_pie';
      else if (aspect < 0.8) posturaActual = 'horizontal';

      const bestDetection: Detection = {
        left: minX,
        top: minY,
        right: maxX,
        bottom: maxY,
        confidence: Math.min(...buenos.map(k => k.score)),
        class: 'persona',
        posture: posturaActual,
      };

      console.log(`✅ Persona detectada - postura: ${posturaActual}`);
      const ahora = Date.now();

      if (posturaActual === 'horizontal') {
        if (horizontalStartTimeRef.current === null) {
          horizontalStartTimeRef.current = ahora;
          console.log('🕒 Temporizador de caída iniciado');
        } else {
          const elapsed = ahora - horizontalStartTimeRef.current;
          console.log(`⏱️ Tiempo horizontal: ${elapsed}ms`);
          if (elapsed >= TIEMPO_UMBRAL_MS && !showAlert) {
            console.log('⚠️ CAÍDA DETECTADA');
            setShowAlertJS(true);
          }
        }
      } else {
        if (horizontalStartTimeRef.current !== null) {
          console.log('🔁 Reiniciando temporizador (persona ya no está horizontal)');
        }
        horizontalStartTimeRef.current = null;
        setShowAlertJS(false);
      }

      posturaAnterior = posturaActual;
      console.log(`📦 Detección enviada a JS: postura=${posturaActual}, score=${Math.round(bestDetection.confidence * 100)}%`);
      setDetectionsJS([bestDetection]);
    } catch (err) {
      console.error('❌ Error en el procesamiento del frame:', err);
    }
  }, [model, resize, setDetectionsJS, setShowAlertJS]);

  if (!hasCameraPermission || !device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permiso de cámara no otorgado o no se encontró cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Solicitar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={false}
        video={false}
        pixelFormat="rgb"
        frameProcessor={frameProcessor}
        frameProcessorFps={15}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => {
          console.log(`[UI] Cámara ${isActive ? 'pausada' : 'activada'}`);
          setIsActive(!isActive);
        }}>
          <Text style={styles.buttonText}>{isActive ? 'Pausar' : 'Activar'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statsText}>Personas detectadas: {detections.length}</Text>
        {showAlert && (
          <Text style={[styles.statsText, { backgroundColor: '#FF5555' }]}>⚠️ Caída detectada</Text>
        )}
      </View>
      {detections.map((d, index) => (
        <View
          key={index}
          style={[
            styles.detectionBox,
            {
              left: d.left * screenWidth,
              top: d.top * screenHeight,
              width: (d.right - d.left) * screenWidth,
              height: (d.bottom - d.top) * screenHeight,
              borderColor: d.posture === 'horizontal' ? 'red' : 'green',
            },
          ]}
        >
          <Text style={styles.detectionText}>{Math.round(d.confidence * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  stats: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  detectionText: {
    color: 'white',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    position: 'absolute',
    top: -20,
  },
});







































