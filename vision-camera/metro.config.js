const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extender la configuración existente
config.resolver.assetExts.push('tflite');

module.exports = config; 