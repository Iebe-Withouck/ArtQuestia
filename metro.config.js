const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

// Use react-native-svg-transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// 3D model formats for Viro / GLTF
const extraAssetExts = [
  'obj',
  'mtl',
  'JPG',
  'jpg',
  'png',
  'vrx',
  'hdr',
  'gltf',
  'glb',
  'bin',
  'arobject',
  'gif',
];

config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, ...extraAssetExts])
);

module.exports = config;