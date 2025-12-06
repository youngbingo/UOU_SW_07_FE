const theme = {
  colors: {
    primary: '#4A90E2', // 신뢰감 있는 블루 (캘린더/강조)
    secondary: '#F5A623', // 포인트 (마감일, 중요 알림)
    background: '#F8F9FA', // 눈이 편안한 연회색 배경
    surface: '#FFFFFF', // 카드/컨테이너 배경
    text: '#333333', // 기본 텍스트
    textSecondary: '#666666', // 부가 텍스트
    border: '#E1E4E8', // 구분선
    danger: '#E74C3C', // 삭제/경고
    success: '#2ECC71', // 완료
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

export default theme;
