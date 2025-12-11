import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClaimedStickersContextType {
  claimedStickers: number[];
  claimSticker: (artworkId: number) => void;
  resetClaims: () => void;
}

const ClaimedStickersContext = createContext<ClaimedStickersContextType | undefined>(undefined);

export const ClaimedStickersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [claimedStickers, setClaimedStickers] = useState<number[]>([]);

  const claimSticker = (artworkId: number) => {
    setClaimedStickers(prev => {
      if (!prev.includes(artworkId)) {
        return [...prev, artworkId];
      }
      return prev;
    });
  };

  const resetClaims = () => {
    setClaimedStickers([]);
  };

  return (
    <ClaimedStickersContext.Provider value={{ claimedStickers, claimSticker, resetClaims }}>
      {children}
    </ClaimedStickersContext.Provider>
  );
};

export const useClaimedStickers = () => {
  const context = useContext(ClaimedStickersContext);
  if (context === undefined) {
    throw new Error('useClaimedStickers must be used within a ClaimedStickersProvider');
  }
  return context;
};
