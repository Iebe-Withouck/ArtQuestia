import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unlockArtwork, getUnlockedArtworks } from '@/services/userService';
import { determineRewardFlow, getRewardRoutePath, RewardData } from '@/utils/rewardHelper';

interface ClaimedStickersContextType {
  claimedStickers: number[];
  claimSticker: (artworkId: number) => Promise<RewardData | null>;
  resetClaims: () => void;
  reloadUnlockedArtworks: () => Promise<void>;
  loading: boolean;
  setAllArtworks: (artworks: any[]) => void;
}

const ClaimedStickersContext = createContext<ClaimedStickersContextType | undefined>(undefined);

export const ClaimedStickersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [claimedStickers, setClaimedStickers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [allArtworks, setAllArtworks] = useState<any[]>([]);

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

  const claimSticker = async (artworkId: number): Promise<RewardData | null> => {
    // Check if already claimed
    if (claimedStickers.includes(artworkId)) {
      console.log('Artwork already unlocked:', artworkId);
      return null;
    }

    try {
      // Determine reward flow BEFORE updating state
      let rewardData: RewardData | null = null;
      if (allArtworks.length > 0) {
        rewardData = await determineRewardFlow(artworkId, allArtworks, claimedStickers);
        console.log('Reward flow determined:', rewardData);
      }

      // Save to Strapi database
      const success = await unlockArtwork(artworkId);

      if (success) {
        // Update local state
        setClaimedStickers(prev => [...prev, artworkId]);
        console.log('Artwork unlocked and saved to Strapi:', artworkId);

        // Return reward data so caller can navigate
        return rewardData;
      } else {
        console.error('Failed to unlock artwork in Strapi:', artworkId);
        return null;
      }
    } catch (error) {
      console.error('Error claiming sticker:', error);
      return null;
    }
  };

  const resetClaims = () => {
    setClaimedStickers([]);
  };

  const reloadUnlockedArtworks = async () => {
    await loadUnlockedArtworks();
  };

  return (
    <ClaimedStickersContext.Provider value={{ claimedStickers, claimSticker, resetClaims, reloadUnlockedArtworks, loading, setAllArtworks }}>
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
