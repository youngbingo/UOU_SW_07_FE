const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#4A90E2',
    secondary: '#F5A623',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E1E4E8',
    danger: '#E74C3C',
    success: '#2ECC71',
    gray: '#f0f0f0',
  },
  fontSizes: {
    xs: '12px',
    small: '14px',
    medium: '16px',
    large: '20px',
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
    primary: '#64B5F6', // 다크 모드에서는 조금 더 밝은 블루
    secondary: '#FFB74D',
    background: '#121212', // 아주 어두운 회색 (완전 검정보다 눈이 편함)
    surface: '#1E1E1E', // 카드 배경
    text: '#E0E0E0', // 밝은 회색 텍스트
    textSecondary: '#A0A0A0',
    border: '#333333',
    gray: '#2C2C2C', // hover 배경 등
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
    large: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
};

export { lightTheme, darkTheme };
export default lightTheme; // 기본값
