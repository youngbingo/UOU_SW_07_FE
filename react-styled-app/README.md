# D.note - 디지털 필기 & 협업 노트 애플리케이션

React와 Firebase 기반의 실시간 협업 노트 앱입니다. 텍스트 입력과 손글씨 필기를 모두 지원하며, 팀 프로젝트를 위한 협업 기능을 제공합니다.

## 🌟 주요 특징

### 🔄 **스마트 동기화 시스템**
- **비로그인 사용 가능**: 로그인 없이도 모든 기능 사용 가능 (로컬 저장)
- **자동 백업**: 로그인 시 로컬 데이터 자동으로 클라우드에 백업
- **오프라인 지원**: 인터넷 없이도 완전히 작동
- **실시간 동기화**: 온라인 전환 시 자동으로 데이터 동기화
- **오프라인 큐**: 오프라인에서 작업한 내용을 온라인 시 자동 업로드
- **다중 기기 동기화**: 여러 기기에서 동일한 데이터 접근

## 주요 기능

### 📝 노트 작성
- **텍스트 입력 모드**: 리치 텍스트 에디터 (굵게, 기울임, 밑줄, 색상 등)
- **손글씨 모드**: 펜, 형광펜, 지우개, 이미지 편집
- **템플릿 지원**: 
  - 텍스트: 회의록, 학습/개발 일지, 체크리스트 (예시 포함)
  - 손글씨: 무지, 줄글, 모눈종이, 코넬 노트
- **이미지 편집**: 사진 첨부, 크기 조절, 회전, 삭제
- **PDF 필기**: PDF 파일 위에 직접 필기 가능
- **자동 제목 생성**: 날짜 + 순서로 자동 제목 (예: 2025-12-08 노트 1)

### 📅 일정 관리
- **캘린더**: 날짜별 노트 확인 및 메모 점 표시
- **시간표**: 수업 시간표 작성 (시간 범위 설정 가능)
- **과목 기반 관리**: 시간표 과목으로 자동 분류 및 필터링

### 👥 팀 협업
- **팀 생성**: 팀 프로젝트 공간 생성
- **실시간 동기화**: Firebase 기반 실시간 문서 공유
- **멤버 초대**: 팀 코드를 통한 멤버 초대

### 🔐 인증 (선택 사항)
- Firebase Authentication 기반 로그인
- 구글 소셜 로그인 지원
- **로그인 없이도 로컬 스토리지로 사용 가능**
- 로그인 시 자동 클라우드 백업

### 🎨 UI/UX
- **테마**: 라이트/다크 모드 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 대응
- **웹앱 스타일 모달**: 모든 확인창을 커스텀 모달로 구현
- **동기화 상태 표시**: 실시간 온라인/오프라인 상태 표시

## 기술 스택

- **Frontend**: React 18, Vite
- **Styling**: Styled Components
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Drawing**: Konva (Canvas 기반)
- **PDF**: react-pdf
- **Icons**: React Icons
- **Calendar**: react-calendar

## 시작하기

### 사전 요구사항
- Node.js 16 이상
- Firebase 프로젝트 생성 필요

### 설치

\`\`\`bash
# 저장소 클론
git clone <repository-url>
cd react-styled-app

# 의존성 설치
npm install
\`\`\`

### 환경 변수 설정

루트 디렉토리에 \`.env\` 파일을 생성하고 Firebase 설정을 추가하세요:

\`\`\`env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 http://localhost:5173 접속

### 빌드

\`\`\`bash
npm run build
\`\`\`

## 프로젝트 구조

\`\`\`
src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── AlertModal.jsx
│   ├── ConfirmModal.jsx
│   ├── PromptModal.jsx
│   ├── CreateNoteModal.jsx
│   ├── Layout.jsx
│   ├── LoginModal.jsx
│   └── ProtectedRoute.jsx
├── pages/              # 페이지 컴포넌트
│   ├── CalendarPage.jsx
│   ├── NotePage.jsx
│   ├── NoteListPage.jsx
│   ├── TeamSpacePage.jsx
│   └── SignUpPage.jsx
├── context/            # React Context
│   └── AuthContext.jsx
├── utils/              # 유틸리티 함수
│   └── storage.js      # Firebase & 로컬 스토리지 관리
├── styles/             # 전역 스타일
│   ├── GlobalStyle.jsx
│   └── theme.js
└── firebase.js         # Firebase 초기화
\`\`\`

## 주요 페이지

- **/** : 메인 (캘린더 & 시간표)
- **/notes** : 전체 노트 목록
- **/note/:id** : 노트 편집 페이지
- **/team/:teamId** : 팀 스페이스
- **/signup** : 회원가입

## 데이터 저장

### 하이브리드 스토리지 전략

1. **로컬 스토리지 (Primary)**
   - 즉시 저장 및 빠른 로딩
   - 오프라인 완전 지원
   - 브라우저 캐시 활용

2. **Firebase Firestore (Sync & Backup)**
   - 로그인 시 자동 클라우드 백업
   - 다중 기기 동기화
   - 데이터 유실 방지

3. **오프라인 큐 시스템**
   - 오프라인 작업 자동 큐잉
   - 온라인 전환 시 자동 업로드
   - 30초마다 자동 동기화

4. **실시간 동기화**
   - Firebase `onSnapshot`을 통한 실시간 업데이트
   - 팀 문서 실시간 협업
   - 자동 충돌 해결

### 동기화 흐름

```
[비로그인 사용]
로컬 스토리지만 사용 → 모든 기능 완전 작동

[로그인]
1. 로그인 시: 로컬 데이터 → Firebase 자동 백업
2. 노트 작성: 로컬 저장 (즉시) → Firebase 동기화 (백그라운드)
3. 오프라인: 로컬에만 저장 → 큐에 추가
4. 온라인 전환: 큐 자동 처리 → Firebase 업로드

[다중 기기]
기기 A 변경 → Firebase 실시간 전파 → 기기 B 자동 업데이트
```

## 브라우저 지원

- Chrome, Edge (권장)
- Firefox
- Safari

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 개발자

Software Engineering Project
