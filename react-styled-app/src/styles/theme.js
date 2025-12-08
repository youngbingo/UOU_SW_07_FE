const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#50a46a', // 요청하신 메인 컬러 (차분한 초록)
    secondary: '#8BC34A', // 보조 컬러 (밝은 연두)
    background: '#F5F7F6', // 아주 연한 초록빛이 감도는 회색 배경
    surface: '#FFFFFF',
    text: '#2C3330', // 약간의 초록기가 감도는 짙은 회색
    textSecondary: '#6E7572',
    border: '#E1E4E8',
    danger: '#E57373',
    success: '#50a46a',
    gray: '#EFF2F0',
  },
  fontSizes: {
    xs: '12px',
    small: '14px',
    medium: '16px',
    large: '20px',
    xlarge: '24px',
    xl: '24px',
    xxl: '32px',
  },
  spacing: {
    xs: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xl: '32px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    circle: '50%',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  device: {
    mobile: `(max-width: 768px)`,
    tablet: `(max-width: 1024px)`,
  },
};

const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    primary: '#6ECF8B', // 다크 모드에서는 가독성을 위해 조금 더 밝은 톤
    secondary: '#AED581',
    background: '#191C1A', // 아주 어두운 녹회색
    surface: '#232725', // 카드 배경
    text: '#E0E2E1', // 밝은 회색 텍스트
    textSecondary: '#9EA3A0',
    border: '#3A3F3C',
    gray: '#2F3331', // hover 배경 등
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
    large: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
};

export { lightTheme, darkTheme };
export default lightTheme; // 기본값
