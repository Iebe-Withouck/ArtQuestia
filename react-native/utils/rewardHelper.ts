const STRAPI_URL = 'https://colorful-charity-cafd22260f.strapiapp.com';

export interface RewardData {
  shouldShowReward: boolean;
  rewardType: 'unlocked' | 'leveledUp' | 'completed' | null;
  themeName: string;
  badgeUrl: string | null;
  progress: number;
}

// Map artwork theme names to display names
const THEME_DISPLAY_MAP: { [key: string]: string } = {
  'Oorlog': 'Oorlogmonumenten',
  'Moderne Kunst': 'Modern',
  'Historie': 'Historie',
  'Religie': 'Religie',
  'ZieMie': 'ZieMie'
};

// Map artwork theme names to badge suffixes
const THEME_BADGE_MAP: { [key: string]: string } = {
  'Oorlog': 'Oorlog',
  'Moderne Kunst': 'Modern',
  'Historie': 'Historie',
  'Religie': 'Religie',
  'ZieMie': 'ZieMie'
};

/**
 * Determines which reward screen to show after claiming a sticker
 * @param artworkId - ID of the artwork being claimed
 * @param allArtworks - All artworks from Strapi
 * @param previousClaimedStickers - Claimed stickers BEFORE this claim
 * @returns RewardData object with reward type and data
 */
export async function determineRewardFlow(
  artworkId: number,
  allArtworks: any[],
  previousClaimedStickers: number[]
): Promise<RewardData> {
  // Find the artwork being claimed
  const artwork = allArtworks.find(a => a.id === artworkId);
  if (!artwork) {
    return { shouldShowReward: false, rewardType: null, themeName: '', badgeUrl: null, progress: 0 };
  }

  // Get the theme of this artwork
  const artworkTheme = artwork.attributes?.Theme || artwork.Theme;
  if (!artworkTheme) {
    return { shouldShowReward: false, rewardType: null, themeName: '', badgeUrl: null, progress: 0 };
  }

  // Get all artworks in this theme
  const themeArtworks = allArtworks.filter(a => {
    const theme = a.attributes?.Theme || a.Theme;
    return theme === artworkTheme;
  });

  const totalThemeStickers = themeArtworks.length;

  // Calculate stickers claimed BEFORE this claim
  const previousThemeStickers = themeArtworks.filter(a =>
    previousClaimedStickers.includes(a.id)
  ).length;

  // Calculate stickers claimed AFTER this claim (including the new one)
  const newClaimedStickers = [...previousClaimedStickers, artworkId];
  const newThemeStickers = themeArtworks.filter(a =>
    newClaimedStickers.includes(a.id)
  ).length;

  // Calculate progress percentage
  const progress = totalThemeStickers > 0
    ? Math.round((newThemeStickers / totalThemeStickers) * 100)
    : 0;

  // Get theme display name and badge suffix
  const themeName = THEME_DISPLAY_MAP[artworkTheme] || artworkTheme;
  const badgeSuffix = THEME_BADGE_MAP[artworkTheme] || artworkTheme;

  // Determine reward type based on progress
  let rewardType: 'unlocked' | 'leveledUp' | 'completed' | null = null;
  let badgePrefixType: 'unlocked' | 'leveledUp' | 'completed' = 'leveledUp';

  if (previousThemeStickers === 0 && newThemeStickers === 1) {
    // First sticker of theme → unlocked
    rewardType = 'unlocked';
    badgePrefixType = 'unlocked';
  } else if (newThemeStickers === totalThemeStickers) {
    // All stickers claimed → completed
    rewardType = 'completed';
    badgePrefixType = 'completed';
  } else if (previousThemeStickers > 0 && newThemeStickers < totalThemeStickers) {
    // Additional sticker (but not all) → leveledUp
    rewardType = 'leveledUp';
    badgePrefixType = 'leveledUp';
  }

  // Fetch the appropriate badge from Strapi
  const badgeUrl = await fetchBadge(badgeSuffix, badgePrefixType);

  return {
    shouldShowReward: rewardType !== null,
    rewardType,
    themeName,
    badgeUrl,
    progress
  };
}

/**
 * Fetches the appropriate badge image from Strapi
 */
async function fetchBadge(
  themeSuffix: string,
  type: 'unlocked' | 'leveledUp' | 'completed'
): Promise<string | null> {
  const prefixMap = {
    'unlocked': '1_Achieved',
    'leveledUp': 'LevelUp_Achieved',
    'completed': 'Full_Achieved'
  };

  const expectedBadgeName = `${prefixMap[type]}_${themeSuffix}`;

  try {
    const response = await fetch(`${STRAPI_URL}/api/badges?populate=*`);
    const data = await response.json();

    if (data.data) {
      const badge = data.data.find((b: any) => b.name === expectedBadgeName);
      if (badge && badge.PhotoBadge?.url) {
        return badge.PhotoBadge.url;
      }
    }
  } catch (error) {
    console.error('Error fetching badge for reward screen:', error);
  }

  return null;
}

/**
 * Gets the route path for a reward type
 */
export function getRewardRoutePath(rewardType: 'unlocked' | 'leveledUp' | 'completed'): string {
  const routeMap = {
    'unlocked': '/rewards/unlocked',
    'leveledUp': '/rewards/leveledUp',
    'completed': '/rewards/completed'
  };
  return routeMap[rewardType];
}
