import { db, auth, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, orderBy, limit, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 유틸리티: 현재 로그인한 사용자 ID 가져오기
const getCurrentUserId = () => {
    return auth.currentUser ? auth.currentUser.uid : null;
};

// 오프라인 큐 관리
const QUEUE_KEY = 'offline_sync_queue';

// 큐에 작업 추가
const addToQueue = (operation) => {
    try {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        queue.push({
            ...operation,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('Failed to add to queue:', e);
    }
};

// 큐 처리
const processQueue = async () => {
    const uid = getCurrentUserId();
    if (!uid) return;

    try {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        if (queue.length === 0) return;

        console.log(`오프라인 큐 처리 중... (${queue.length}개 작업)`);

        for (const operation of queue) {
            try {
                if (operation.type === 'save') {
                    await setDoc(doc(db, "users", uid, "notes", operation.noteId), operation.data);
                } else if (operation.type === 'delete') {
                    await deleteDoc(doc(db, "users", uid, "notes", operation.noteId));
                }
            } catch (e) {
                console.error('큐 작업 실패:', e);
                // 실패한 작업은 큐에 남겨둠
                return;
            }
        }

        // 모든 작업 성공 시 큐 비우기
        localStorage.setItem(QUEUE_KEY, '[]');
        console.log('오프라인 큐 처리 완료');
    } catch (e) {
        console.error('큐 처리 중 오류:', e);
    }
};

// 온라인/오프라인 상태 감지
let isOnline = navigator.onLine;
let syncInterval = null;

// 온라인 상태 변경 감지
window.addEventListener('online', async () => {
    console.log('온라인 전환 감지');
    isOnline = true;
    await processQueue();
    startAutoSync();
});

window.addEventListener('offline', () => {
    console.log('오프라인 전환 감지');
    isOnline = false;
    stopAutoSync();
});

// 자동 동기화 시작/중지
const startAutoSync = () => {
    if (syncInterval) return;
    // 30초마다 큐 처리
    syncInterval = setInterval(() => {
        if (isOnline && getCurrentUserId()) {
            processQueue();
        }
    }, 30000);
};

const stopAutoSync = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
};

// 앱 시작 시 자동 동기화 시작
if (isOnline && getCurrentUserId()) {
    startAutoSync();
}

// 로컬 데이터 전체를 Firebase로 동기화
export const syncLocalToFirebase = async (uid) => {
    if (!uid) return;

    try {
        const notes = [];
        
        // 로컬 스토리지에서 모든 노트 수집
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('note_') && !key.startsWith('note_list_')) {
                try {
                    const noteData = JSON.parse(localStorage.getItem(key));
                    if (noteData && noteData.id) {
                        notes.push(noteData);
                    }
                } catch (e) {
                    console.error('노트 파싱 실패:', key, e);
                }
            }
        }

        console.log(`로컬 노트 ${notes.length}개 발견`);

        // Firebase로 업로드
        for (const note of notes) {
            try {
                await setDoc(doc(db, "users", uid, "notes", note.id), note);
            } catch (e) {
                console.error('노트 동기화 실패:', note.id, e);
            }
        }

        console.log(`${notes.length}개 노트 동기화 완료`);
        
        // 큐도 처리
        await processQueue();
    } catch (e) {
        console.error('전체 동기화 실패:', e);
    }
};

