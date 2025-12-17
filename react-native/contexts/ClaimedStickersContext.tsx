import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unlockArtwork, getUnlockedArtworks } from '@/services/userService';

interface ClaimedStickersContextType {
  claimedStickers: number[];
  claimSticker: (artworkId: number) => Promise<void>;
  resetClaims: () => void;
  reloadUnlockedArtworks: () => Promise<void>;
  loading: boolean;
}

const ClaimedStickersContext = createContext<ClaimedStickersContextType | undefined>(undefined);

export const ClaimedStickersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [claimedStickers, setClaimedStickers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Load unlocked artworks from Strapi when the app starts
  useEffect(() => {
    loadUnlockedArtworks();
  }, []);

  const loadUnlockedArtworks = async () => {
    try {
      setLoading(true);
      const unlockedIds = await getUnlockedArtworks();
      if (unlockedIds.length > 0 || unlockedIds.length === 0) {
        // Deduplicate the array to handle any duplicate entries from the database
        const uniqueIds = [...new Set(unlockedIds)];

        if (unlockedIds.length !== uniqueIds.length) {
          console.log('⚠️ Removed duplicate entries from unlocked artworks');
          console.log('Original:', unlockedIds, 'Deduplicated:', uniqueIds);
        }

        setClaimedStickers(uniqueIds);
        console.log('Loaded unlocked artworks from Strapi:', uniqueIds);
      }
    } catch (error) {
      // Silently fail if user not logged in - they'll load after login
      console.log('Could not load unlocked artworks (user may not be logged in yet)');
    } finally {
      setLoading(false);
    }
  };

  const claimSticker = async (artworkId: number) => {
    // Check if already claimed
    if (claimedStickers.includes(artworkId)) {
      console.log('Artwork already unlocked:', artworkId);
      return;
    }

    try {
      // Save to Strapi database
      const success = await unlockArtwork(artworkId);
      
      if (success) {
        // Update local state
        setClaimedStickers(prev => [...prev, artworkId]);
        console.log('Artwork unlocked and saved to Strapi:', artworkId);
      } else {
        console.error('Failed to unlock artwork in Strapi:', artworkId);
      }
    } catch (error) {
      console.error('Error claiming sticker:', error);
    }
  };

  const resetClaims = () => {
    setClaimedStickers([]);
  };

  const reloadUnlockedArtworks = async () => {
    await loadUnlockedArtworks();
  };

  return (
    <ClaimedStickersContext.Provider value={{ claimedStickers, claimSticker, resetClaims, reloadUnlockedArtworks, loading }}>
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
