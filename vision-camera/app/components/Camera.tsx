import React, { useEffect, useRef, useState } from 'react';
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
import { useAppContext } from '../../contexts/AppContext';

const { width: W, height: H } = Dimensions.get('window');

/* ───── PARÁMETROS DE LA HEURÍSTICA ─────────────────────────── */
const TIME_THRESHOLD_MS = 10_000;   // ← cambia a 15_000 en prod
const HORIZONTAL_FRAMES_TOL    = 5;       // frames continuos para arrancar cronómetro
const GAP_FRAMES_TOL           = 2;       // frames “verticales” tolerados
const MISSING_FRAMES_TOL       = 6;       // frames sin keypoints antes de reset
const KEYPOINT_SCORE_MIN       = 0.30;    // confianza mínima de un keypoint
const MIN_GOOD_KP              = 5;       // # kp con buena confianza

/* ───── TIPOS ───────────────────────────────────────────────── */
interface Detection {
  left: number;  top: number;  right: number;  bottom: number;
  confidence: number; class: string; posture: 'de_pie' | 'horizontal';
}

/* ───── REFS COMPARTIDOS ENTRE FRAMES (worklet safe) ────────── */
let lastPosture: Detection['posture'] = 'de_pie';

const horizStartRef     = { current: null as number | null };
const horizFramesRef    = { current: 0 };
const gapFramesRef      = { current: 0 };
const missingFramesRef  = { current: 0 };

