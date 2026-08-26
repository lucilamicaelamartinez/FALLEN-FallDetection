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
import { uploadImageAsync } from '../../utils/uploadImage';
import { useKeepAwake } from 'expo-keep-awake'; // 💤 para mantener pantalla encendida

const { width: W, height: H } = Dimensions.get('window');

/* ───── parámetros ───── */
const HORIZONTAL_FRAMES_TOL = 5;
const GAP_FRAMES_TOL        = 2;
const MISSING_FRAMES_TOL    = 6;
const KEYPOINT_SCORE_MIN    = 0.30;
const MIN_GOOD_KP           = 5;

/* ───── tipos ───── */
interface Detection {
  left:number;
  top:number;
  right:number;
  bottom:number;
  confidence:number;
  class:string;
  posture:'de_pie'|'horizontal';
}

/* ───── refs ───── */
let lastPosture: Detection['posture'] = 'de_pie';
const horizStartRef    = { current:null as number|null };
const horizFramesRef   = { current:0 };
const gapFramesRef     = { current:0 };
const missingFramesRef = { current:0 };

export default function CameraComponent() {
  useKeepAwake(); // 💤 evita que la pantalla se apague mientras la app está en primer plano

  const {
    hasPermission: camOK,
    requestPermission: askCam,
  } = useCameraPermission();

  const {
    hasPermission: micOK,
    requestPermission: askMic,
  } = useMicrophonePermission();

  const device = useCameraDevice('back');

  const {
    waitingMs,
    reportFall,
    addScreenshot,
  } = useAppContext();

  const cameraRef = useRef<Camera>(null);
  const hasReportedRef = useRef(false);

  const [isActive, setIsActive] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const poseModel = useTensorflowModel(
    require('../../assets/models/movenet_lightning_int8.tflite'),
  );

  const model =
    poseModel.state === 'loaded'
      ? poseModel.model
      : undefined;

  const { resize } = useResizePlugin();

  const setDetectionsJS =
    useRunOnJS(setDetections, [setDetections]);

  const setShowAlertJS =
    useRunOnJS(setShowAlert, [setShowAlert]);

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
      scale: {
        width: 192,
        height: 192,
      },
      pixelFormat: 'rgb',
      dataType: 'uint8',
      rotation: '90deg',
    });

    if (!img?.length) return;

    const out = model.runSync([img])[0];
    const raw = out.data ?? out;

    if (!raw || raw.length !== 51) return;

    const kp = Array.from(
      { length: 17 },
      (_, i) => ({
        y: raw[i * 3],
        x: raw[i * 3 + 1],
        score: raw[i * 3 + 2],
      })
    ).filter(
      k => k.score > KEYPOINT_SCORE_MIN
    );

    if (kp.length < MIN_GOOD_KP) {
      missingFramesRef.current++;

      if (
        missingFramesRef.current <=
        MISSING_FRAMES_TOL
      ) {
        return;
      }

      horizStartRef.current = null;
      horizFramesRef.current = 0;
      gapFramesRef.current = 0;

      missingFramesRef.current = 0;

      setShowAlertJS(false);
      setDetectionsJS([]);

      return;
    }

    missingFramesRef.current = 0;

    const xs = kp.map(k => k.x);
    const ys = kp.map(k => k.y);

    const aspect =
      (Math.max(...ys) - Math.min(...ys)) /
      (Math.max(...xs) - Math.min(...xs));

    let posture = lastPosture;

    if (aspect > 1.1) {
      posture = 'de_pie';
    } else if (aspect < 0.8) {
      posture = 'horizontal';
    }

    const now = Date.now();

    // 🟨 Detectar caída aunque posture sea "de_pie" si está colapsado en el piso
    const personBottom = Math.max(...ys);
    const personTop = Math.min(...ys);
    const personHeight =
      personBottom - personTop;

    const verticalFall =
      posture === 'de_pie' &&
      personBottom > 0.9 &&
      personHeight < 0.5;

    if (
      posture === 'horizontal' ||
      verticalFall
    ) {
      gapFramesRef.current = 0;
      horizFramesRef.current++;

      if (
        horizFramesRef.current >=
        HORIZONTAL_FRAMES_TOL
      ) {
        if (
          horizStartRef.current === null
        ) {
          horizStartRef.current = now;
        } else if (
          now - horizStartRef.current >=
            waitingMs &&
          !showAlert
        ) {
          setShowAlertJS(true);
        }
      }
    } else {
      gapFramesRef.current++;

      if (
        gapFramesRef.current >
        GAP_FRAMES_TOL
      ) {
        horizStartRef.current = null;
        horizFramesRef.current = 0;
        gapFramesRef.current = 0;

        setShowAlertJS(false);
      }
    }

    lastPosture = posture;

    setDetectionsJS([
      {
        left: Math.max(
          0,
          Math.min(...xs)
        ),
        top: Math.max(
          0,
          Math.min(...ys)
        ),
        right: Math.min(
          1,
          Math.max(...xs)
        ),
        bottom: Math.min(
          1,
          Math.max(...ys)
        ),
        confidence: Math.min(
          ...kp.map(k => k.score)
        ),
        class: 'persona',
        posture,
      },
    ]);
  }, [
    model,
    resize,
    waitingMs,
    setDetectionsJS,
    setShowAlertJS,
  ]);

  useEffect(() => {
    if (
      showAlert &&
      !hasReportedRef.current
    ) {
      hasReportedRef.current = true;

      (async () => {
        const eventId =
          await reportFall();

        const photo =
          await cameraRef.current?.takePhoto({
            qualityPrioritization:
              'balanced',
          });

        if (
          photo?.path &&
          eventId
        ) {
          const remoteUrl =
            await uploadImageAsync(
              `file://${photo.path}`
            );

          if (remoteUrl) {
            await addScreenshot(
              remoteUrl,
              eventId
            );
          }
        }
      })().catch(console.warn);
    }

    if (!showAlert) {
      hasReportedRef.current = false;
    }
  }, [showAlert, waitingMs]);

  if (!camOK || !device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Camera permission required
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={askCam}
        >
          <Text style={styles.buttonText}>
            Grant camera
          </Text>
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
          onPress={() =>
            setIsActive(p => !p)
          }
        >
          <Text style={styles.buttonText}>
            {isActive
              ? 'Pause'
              : 'Resume'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Personas detectadas */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          People: {detections.length}
        </Text>
      </View>

      {/* Alerta centrada */}
      {showAlert && (
        <View
          style={
            styles.fallAlertContainer
          }
          pointerEvents="none"
        >
          <View style={styles.fallAlert}>
            <Text
              style={
                styles.fallAlertIcon
              }
            >
              ⚠
            </Text>

            <View>
              <Text
                style={
                  styles.fallAlertTitle
                }
              >
                Fall detected
              </Text>

              <Text
                style={
                  styles.fallAlertSubtitle
                }
              >
                Emergency alert sent
              </Text>
            </View>
          </View>
        </View>
      )}

      {detections.map((d, i) => (
        <View
          key={i}
          style={[
            styles.detectionBox,
            {
              left: d.left * W,
              top: d.top * H,
              width:
                (d.right - d.left) * W,
              height:
                (d.bottom - d.top) * H,

              borderColor:
                d.posture ===
                'horizontal'
                  ? 'red'
                  : 'green',
            },
          ]}
        >
          <Text
            style={
              styles.detectionText
            }
          >
            {Math.round(
              d.confidence * 100
            )}
            %
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07172E',
  },

  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 80,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  controls: {
    position: 'absolute',
    bottom: 42,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },

  button: {
    backgroundColor:
      'rgba(7, 23, 46, 0.88)',

    paddingVertical: 14,
    paddingHorizontal: 30,

    borderRadius: 18,
    borderWidth: 1,

    borderColor:
      'rgba(78, 215, 230, 0.65)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.28,
    shadowRadius: 8,

    elevation: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  stats: {
    position: 'absolute',
    top: 48,
    left: 18,
    right: 18,

    alignItems: 'flex-start',

    zIndex: 20,
  },

  statsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',

    paddingVertical: 9,
    paddingHorizontal: 14,

    backgroundColor:
      'rgba(7, 23, 46, 0.82)',

    borderRadius: 14,

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.22,
    shadowRadius: 5,

    elevation: 4,
  },

  /* ───────── FALL DETECTED ───────── */

  fallAlertContainer: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 50,

    paddingHorizontal: 28,
  },

  fallAlert: {
    width: '100%',
    maxWidth: 330,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      'rgba(179, 42, 58, 0.95)',

    borderRadius: 20,

    paddingVertical: 17,
    paddingHorizontal: 20,

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.28)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,

    elevation: 10,
  },

  fallAlertIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    marginRight: 15,
  },

  fallAlertTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  fallAlertSubtitle: {
    color:
      'rgba(255,255,255,0.78)',

    fontSize: 12,
    marginTop: 3,
  },

  /* ───────── DETECCIÓN ───────── */

  detectionBox: {
    position: 'absolute',

    borderWidth: 2.5,
    borderRadius: 12,

    backgroundColor:
      'rgba(78, 215, 230, 0.07)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 3,
  },

  detectionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',

    backgroundColor:
      'rgba(7, 23, 46, 0.90)',

    paddingVertical: 5,
    paddingHorizontal: 8,

    alignSelf: 'flex-start',

    borderTopLeftRadius: 9,
    borderBottomRightRadius: 9,

    overflow: 'hidden',
  },
});














