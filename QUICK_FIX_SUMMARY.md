# Quick Fix Summary - User Unlocked Artworks

## What Was The Problem?

Your app was using `ClaimedStickersContext` which only stored unlocked artworks **in memory** (local state). When you unlocked an artwork, it only saved to a local array that was lost when the app closed. It **never sent the data to Strapi Cloud**.

## What Was Fixed?

### 1. Updated `ClaimedStickersContext.tsx`
- ✅ Now calls `unlockArtwork()` to save to Strapi database
- ✅ Loads unlocked artworks from Strapi when app starts
- ✅ Made `claimSticker()` async to wait for Strapi response
- ✅ Prevents duplicate unlocks

### 2. Updated AR Scenes (ARScene1-4)
- ✅ Made `onPress` handlers `async`
- ✅ Added `await` before `claimSticker()`
- ✅ Added console logs to confirm Strapi save

### 3. Backend Already Updated
- ✅ Strapi controller saves Firebase UID
- ✅ Returns user data including `firebaseUID`
- ✅ User service functions ready to use

---

## What You Need To Do in Strapi

**IMPORTANT**: You MUST complete the Strapi setup from the guide:

### Required Steps:
1. **Add fields to User model** (5 mins)
   - `firebaseUID` (Text, Unique)
   - `name` (Text)
   - `age` (Text)

2. **Create "User Unlocked Artwork" collection** (5 mins)
   - Relation to User (Many-to-One)
   - Relation to Artwork (Many-to-One)
   - `unlockedAt` (DateTime)

3. **Set Permissions** (2 mins)
   - Authenticated role → User-unlocked-artwork: find, findOne, create
   - Authenticated role → User: find, findOne, update, me

📖 **Follow the detailed guide**: `SETUP_USER_UNLOCKED_ARTWORKS.md`

---

## How To Test

### Step 1: Check Login
1. Close and reopen your app
2. Login with your existing account
3. Check console logs - you should see:
   ```
   User data saved: { strapiUserId: 1, firebaseUID: "...", email: "..." }
   ```

### Step 2: Check User in Strapi
1. Go to Strapi Admin: https://colorful-charity-cafd22260f.strapiapp.com/admin
2. Navigate to: **Content Manager** → **User** (under Users & Permissions)
3. Find your user
4. Verify it has:
   - ✅ Email
   - ✅ firebaseUID (a long string)
   - ✅ name
   - ✅ age

### Step 3: Unlock an Artwork
1. In your app, go to AR view
2. Scan/view an artwork
3. Click "Claim Sticker" button
4. Check console logs - you should see:
   ```
   Artwork unlocked and saved to Strapi: 1
   Sticker claimed and saved to Strapi - ID: 1
   ```

### Step 4: Verify in Strapi
1. Go to Strapi Admin
2. Navigate to: **Content Manager** → **User Unlocked Artwork**
3. You should see a new entry with:
   - user: Your user
   - artwork: The artwork you unlocked
   - unlockedAt: Current timestamp

### Step 5: Test Persistence
1. Close your app completely
2. Reopen and login
3. The unlocked artwork should still show as unlocked
4. Console should show:
   ```
   Loaded unlocked artworks from Strapi: [1, 3, 5]
   ```

---

## Troubleshooting

### Console shows: "User not authenticated"
- **Problem**: Token not saved during login
- **Fix**: Delete app and reinstall, or clear AsyncStorage
- **Check**: Make sure login.tsx and register.tsx are saving tokens

### Console shows: "403 Forbidden"
- **Problem**: Strapi permissions not set
- **Fix**: Go to Strapi Settings → Roles → Authenticated
- **Enable**: find, findOne, create for User-unlocked-artwork

### Console shows: "user-unlocked-artworks not found"
- **Problem**: Collection not created in Strapi
- **Fix**: Follow Step 2 in the setup guide to create the collection

### Artwork unlocks in app but not in Strapi
- **Problem**: API call failing silently
- **Check**: Console logs for errors
- **Verify**: Network connection and Strapi URL is correct
- **Test**: Try logging in again to refresh token

### Duplicate unlocks in Strapi
- **Not a bug**: Current implementation allows this
- **Fix**: Check `isArtworkUnlocked()` before calling `claimSticker()`
- **Or**: Add unique constraint in Strapi (see main guide)

---

## Console Logs To Look For

✅ **Success logs:**
```
User data saved: { strapiUserId: 1, firebaseUID: "xyz", email: "..." }
Loaded unlocked artworks from Strapi: [1, 2, 3]
Artwork unlocked and saved to Strapi: 5
Sticker claimed and saved to Strapi - ID: 5
```

❌ **Error logs:**
```
Error loading unlocked artworks: [error details]
Failed to unlock artwork in Strapi: 5
Error claiming sticker: [error details]
User not authenticated
403 Forbidden
```

---

## What Happens Now?

### When User Unlocks Artwork:
1. User taps "Claim Sticker" in AR view
2. `claimSticker(artworkId)` is called
3. Sends POST request to Strapi: `/api/user-unlocked-artworks`
4. Strapi creates record linking user + artwork
5. Local state updated to show unlocked
6. Console logs confirm success

### When App Opens:
1. `ClaimedStickersContext` initializes
2. Calls `getUnlockedArtworks()` 
3. Fetches from Strapi: `/api/user-unlocked-artworks?filters[user][id][$eq]=1`
4. Returns array of unlocked artwork IDs
5. UI shows locked/unlocked states

### Data Storage:
- **Local (in-memory)**: Quick access during session
- **Strapi Cloud**: Permanent storage, syncs across devices
- **AsyncStorage**: User tokens and basic info

---

## Important Notes

- **First time users**: Old unlocked artworks (before this fix) are NOT in Strapi
- **Migration**: Old users need to unlock artworks again to save to database
- **Tokens expire**: If unlock fails, user may need to re-login
- **Internet required**: Unlocking only works with internet connection
- **Each user separate**: Users can only see their own unlocked artworks

---

## Need Help?

1. Check console logs for error messages
2. Verify Strapi setup is complete (all 3 steps)
3. Test with a fresh user account
4. Check Strapi Admin to see if data is being created
5. Verify internet connection and Strapi URL

**Still having issues?** Share the console logs and I can help debug!
