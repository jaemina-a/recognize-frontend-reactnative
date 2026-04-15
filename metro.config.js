const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Zustand v5의 ESM 버전이 import.meta.env를 사용하는데,
// Metro 번들은 <script type="module">이 아니라 일반 스크립트로 로드되어 SyntaxError 발생.
// 'react-native' condition을 우선 적용해 CJS 버전을 사용하도록 설정.
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = withNativeWind(config, { input: './global.css' });
