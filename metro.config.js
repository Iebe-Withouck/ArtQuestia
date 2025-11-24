const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

// Use react-native-svg-transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// Ensure GLB files are recognized as assets
if (!config.resolver.assetExts.includes('glb')) {
  config.resolver.assetExts.push('glb');
}

// ✅ Ensure VRX files are recognized as assets
if (!config.resolver.assetExts.includes('vrx')) {
  config.resolver.assetExts.push('vrx');
}

module.exports = config;