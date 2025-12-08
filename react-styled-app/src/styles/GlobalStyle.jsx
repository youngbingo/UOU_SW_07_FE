import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* 폰트는 index.html에서 link 태그로 로드합니다. */

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    width: 100%;
  }

  body {
    /* 기본(본문/디테일): Inter 우선, 한글/백업은 Pretendard */
    font-family: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 제목(큰 텍스트): Pretendard 우선 */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Pretendard', 'Inter', sans-serif;
    font-weight: 700;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: inherit; /* 버튼도 기본 폰트(Inter) 상속 */
    cursor: pointer;
  }
  
  /* React Calendar Custom Style Overrides */
  .react-calendar {
    width: 100%;
    border: none;
    background: transparent;
    font-family: inherit;
  }
`;

export default GlobalStyle;
