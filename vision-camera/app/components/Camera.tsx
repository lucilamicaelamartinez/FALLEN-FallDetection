// components/CameraComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';
import { useAppContext } from '../../contexts/AppContext';

const { width: W, height: H } = Dimensions.get('window');

/* ───── parámetros ───── */
const HORIZONTAL_FRAMES_TOL = 5;
const GAP_FRAMES_TOL        = 2;
const MISSING_FRAMES_TOL    = 6;
const KEYPOINT_SCORE_MIN    = 0.30;
const MIN_GOOD_KP           = 5;

/* ───── tipos ───── */
interface Detection {
  left:number; top:number; right:number; bottom:number;
  confidence:number; class:string; posture:'de_pie'|'horizontal';
}

/* ───── refs ───── */
let lastPosture: Detection['posture'] = 'de_pie';
const horizStartRef    = { current:null as number|null };
const horizFramesRef   = { current:0 };
const gapFramesRef     = { current:0 };
const missingFramesRef = { current:0 };

export default function CameraComponent() {
  const { hasPermission: camOK, requestPermission: askCam } = useCameraPermission();
  const { hasPermission: micOK, requestPermission: askMic } = useMicrophonePermission();
  const device = useCameraDevice('back');

  const { waitingMs, reportFall, addScreenshot } = useAppContext();

  const cameraRef = useRef<Camera>(null);
  const hasReportedRef = useRef(false);

  const [isActive, setIsActive] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const poseModel = useTensorflowModel(
    require('../../assets/models/movenet_lightning_int8.tflite'),
  );
  const model = poseModel.state === 'loaded' ? poseModel.model : undefined;
  const { resize } = useResizePlugin();

  const setDetectionsJS = useRunOnJS(setDetections, [setDetections]);
  const setShowAlertJS  = useRunOnJS(setShowAlert , [setShowAlert]);

  useEffect(() => {
    (async () => {
      if (!camOK) await askCam();
      if (!micOK) await askMic();
    })();
  }, [camOK, micOK]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!model) return;

    const img = resize(frame, {
      scale:{ width:192, height:192 },
      pixelFormat:'rgb',
      dataType:'uint8',
      rotation:'90deg',
    });
    if (!img?.length) return;

    const out = model.runSync([img])[0];
    const raw = out.data ?? out;
    if (!raw || raw.length !== 51) return;

    const kp = Array.from({ length: 17 }, (_, i) => ({
      y: raw[i * 3],
      x: raw[i * 3 + 1],
      score: raw[i * 3 + 2],
    })).filter(k => k.score > KEYPOINT_SCORE_MIN);

    if (kp.length < MIN_GOOD_KP) {
      missingFramesRef.current++;
      if (missingFramesRef.current <= MISSING_FRAMES_TOL) return;
      horizStartRef.current = null; horizFramesRef.current = 0; gapFramesRef.current = 0;
      missingFramesRef.current = 0;
      setShowAlertJS(false); setDetectionsJS([]); return;
    }
    missingFramesRef.current = 0;

    const xs = kp.map(k => k.x), ys = kp.map(k => k.y);
    const aspect = (Math.max(...ys) - Math.min(...ys)) /
                   (Math.max(...xs) - Math.min(...xs));

    let posture = lastPosture;
    if (aspect > 1.1) posture = 'de_pie';
    else if (aspect < 0.8) posture = 'horizontal';

    const now = Date.now();
    if (posture === 'horizontal') {
      gapFramesRef.current = 0;
      horizFramesRef.current++;
      if (horizFramesRef.current >= HORIZONTAL_FRAMES_TOL) {
        if (horizStartRef.current === null) {
          horizStartRef.current = now;
        } else if (now - horizStartRef.current >= waitingMs && !showAlert) {
          setShowAlertJS(true);
        }
      }
    } else {
      gapFramesRef.current++;
      if (gapFramesRef.current > GAP_FRAMES_TOL) {
        horizStartRef.current = null; horizFramesRef.current = 0; gapFramesRef.current = 0;
        setShowAlertJS(false);
      }
    }
    lastPosture = posture;

    setDetectionsJS([{
      left: Math.max(0, Math.min(...xs)),
      top: Math.max(0, Math.min(...ys)),
      right: Math.min(1, Math.max(...xs)),
      bottom: Math.min(1, Math.max(...ys)),
      confidence: Math.min(...kp.map(k => k.score)),
      class: 'persona', posture,
    }]);
  }, [model, resize, waitingMs, setDetectionsJS, setShowAlertJS]);

  useEffect(() => {
    if (showAlert && !hasReportedRef.current) {
      hasReportedRef.current = true;

      (async () => {
        const eventId = await reportFall();
        const photo = await cameraRef.current?.takePhoto({
          qualityPrioritization: 'balanced',
        });
        if (photo?.path && eventId) {
          await addScreenshot(`file://${photo.path}`, eventId);
        }
      })().catch(console.warn);
    }
    if (!showAlert) hasReportedRef.current = false;
  }, [showAlert, waitingMs]);

  if (!camOK || !device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={askCam}>
          <Text style={styles.buttonText}>Grant camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        frameProcessorFps={15}
        photo={true}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsActive(p => !p)}
        >
          <Text style={styles.buttonText}>
            {isActive ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>People: {detections.length}</Text>
        {showAlert && (
          <Text style={[styles.statsText, { backgroundColor: '#FF5555' }]}>⚠ Fall detected</Text>
        )}
      </View>

      {detections.map((d, i) => (
        <View
          key={i}
          style={[
            styles.detectionBox,
            {
              left: d.left * W,
              top: d.top * H,
              width: (d.right - d.left) * W,
              height: (d.bottom - d.top) * H,
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
  container:{ flex:1, backgroundColor:'black' },
  text:{ color:'white', textAlign:'center', marginTop:20 },
  controls:{ position:'absolute', bottom:40, left:0, right:0, alignItems:'center' },
  button:{ backgroundColor:'rgba(255,255,255,0.3)', padding:15, borderRadius:8 },
  buttonText:{ color:'white', fontSize:16 },
  stats:{ position:'absolute', top:40, left:0, right:0, alignItems:'center', gap:8 },
  statsText:{ color:'white', padding:8, backgroundColor:'rgba(0,0,0,0.5)', borderRadius:8 },
  detectionBox:{ position:'absolute', borderWidth:2, backgroundColor:'rgba(255,255,255,0.1)' },
  detectionText:{ color:'white', fontSize:12, backgroundColor:'rgba(0,0,0,0.7)', padding:2 },
});












