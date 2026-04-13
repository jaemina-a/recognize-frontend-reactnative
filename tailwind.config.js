/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{tsx,ts}',
    './src/**/*.{tsx,ts}',
    './design/**/*.{tsx,ts}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // TODO: 디자인 확정 후 커스텀 컬러 추가
      colors: {
        primary: { DEFAULT: '#000000' },
      },
      // TODO: 폰트 에셋 추가 후 활성화
      fontFamily: {
        // pretendard: ['Pretendard-Regular'],
        // 'pretendard-medium': ['Pretendard-Medium'],
        // 'pretendard-semibold': ['Pretendard-SemiBold'],
        // 'pretendard-bold': ['Pretendard-Bold'],
      },
    },
  },
  plugins: [],
};
