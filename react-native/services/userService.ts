import AsyncStorage from '@react-native-async-storage/async-storage';

const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

/**
 * Get the current user's Strapi authentication token
 */
export const getStrapiToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('strapiToken');
  } catch (error) {
    console.error('Error getting Strapi token:', error);
    return null;
  }
};

/**
 * Get the current user's Strapi user ID
 */
export const getStrapiUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('strapiUserId');
  } catch (error) {
    console.error('Error getting Strapi user ID:', error);
    return null;
  }
};

/**
 * Get the current user's Firebase UID
 */
export const getFirebaseUID = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('firebaseUID');
  } catch (error) {
    console.error('Error getting Firebase UID:', error);
    return null;
  }
};

/**
 * Get the current user's data
 */
export const getCurrentUser = async () => {
  try {
    const [strapiToken, strapiUserId, firebaseUID, userEmail, userName, userAge] = await Promise.all([
      AsyncStorage.getItem('strapiToken'),
      AsyncStorage.getItem('strapiUserId'),
      AsyncStorage.getItem('firebaseUID'),
      AsyncStorage.getItem('userEmail'),
      AsyncStorage.getItem('userName'),
      AsyncStorage.getItem('userAge'),
    ]);

    if (!strapiToken || !strapiUserId) {
      return null;
    }

    return {
      strapiToken,
      strapiUserId,
      firebaseUID,
      userEmail,
      userName,
      userAge,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Clear all user data (logout)
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'strapiToken',
      'strapiUserId',
      'firebaseUID',
      'userEmail',
      'userName',
      'userAge',
    ]);
    console.log('User data cleared');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Unlock an artwork for the current user
 * This will save the unlocked artwork to the user's dataset in Strapi
 */
export const unlockArtwork = async (artworkId: number): Promise<boolean> => {
  try {
    const token = await getStrapiToken();
    const userId = await getStrapiUserId();

    console.log('🔓 Unlocking artwork:', { artworkId, hasToken: !!token, userId });

    if (!token || !userId) {
      console.error('User not authenticated - missing token or userId');
      return false;
    }

    console.log('📤 Sending unlock request to Strapi');
    console.log('📤 User ID:', userId);
    console.log('📤 Artwork ID:', artworkId);
    console.log('📤 Token:', token.substring(0, 30) + '...');
    
    const requestBody = {
      data: {
        artwork: artworkId,
        unlockedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${STRAPI_URL}/api/user-unlocked-artworks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Artwork unlocked successfully:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Failed to unlock artwork:', JSON.stringify(error, null, 2));
      return false;
    }
  } catch (error) {
    console.error('Error unlocking artwork:', error);
    return false;
  }
};

/**
 * Get all unlocked artworks for the current user
 */
export const getUnlockedArtworks = async (): Promise<number[]> => {
  try {
    const token = await getStrapiToken();
    const userId = await getStrapiUserId();

    console.log('📋 Fetching unlocked artworks:', { hasToken: !!token, userId });

    if (!token || !userId) {
      // User not logged in yet - return empty array silently
      console.log('No token or userId - skipping fetch');
      return [];
    }

    // Test the token by fetching current user first
    const testResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('🔐 Token validation test:', testResponse.status, testResponse.ok);
    
    // Fetch only PUBLISHED unlocked artworks for the current user
    const response = await fetch(
      `${STRAPI_URL}/api/user-unlocked-artworks?` + 
      `filters[users_permissions_user][id][$eq]=${userId}&` +
      `filters[publishedAt][$notNull]=true&` +
      `populate[users_permissions_user][fields][0]=id&` +
      `populate[artwork][fields][0]=id`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Published unlocked artworks for user:', userId);
      console.log('Total published entries:', data.data.length);
      
      // Extract artwork IDs from the published entries
      const artworkIds = data.data
        .filter((item: any) => item.artwork?.id) // Only include entries with artwork
        .map((item: any) => item.artwork.id);
      
      console.log('✅ Unlocked artwork IDs:', artworkIds);
      return artworkIds;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to fetch unlocked artworks:', response.status, errorData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching unlocked artworks:', error);
    return [];
  }
};

/**
 * Check if a specific artwork is unlocked for the current user
 */
export const isArtworkUnlocked = async (artworkId: number): Promise<boolean> => {
  try {
    const unlockedArtworks = await getUnlockedArtworks();
    return unlockedArtworks.includes(artworkId);
  } catch (error) {
    console.error('Error checking if artwork is unlocked:', error);
    return false;
  }
};

/**
 * Update user profile data
 */
export const updateUserProfile = async (name?: string, age?: string): Promise<boolean> => {
  try {
    const token = await getStrapiToken();
    const userId = await getStrapiUserId();

    if (!token || !userId) {
      console.error('User not authenticated');
      return false;
    }

    const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        age: age,
      }),
    });

    if (response.ok) {
      // Update local storage
      if (name) await AsyncStorage.setItem('userName', name);
      if (age) await AsyncStorage.setItem('userAge', age);
      
      console.log('User profile updated successfully');
      return true;
    } else {
      const error = await response.json();
      console.error('Failed to update user profile:', error);
      return false;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};
