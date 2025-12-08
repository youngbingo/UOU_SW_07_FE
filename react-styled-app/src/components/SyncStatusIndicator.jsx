import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaWifi, FaCloudUploadAlt } from 'react-icons/fa';

const StatusBar = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${({ $online, theme }) => $online ? theme.colors.success : theme.colors.textSecondary};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 999;
  transition: all 0.3s ease;
  
  ${({ $syncing }) => $syncing && `
    animation: pulse 1.5s infinite;
  `}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const SyncStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      // 2초 후 동기화 완료
      setTimeout(() => setIsSyncing(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 온라인 상태일 때만 표시 (또는 오프라인 경고)
  if (!isOnline) {
    return (
      <StatusBar $online={false}>
        <FaWifi size={14} />
        오프라인 모드
      </StatusBar>
    );
  }

  if (isSyncing) {
    return (
      <StatusBar $online={true} $syncing={true}>
        <FaCloudUploadAlt size={14} />
        동기화 중...
      </StatusBar>
    );
  }

  // 온라인이고 동기화 완료 상태일 때는 표시 안 함 (깔끔하게)
  return null;
};

export default SyncStatusIndicator;