export default function CameraComponent() {
  /* ── permisos ─────────────────────────────────────────────── */
  const { hasPermission: camOK, requestPermission: askCam }   = useCameraPermission();
  const { hasPermission: micOK, requestPermission: askMic }   = useMicrophonePermission();
  const device = useCameraDevice('back');

  /* ── estado React ─────────────────────────────────────────── */
  const [isActive,   setIsActive]   = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [showAlert,  setShowAlert]  = useState(false);

  /* ── contexto ─────────────────────────────────────────────── */
  const { reportFall }      = useAppContext();
  const hasReportedRef      = useRef(false);

  /* ── modelo y plugins ─────────────────────────────────────── */
  const poseModel = useTensorflowModel(require('../../assets/models/movenet_lightning_int8.tflite'));
  const model     = poseModel.state === 'loaded' ? poseModel.model : undefined;
  const { resize } = useResizePlugin();

  /* ── bridges worklet → JS ─────────────────────────────────── */
  const setDetectionsJS = useRunOnJS(setDetections, [setDetections]);
  const setShowAlertJS  = useRunOnJS(setShowAlert,  [setShowAlert]);

  /* ── pedir permisos ───────────────────────────────────────── */
  useEffect(() => { (async()=>{ if(!camOK) await askCam(); if(!micOK) await askMic(); })(); }, []);

  /* ───────────────── FRAME PROCESSOR (worklet) ─────────────── */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!model) return;

    /* 1 · resize */
    const img = resize(frame, {
      scale: { width:192, height:192 },
      pixelFormat:'rgb', dataType:'uint8', rotation:'90deg',
    });
    if (!img?.length) return;

    /* 2 · inference */
    const out = model.runSync([img])[0];
    const raw = out.data ?? out;
    if (!raw || raw.length !== 51) return;

    /* 3 · keypoints filtrados */
    const kp = Array.from({length:17},(_,i)=>({
      y:raw[i*3], x:raw[i*3+1], score:raw[i*3+2],
    })).filter(k=>k.score > KEYPOINT_SCORE_MIN);

    /* 4 · manejo de frames “vacíos” */
    if (kp.length < MIN_GOOD_KP) {                    // pocos puntos confiables
      missingFramesRef.current += 1;
      if (missingFramesRef.current <= MISSING_FRAMES_TOL) {
        console.log('⏳ missingFrames', missingFramesRef.current);
        /* no reseteamos: se mantiene la lógica */
        return;
      }
      console.log('⚠️ reset (missingFrames > tol)');
      horizStartRef.current  = null;
      horizFramesRef.current = 0;
      gapFramesRef.current   = 0;
      missingFramesRef.current = 0;
      setShowAlertJS(false);
      setDetectionsJS([]);
      return;
    }
    /* si llegamos aquí, tenemos keypoints suficientes */
    missingFramesRef.current = 0;

    /* 5 · bounding box y postura */
    const xs = kp.map(k=>k.x), ys = kp.map(k=>k.y);
    const minX=Math.min(...xs), maxX=Math.max(...xs);
    const minY=Math.min(...ys), maxY=Math.max(...ys);
    const aspect = (maxY-minY) / (maxX-minX);

    let posture: Detection['posture'] = lastPosture;
    if (aspect > 1.1) posture = 'de_pie';
    else if (aspect < 0.8) posture = 'horizontal';

    /* 6 · heurística de caída */
    const now = Date.now();

    if (posture === 'horizontal') {
      gapFramesRef.current = 0;
      horizFramesRef.current += 1;
      console.log('📊 horizFrames', horizFramesRef.current);

      if (horizFramesRef.current >= HORIZONTAL_FRAMES_TOL) {
        if (horizStartRef.current === null) {
          horizStartRef.current = now;
          console.log('🕒 Timer start @', now);
        } else {
          const elapsed = now - horizStartRef.current;
          console.log('⏱ elapsed=', elapsed, 'ms');
          if (elapsed >= TIME_THRESHOLD_MS && !showAlert) {
            console.log('🚨 CAÍDA DETECTADA');
            setShowAlertJS(true);
          }
        }
      }
    } else { /* posture == de_pie */
      gapFramesRef.current += 1;
      if (gapFramesRef.current > GAP_FRAMES_TOL) {
        console.log('🔄 reset gap (gapFrames=', gapFramesRef.current, ')');
        horizStartRef.current  = null;
        horizFramesRef.current = 0;
        gapFramesRef.current   = 0;
        setShowAlertJS(false);
      } else {
        console.log('🕳 gapFrames', gapFramesRef.current);
      }
    }
    lastPosture = posture;

    /* 7 · enviar detección al hilo JS */
    setDetectionsJS([{
      left:minX, top:minY, right:maxX, bottom:maxY,
      confidence: Math.min(...kp.map(k=>k.score)),
      class:'persona', posture,
    }]);
  }, [model, resize, setDetectionsJS, setShowAlertJS]);

  /* ── efecto: cuando showAlert=true ⇒ reportFall ───────────── */
  useEffect(() => {
    if (showAlert && !hasReportedRef.current) {
      hasReportedRef.current = true;
      reportFall().catch(err=>console.warn('reportFall error',err));
    }
    if (!showAlert) hasReportedRef.current = false;
  }, [showAlert]);

  /* ── UI ───────────────────────────────────────────────────── */
  if (!camOK || !device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera permission / no device</Text>
        <TouchableOpacity style={styles.button} onPress={askCam}>
          <Text style={styles.buttonText}>Grant camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        frameProcessorFps={15}
      />
      {/* controles */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={()=>setIsActive(p=>!p)}>
          <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>
      </View>
      {/* stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>People: {detections.length}</Text>
        {showAlert && <Text style={[styles.statsText,{backgroundColor:'#FF5555'}]}>⚠ Fall detected</Text>}
      </View>
      {/* bbox */}
      {detections.map((d,i)=>(
        <View key={i} style={[
          styles.detectionBox,
          {
            left:d.left*W, top:d.top*H,
            width:(d.right-d.left)*W, height:(d.bottom-d.top)*H,
            borderColor:d.posture==='horizontal'?'red':'green',
          }
        ]}>
          <Text style={styles.detectionText}>{Math.round(d.confidence*100)}%</Text>
        </View>
      ))}
    </View>
  );
}

/* ───── styles ─────────────────────────────────────────────── */
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

















































