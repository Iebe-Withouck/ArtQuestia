# ✅ Strapi Setup Complete - Verification Checklist

## Quick Verification Steps

### 1. Check Strapi Admin Panel

Go to: https://colorful-charity-cafd22260f.strapiapp.com/admin

#### Verify User Model Fields:
1. Navigate: **Content-Type Builder** → **User** (under Users & Permissions)
2. Should see these fields:
   - ✅ firebaseUID (Text, Unique)
   - ✅ name (Text)
   - ✅ age (Text/Number)

#### Verify User Unlocked Artwork Collection:
1. Navigate: **Content-Type Builder** → **User Unlocked Artwork**
2. Should see these fields:
   - ✅ user (Relation to User)
   - ✅ artwork (Relation to Artwork)
   - ✅ unlockedAt (DateTime)

#### Verify Permissions:
1. Navigate: **Settings** → **Roles** → **Authenticated**
2. Find **User-unlocked-artwork**:
   - ✅ find
   - ✅ findOne
   - ✅ create
3. Find **User**:
   - ✅ find
   - ✅ findOne
   - ✅ update
   - ✅ me

---

## 2. Test in Your App

### Option A: Using the Test Component (Recommended)

1. **Add test component to home screen:**
   - Open: `react-native/app/(tabs)/index.tsx`
   - Add at top with imports:
     ```typescript
     import TestUnlockButton from '@/components/TestUnlockButton';
     ```
   - Add in the render JSX (anywhere visible):
     ```typescript
     <TestUnlockButton />
     ```

2. **Run your app and check the test component:**
   - Should show your user email and Strapi ID
   - Click "Test Unlock Artwork" button
   - Check console logs

### Option B: Test Through Normal Flow

1. **Login to your app** with existing account
2. **Check console logs** - should see:
   ```
   User data saved: { strapiUserId: X, firebaseUID: "...", email: "..." }
   Loaded unlocked artworks from Strapi: [array of IDs]
   ```

3. **Go to AR view** and unlock an artwork
4. **Check console logs** - should see:
   ```
   Artwork unlocked and saved to Strapi: X
   Sticker claimed and saved to Strapi - ID: X
   ```

5. **Check Strapi Admin:**
   - Navigate: **Content Manager** → **User Unlocked Artwork**
   - Should see new entry with your user and artwork

---

## 3. What Should Happen Now

### ✅ When You Login:
- App saves: `strapiToken`, `strapiUserId`, `firebaseUID`, `userEmail`
- Console shows: "User data saved: {...}"
- Context loads unlocked artworks from Strapi

### ✅ When You Unlock Artwork:
- POST request sent to Strapi
- Record created in `user-unlocked-artworks`
- Local state updated
- Console shows: "Artwork unlocked and saved to Strapi: X"

### ✅ When You Restart App:
- Unlocked artworks loaded from Strapi
- Show as unlocked in UI
- Console shows: "Loaded unlocked artworks from Strapi: [...]"

---

## 4. Common Issues & Solutions

### ❌ Console: "User not authenticated"
**Problem:** Not logged in or token missing  
**Solution:**
1. Make sure you're logged in
2. Check AsyncStorage has tokens:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   console.log('Token:', await AsyncStorage.getItem('strapiToken'));
   console.log('User ID:', await AsyncStorage.getItem('strapiUserId'));
   ```
3. If missing, logout and login again

### ❌ Console: "403 Forbidden"
**Problem:** Permissions not set correctly  
**Solution:**
1. Go to Strapi: **Settings** → **Roles** → **Authenticated**
2. Enable for User-unlocked-artwork: find, findOne, create
3. Click **Save**

### ❌ Console: "user-unlocked-artworks not found"
**Problem:** Collection not created properly  
**Solution:**
1. Check Content-Type Builder for "User Unlocked Artwork"
2. Verify API ID is: `user-unlocked-artwork` (singular)
3. Restart Strapi server if needed

### ❌ No data showing in Strapi Admin
**Problem:** Data not being sent or permission issue  
**Solution:**
1. Check console for error messages
2. Verify network connection
3. Test with the TestUnlockButton component
4. Check if JWT token is valid (may need to re-login)

### ❌ "firebaseUID field does not exist"
**Problem:** Field not added or Strapi not restarted  
**Solution:**
1. Go to Content-Type Builder → User
2. Add firebaseUID field
3. Click Save and wait for restart (10-30 seconds)

---

## 5. Verify Data in Strapi

### Check Your User:
1. Go to: **Content Manager** → **User**
2. Find your user account
3. Click on it
4. Should see:
   - Email: your@email.com
   - firebaseUID: (long string like "xK2j3kL4n5m6...")
   - name: (your name)
   - age: (your age)

### Check Unlocked Artworks:
1. Go to: **Content Manager** → **User Unlocked Artwork**
2. Should see entries with:
   - user: (your user)
   - artwork: (the artworks you unlocked)
   - unlockedAt: (timestamps)

---

## 6. Testing Checklist

Complete these steps to verify everything works:

- [ ] Strapi setup complete (fields added, collection created, permissions set)
- [ ] Login to app successful
- [ ] Console shows "User data saved"
- [ ] User in Strapi has firebaseUID
- [ ] Unlock an artwork in AR view
- [ ] Console shows "Artwork unlocked and saved to Strapi"
- [ ] Entry appears in Strapi Admin → User Unlocked Artwork
- [ ] Close and reopen app
- [ ] Artwork still shows as unlocked
- [ ] Console shows "Loaded unlocked artworks from Strapi"

---

## 7. Next Steps

### If Everything Works ✅
- Remove the TestUnlockButton component
- Start using the app normally
- All unlocks will be saved permanently to Strapi Cloud

### If You Have Issues ❌
Share these details:
1. Console log output (especially errors)
2. Which step fails in the testing checklist
3. Screenshots of Strapi Admin (permissions, collections, data)
4. Any error messages from the app

---

## 8. Console Commands for Testing

Run these in your app to test manually:

```typescript
import { getCurrentUser, unlockArtwork, getUnlockedArtworks } from '@/services/userService';

// Check current user
const user = await getCurrentUser();
console.log('Current user:', user);

// Get unlocked artworks
const unlocked = await getUnlockedArtworks();
console.log('Unlocked artworks:', unlocked);

// Test unlock (use real artwork ID)
const success = await unlockArtwork(1);
console.log('Unlock success:', success);
```

---

## Quick Success Check

**Run this in your app after login:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check all stored data
const token = await AsyncStorage.getItem('strapiToken');
const userId = await AsyncStorage.getItem('strapiUserId');
const firebaseUID = await AsyncStorage.getItem('firebaseUID');
const email = await AsyncStorage.getItem('userEmail');

console.log('=== USER SESSION ===');
console.log('Strapi Token:', token ? '✅ Present' : '❌ Missing');
console.log('Strapi User ID:', userId || '❌ Missing');
console.log('Firebase UID:', firebaseUID || '❌ Missing');
console.log('Email:', email || '❌ Missing');
```

**Expected Output:**
```
=== USER SESSION ===
Strapi Token: ✅ Present
Strapi User ID: 1
Firebase UID: xK2j3kL4n5m6o7p8q9r0...
Email: your@email.com
```

---

## Need More Help?

If something isn't working:
1. Check console logs carefully
2. Verify all Strapi setup steps
3. Test with a fresh login
4. Share the error messages

Everything should be working now! 🎉