// 0. 파일 업로드 (Firebase Storage)
export const uploadFile = async (file, path) => {
    const uid = getCurrentUserId();
    if (!uid) {
        throw new Error("로그인이 필요합니다.");
    }
    
    // storageRef 생성 (예: users/{uid}/images/{filename})
    const storageRef = ref(storage, `users/${uid}/${path}/${Date.now()}_${file.name}`);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    
    // 다운로드 URL 받기
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

// 로컬 스토리지와 Firebase Firestore 동시 저장 유틸리티

// 1. 노트 저장 (Create / Update)
export const saveNote = async (noteId, noteData) => {
  try {
    const uid = getCurrentUserId();
    
    // 1-1. 로컬 스토리지에 저장 (항상 즉시 저장)
    localStorage.setItem(`note_${noteId}`, JSON.stringify(noteData));
    
    // 날짜별 리스트 업데이트 (로컬)
    if (noteData.date) {
        const listKey = `note_list_${noteData.date}`;
        const savedList = localStorage.getItem(listKey);
        let list = savedList ? JSON.parse(savedList) : [];
        const index = list.findIndex(n => n.id === noteId);
        
        const summaryData = {
            id: noteData.id,
            date: noteData.date,
            title: noteData.title,
            method: noteData.method,
            template: noteData.template,
            category: noteData.category,
            updatedAt: noteData.updatedAt
        };

        if (index !== -1) {
            list[index] = summaryData;
        } else {
            list.push(summaryData);
        }
        localStorage.setItem(listKey, JSON.stringify(list));
    }

    // 1-2. Firebase Firestore에 저장 (온라인일 때만)
    if (uid && isOnline) {
        try {
            await setDoc(doc(db, "users", uid, "notes", noteId), noteData);
            console.log("Firebase 실시간 동기화 성공:", noteId);
        } catch (firebaseError) {
            console.error("Firebase 동기화 실패, 큐에 추가:", firebaseError);
            // 실패 시 큐에 추가
            addToQueue({ type: 'save', noteId, data: noteData });
        }
    } else if (uid && !isOnline) {
        // 오프라인이면 큐에 추가
        console.log("오프라인: 큐에 저장 작업 추가");
        addToQueue({ type: 'save', noteId, data: noteData });
    }

  } catch (e) {
    console.error("Save failed:", e);
    throw e;
  }
};

// 2. 노트 불러오기 (Read)
export const loadNote = async (noteId) => {
  try {
    const uid = getCurrentUserId();

    // 2-1. 로컬 스토리지에서 먼저 찾기 (빠른 로딩)
    const localData = localStorage.getItem(`note_${noteId}`);
    if (localData) {
        return JSON.parse(localData);
    }

    // 2-2. 로컬에 없으면 Firebase에서 찾기 (로그인 시)
    if (uid) {
        const docRef = doc(db, "users", uid, "notes", noteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const remoteData = docSnap.data();
            // Firebase에서 가져온 데이터를 로컬에 캐시
            localStorage.setItem(`note_${noteId}`, JSON.stringify(remoteData));
            return remoteData;
        }
    }
    
    console.log("No such note!");
    return null;

  } catch (e) {
    console.error("Load failed:", e);
    return null;
  }
};

// 2-1. 실시간 노트 구독 (새로 추가)
export const subscribeToNote = (noteId, callback) => {
    const uid = getCurrentUserId();
    if (!uid || !noteId) return () => {};

    const docRef = doc(db, "users", uid, "notes", noteId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Firebase 변경사항을 로컬에도 반영
            localStorage.setItem(`note_${noteId}`, JSON.stringify(data));
            callback(data);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("노트 구독 오류:", error);
    });

    return unsubscribe;
};

// 2-2. 사용자의 모든 노트 실시간 구독 (새로 추가)
export const subscribeToUserNotes = (callback) => {
    const uid = getCurrentUserId();
    if (!uid) return () => {};

    const q = query(
        collection(db, "users", uid, "notes"),
        orderBy("updatedAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = [];
        snapshot.forEach((doc) => {
            const noteData = { id: doc.id, ...doc.data() };
            // 로컬에도 저장
            localStorage.setItem(`note_${doc.id}`, JSON.stringify(noteData));
            notes.push(noteData);
        });
        callback(notes);
    }, (error) => {
        console.error("노트 목록 구독 오류:", error);
    });

    return unsubscribe;
};

// 3. 날짜별 노트 리스트 불러오기
export const loadDayNotesList = async (dateStr) => {
    // 로컬 확인
    const listKey = `note_list_${dateStr}`;
    const localList = localStorage.getItem(listKey);
    
    if (localList) {
        return JSON.parse(localList);
    }
    return [];
};

// 4. 최근 노트 리스트 불러오기 (NEW)
export const loadRecentNotes = async (count = 5) => {
    const uid = getCurrentUserId();
    
    // 로컬 스캔
    let localNotes = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('note_') && !key.startsWith('note_list_')) {
            try {
                const note = JSON.parse(localStorage.getItem(key));
                if (note && note.updatedAt) {
                    localNotes.push(note);
                }
            } catch (e) {}
        }
    }
    
    localNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const recentLocal = localNotes.slice(0, count);

    // 로그인 시 Firebase 쿼리
    if (uid) {
        try {
            const q = query(
                collection(db, "users", uid, "notes"),
                orderBy("updatedAt", "desc"),
                limit(count)
            );
            const querySnapshot = await getDocs(q);
            const remoteNotes = [];
            querySnapshot.forEach((doc) => {
                remoteNotes.push(doc.data());
            });
            return remoteNotes.length > 0 ? remoteNotes : recentLocal;
        } catch (e) {
            console.error("Firebase recent load failed:", e);
            return recentLocal;
        }
    }

    return recentLocal;
};

