import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { syncLocalToFirebase } from '../utils/storage'; // 추가

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 구글 로그인
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // 이메일 회원가입
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 이메일 로그인
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 로그아웃
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const wasLoggedOut = !currentUser;
      setCurrentUser(user);
      setLoading(false);
      
      // 로그인 시 로컬 데이터 자동 백업
      if (user && wasLoggedOut) {
        console.log('로그인 감지: 로컬 데이터 백업 시작');
        try {
          await syncLocalToFirebase(user.uid);
          console.log('로컬 데이터 백업 완료');
        } catch (error) {
          console.error('로컬 데이터 백업 실패:', error);
        }
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

