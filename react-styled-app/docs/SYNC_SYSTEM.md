# 동기화 시스템 상세 문서

## 개요

D.note는 **하이브리드 스토리지 전략**을 사용하여 오프라인 우선, 로그인 선택, 자동 백업을 제공합니다.

## 핵심 기능

### 1. 비로그인 사용 가능
- 로그인 없이도 모든 기능 사용 가능
- 로컬 스토리지에 안전하게 저장
- 브라우저가 데이터 저장소 역할

### 2. 로그인 시 자동 백업
- 로그인하면 기존 로컬 데이터 자동으로 Firebase에 백업
- `syncLocalToFirebase()` 함수가 모든 노트 업로드
- 데이터 유실 걱정 없음

### 3. 오프라인 큐 시스템
```javascript
// 오프라인일 때
저장/삭제 요청 → 로컬 큐에 추가 → 나중에 처리

// 온라인 전환
큐 확인 → Firebase에 순차 업로드 → 큐 비우기
```

### 4. 실시간 동기화
- `subscribeToNote()`: 개별 노트 실시간 구독
- `subscribeToUserNotes()`: 전체 노트 실시간 구독
- Firebase 변경 → 즉시 로컬에 반영

## 저장 키 구조

### 로컬 스토리지
```
note_{noteId}           // 개별 노트 데이터
note_list_{dateStr}     // 날짜별 노트 목록
timetable               // 시간표
timeRange               // 시간 범위
theme                   // 테마 설정
offline_sync_queue      // 오프라인 큐
```

### Firebase Firestore
```
users/{uid}/notes/{noteId}      // 개인 노트
teams/{teamId}/docs/{docId}     // 팀 문서
teams/{teamId}                  // 팀 정보
```

## API 함수

### 저장 함수
- `saveNote(noteId, noteData)`: 노트 저장 (로컬 + Firebase)
- `deleteNote(noteId, dateStr)`: 노트 삭제 (로컬 + Firebase)

### 로드 함수
- `loadNote(noteId)`: 노트 로드 (로컬 우선)
- `loadRecentNotes(count)`: 최근 노트 목록

### 동기화 함수
- `syncLocalToFirebase(uid)`: 전체 로컬 데이터 백업
- `processQueue()`: 오프라인 큐 처리
- `subscribeToNote(noteId, callback)`: 실시간 구독
- `subscribeToUserNotes(callback)`: 전체 노트 구독

### 팀 협업 함수
- `createTeam(teamName)`: 팀 생성
- `getUserTeams()`: 내 팀 목록
- `subscribeToTeam(teamId, callback)`: 팀 정보 구독
- `subscribeToTeamDocs(teamId, callback)`: 팀 문서 구독
- `loadTeamNote(teamId, docId)`: 팀 문서 로드
- `saveTeamNote(teamId, docId, noteData)`: 팀 문서 저장

## 자동 동기화 로직

### 초기화 (앱 시작)
```javascript
1. 온라인 상태 확인
2. 로그인 확인
3. 조건 충족 시 자동 동기화 시작 (30초 간격)
```

### 온라인 전환
```javascript
window.addEventListener('online', async () => {
  1. 큐 처리 시작
  2. 자동 동기화 재개
  3. 상태 표시 업데이트
});
```

### 로그인 감지
```javascript
onAuthStateChanged(auth, async (user) => {
  if (user && wasLoggedOut) {
    // 모든 로컬 데이터를 Firebase에 백업
    await syncLocalToFirebase(user.uid);
  }
});
```

## 충돌 해결

### 전략
1. **로컬 우선**: 로컬 변경사항이 항상 우선
2. **타임스탬프 기반**: `updatedAt` 필드로 최신 버전 판단
3. **Firebase가 단일 진실 공급원**: 로그인 후 Firebase가 기준

### 팀 문서
- Firebase만 사용 (로컬 캐시 없음)
- 실시간 동기화로 충돌 최소화
- 마지막 쓰기 승리(Last Write Wins)

## 상태 표시

### SyncStatusIndicator 컴포넌트
```
오프라인: "오프라인 모드" (회색)
동기화 중: "동기화 중..." (초록, 애니메이션)
온라인: 표시 안 함 (깔끔)
```

## 성능 최적화

1. **로컬 우선 로드**: 즉시 UI 표시
2. **백그라운드 동기화**: 사용자 경험 방해 없음
3. **배치 업로드**: 큐를 한 번에 처리
4. **실시간 구독**: 필요할 때만 활성화

## 보안

- Firebase Security Rules로 접근 제어
- 로그인한 사용자만 자신의 데이터 접근
- 팀 멤버만 팀 문서 접근
- 로컬 스토리지는 브라우저 샌드박스로 보호

## 테스트 시나리오

### 시나리오 1: 비로그인 → 로그인
1. 비로그인 상태에서 노트 작성
2. 로그인
3. 자동으로 모든 노트가 Firebase에 백업됨
4. 다른 기기에서 로그인하면 동일한 노트 확인 가능

### 시나리오 2: 오프라인 작업
1. 온라인 상태에서 노트 작성
2. 비행기 모드 활성화 (오프라인)
3. 노트 계속 작성/수정
4. 온라인 전환
5. 자동으로 모든 변경사항 업로드

### 시나리오 3: 다중 기기 동기화
1. 기기 A에서 노트 작성
2. 기기 B에서 실시간으로 노트 나타남
3. 기기 B에서 수정
4. 기기 A에 즉시 반영

## 문제 해결

### 동기화 안 됨
- 인터넷 연결 확인
- 로그인 상태 확인
- 브라우저 콘솔에서 오류 확인
- 큐 확인: `localStorage.getItem('offline_sync_queue')`

### 데이터 중복
- 로컬 스토리지 초기화
- 재로그인하여 Firebase에서 다운로드

### 느린 동기화
- 네트워크 속도 확인
- 큐 크기 확인 (너무 많은 작업이 쌓였는지)