// 5. 노트 삭제
export const deleteNote = async (noteId, dateStr) => {
    const uid = getCurrentUserId();

    // 로컬 삭제 (즉시)
    localStorage.removeItem(`note_${noteId}`);
    
    // 리스트 갱신
    if (dateStr) {
        const listKey = `note_list_${dateStr}`;
        const savedList = localStorage.getItem(listKey);
        if (savedList) {
            let list = JSON.parse(savedList);
            list = list.filter(n => n.id !== noteId);
            localStorage.setItem(listKey, JSON.stringify(list));
        }
    }

    // Firebase 삭제 (온라인일 때만)
    if (uid && isOnline) {
        try {
            await deleteDoc(doc(db, "users", uid, "notes", noteId));
            console.log("Firebase 삭제 성공:", noteId);
        } catch (e) {
            console.error("Firebase 삭제 실패, 큐에 추가:", e);
            addToQueue({ type: 'delete', noteId });
        }
    } else if (uid && !isOnline) {
        console.log("오프라인: 큐에 삭제 작업 추가");
        addToQueue({ type: 'delete', noteId });
    }
};

// 6. 팀 협업 기능 (Realtime)

// 팀 생성
export const createTeam = async (teamName) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("로그인이 필요합니다.");

    try {
        const teamRef = await addDoc(collection(db, "teams"), {
            name: teamName,
            members: [uid], // 생성자를 첫 번째 멤버로 추가
            createdAt: serverTimestamp(),
            createdBy: uid
        });
        return teamRef.id;
    } catch (e) {
        console.error("Team create failed:", e);
        throw e;
    }
};

// 사용자의 팀 목록 가져오기
export const getUserTeams = async () => {
    const uid = getCurrentUserId();
    if (!uid) return []; // 로그인하지 않은 경우 빈 배열

    try {
        // members 배열에 uid가 포함된 팀 조회
        const q = query(collection(db, "teams"), where("members", "array-contains", uid));
        const querySnapshot = await getDocs(q);
        
        const teams = [];
        querySnapshot.forEach((doc) => {
            teams.push({ id: doc.id, ...doc.data() });
        });
        return teams;
    } catch (e) {
        console.error("Get user teams failed:", e);
        return [];
    }
};

// 팀 정보 구독
export const subscribeToTeam = (teamId, callback) => {
    if (!teamId) return () => {};
    // 문서 ID가 teamId와 일치하는 문서 구독
    const unsub = onSnapshot(doc(db, "teams", teamId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            console.log("No such team!");
            callback(null);
        }
    }, (error) => {
        console.error("Team subscription error:", error);
    });
    return unsub;
};

// 팀 문서 목록 구독 (하위 컬렉션 'docs' 사용 가정)
export const subscribeToTeamDocs = (teamId, callback) => {
    if (!teamId) return () => {};
    const q = query(collection(db, "teams", teamId, "docs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        callback(docs);
    }, (error) => {
        console.error("Team docs subscription error:", error);
    });
    return unsub;
};

// 팀 문서 생성
export const createTeamDoc = async (teamId, title) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Login required");
    
    await addDoc(collection(db, "teams", teamId, "docs"), {
        title,
        author: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        authorId: uid,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
    });
};

// 팀 참가하기 (초대 코드로 가입)
export const joinTeam = async (teamId) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("로그인이 필요합니다.");

    try {
        const teamRef = doc(db, "teams", teamId);
        const teamDoc = await getDoc(teamRef);
        
        if (!teamDoc.exists()) {
            throw new Error("존재하지 않는 팀입니다.");
        }

        const teamData = teamDoc.data();
        const currentMembers = teamData.members || [];
        
        // 이미 멤버인지 확인
        if (currentMembers.includes(uid)) {
            throw new Error("이미 이 팀의 멤버입니다.");
        }

        // 멤버 추가
        await updateDoc(teamRef, {
            members: [...currentMembers, uid],
            updatedAt: new Date().toISOString()
        });

        return { success: true, teamName: teamData.name };
    } catch (e) {
        console.error("팀 참가 실패:", e);
        throw e;
    }
};

// 7. 팀 문서 CRUD

// 팀 문서 로드
export const loadTeamNote = async (teamId, docId) => {
    try {
        const docRef = doc(db, "teams", teamId, "docs", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Load team note failed:", e);
        return null;
    }
};

// 팀 문서 저장
export const saveTeamNote = async (teamId, docId, noteData) => {
    try {
        const uid = getCurrentUserId();
        // updatedBy, updatedAt 추가
        const dataToSave = {
            ...noteData,
            updatedAt: new Date().toISOString(),
            updatedBy: uid || 'unknown'
        };
        // 문서 내용 업데이트
        await setDoc(doc(db, "teams", teamId, "docs", docId), dataToSave, { merge: true });
    } catch (e) {
        console.error("Save team note failed:", e);
        throw e;
    }
};

// 팀 문서 삭제
export const deleteTeamNote = async (teamId, docId) => {
    try {
        await deleteDoc(doc(db, "teams", teamId, "docs", docId));
    } catch (e) {
        console.error("Delete team note failed:", e);
        throw e;
    }
}
