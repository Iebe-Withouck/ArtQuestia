# Setup Instructions for User Unlocked Artworks in Strapi

## Overview
This document provides detailed step-by-step instructions to set up the Strapi Cloud database so each user can have their own dataset of unlocked artworks, tracked by their Firebase UID.

## Quick Summary

**What you need to do in Strapi:**
1. ✅ Add 3 fields to User model: `firebaseUID`, `name`, `age`
2. ✅ Create new collection: "User Unlocked Artwork" with relations to User and Artwork
3. ✅ Set permissions for Authenticated role
4. ✅ Test with your React Native app

**Time required:** ~10-15 minutes

**What this enables:**
- Each user gets their own dataset of unlocked artworks
- Users can unlock artworks by scanning/viewing them
- Progress is saved permanently in Strapi Cloud
- Users can see which stickers/artworks they've locked vs unlocked

---

## STEP 1: Add Custom Fields to User Collection

You need to extend the built-in User model to store Firebase UID, name, and age.

### Detailed Steps:

1. **Open Strapi Admin Panel**
   - Go to: https://colorful-charity-cafd22260f.strapiapp.com/admin
   - Log in with your admin credentials

2. **Navigate to Content-Type Builder**
   - In the left sidebar, click on **"Content-Type Builder"** (icon looks like building blocks)
   - You'll see a list of all your content types

3. **Find the User Model**
   - Look in the left panel under **"USER & PERMISSIONS PLUGIN"** section
   - Click on **"User"** (NOT "Users & Permissions")
   - This opens the User content type editor

4. **Add firebaseUID Field**
   - Click the **"+ Add another field"** button
   - Select **"Text"** as the field type
   - In the configuration screen:
     - **Name**: Type `firebaseUID` (exactly like this, case-sensitive)
     - **Type**: Short text
     - Click on the **"Advanced Settings"** tab
     - Check ✅ **"Unique"** (this ensures each Firebase UID is unique)
     - Check ✅ **"Private"** (optional, for security)
   - Click **"Finish"**

5. **Add name Field**
   - Click **"+ Add another field"** again
   - Select **"Text"** as the field type
   - In the configuration screen:
     - **Name**: Type `name` (lowercase)
     - **Type**: Short text
     - No need to check unique or required
   - Click **"Finish"**

6. **Add age Field**
   - Click **"+ Add another field"** again
   - Select **"Text"** as the field type (or "Number" if you prefer)
   - In the configuration screen:
     - **Name**: Type `age` (lowercase)
     - **Type**: Short text (or Integer if you chose Number)
   - Click **"Finish"**

7. **Save Changes**
   - Click the **"Save"** button in the top right corner
   - Strapi will show a notification: "The server is restarting"
   - Wait 10-30 seconds for the server to restart
   - You should see a green success notification

✅ **Done!** The User model now has firebaseUID, name, and age fields.

---

## STEP 2: Create "User Unlocked Artworks" Collection

Now you'll create a new collection to store which artworks each user has unlocked.

### Detailed Steps:

1. **Create New Collection Type**
   - Still in **Content-Type Builder** (left sidebar)
   - Click **"+ Create new collection type"** button at the top
   - A modal will pop up

2. **Configure Collection Type**
   - **Display name**: Type `User Unlocked Artwork` (with spaces)
   - **API ID (Singular)**: Should auto-fill as `user-unlocked-artwork`
   - **API ID (Plural)**: Should auto-fill as `user-unlocked-artworks`
   - Click **"Continue"**

3. **Add "user" Relation Field**
   - You're now in the field selection screen
   - Click **"Relation"** field type
   - You'll see a relation configuration interface with two boxes

   **Configure the relation:**
   - **Left side (User Unlocked Artwork)**:
     - Relation name: `user`
   - **Right side**: 
     - Click the dropdown and select **"User (from: users-permissions)"**
   - **Relation type** (in the middle):
     - Click on the icon that shows: **User Unlocked Artwork (many) → User (one)**
     - This is a "Many-to-One" relation
     - The text should read: "User Unlocked Artwork has and belongs to one User"
   
   - Click **"Finish"**

4. **Add "artwork" Relation Field**
   - Click **"+ Add another field"**
   - Select **"Relation"** field type

   **Configure the relation:**
   - **Left side (User Unlocked Artwork)**:
     - Relation name: `artwork`
   - **Right side**: 
     - Click the dropdown and select **"Artwork"** (your existing artwork collection)
   - **Relation type** (in the middle):
     - Click on the icon that shows: **User Unlocked Artwork (many) → Artwork (one)**
     - This is a "Many-to-One" relation
   
   - Click **"Finish"**

5. **Add "unlockedAt" DateTime Field**
   - Click **"+ Add another field"**
   - Select **"Date"** field type
   - In the configuration screen:
     - **Name**: Type `unlockedAt`
     - **Type**: Select **"datetime"** (date and time)
     - Click on **"Advanced Settings"** tab
     - **Default value**: You can leave empty or set current date
   - Click **"Finish"**

6. **Save the Collection**
   - Click **"Save"** button in the top right
   - Strapi will restart (wait 10-30 seconds)
   - You should see your new "User Unlocked Artwork" collection in the left panel under **"COLLECTION TYPES"**

✅ **Done!** You now have a collection to track unlocked artworks per user.

---

## STEP 3: Configure Permissions (CRITICAL!)

You MUST set permissions so authenticated users can create and view their own unlocked artworks. Without this, the API calls will fail with 403 Forbidden errors.

### Detailed Steps:

1. **Navigate to Settings**
   - In the left sidebar, click on **"Settings"** (gear icon at the bottom)
   - The Settings panel opens on the right

2. **Open Users & Permissions Plugin**
   - In the Settings panel, look for **"USERS & PERMISSIONS PLUGIN"** section
   - Click on **"Roles"**
   - You'll see a list of roles: Public, Authenticated, etc.

3. **Edit Authenticated Role**
   - Click on **"Authenticated"** role (this is for logged-in users)
   - A new page opens showing all permissions

4. **Set User-unlocked-artwork Permissions**
   - Scroll down to find **"User-unlocked-artwork"** (alphabetically sorted)
   - You'll see checkboxes for different actions
   
   **Check these boxes:**
   - ✅ **find** (allows users to fetch their unlocked artworks)
   - ✅ **findOne** (allows users to view a specific unlocked artwork)
   - ✅ **create** (allows users to unlock artworks)
   
   **DO NOT check:**
   - ❌ update (users shouldn't modify unlock records)
   - ❌ delete (users shouldn't delete unlock records)

5. **Set User Permissions**
   - Scroll up to find **"User"** under "Users-permissions" section
   
   **Check these boxes:**
   - ✅ **find** (allows users to find user profiles)
   - ✅ **findOne** (allows users to view user profiles)
   - ✅ **update** (allows users to update their own profile)
   - ✅ **me** (allows users to fetch their own user data)
   
   **Note**: Users can only update their OWN profile, not others (Strapi handles this automatically)

6. **Verify Artwork Permissions**
   - Scroll to find **"Artwork"**
   
   **Make sure these are checked:**
   - ✅ **find** (users need to fetch artworks)
   - ✅ **findOne** (users need to view individual artworks)
   
   **These should already be enabled from before**

7. **Save Permissions**
   - Scroll to the top of the page
   - Click the **"Save"** button in the top right corner
   - You'll see a green success notification

8. **IMPORTANT: Also Check Public Role** (Optional but recommended)
   - Go back to **Settings** → **Roles**
   - Click on **"Public"** role
   - Make sure **Artwork** has:
     - ✅ **find** 
     - ✅ **findOne**
   - This allows non-logged-in users to browse artworks (they just can't unlock them)
   - Click **Save**

✅ **Done!** Permissions are now configured correctly.

---

## STEP 4: Verify the Setup

Let's make sure everything is set up correctly before testing with the app.

### Verification Checklist:

1. **Check Content-Type Builder**
   - Go to **Content-Type Builder**
   - Under **"USER & PERMISSIONS PLUGIN"** → **User**
   - Click on **User** and verify you see:
     - firebaseUID (Text, Unique)
     - name (Text)
     - age (Text or Number)
   
2. **Check Collection Types**
   - In **Content-Type Builder**
   - Under **"COLLECTION TYPES"**
   - You should see **"User Unlocked Artwork"**
   - Click on it and verify:
     - user (Relation to User)
     - artwork (Relation to Artwork)
     - unlockedAt (DateTime)

3. **Check Permissions**
   - Go to **Settings** → **Roles** → **Authenticated**
   - Verify checkboxes for:
     - User-unlocked-artwork: find, findOne, create ✅
     - User: find, findOne, update, me ✅
     - Artwork: find, findOne ✅

4. **Check API Routes** (Optional, for advanced users)
   - The following API endpoints should now work:
     - `POST /api/auth/firebase` (already exists)
     - `GET /api/user-unlocked-artworks`
     - `POST /api/user-unlocked-artworks`
     - `GET /api/users/me`
     - `PUT /api/users/:id`

✅ **If all checks pass, you're ready to test!**

---

## STEP 5: Test with Your App

Now that Strapi is configured, test the full flow:

1. **Test Registration**
   - Open your React Native app
   - Create a new user account
   - Check the console logs - you should see:
     ```
     Successfully registered with Strapi: { jwt: "...", user: { id: 1, email: "...", firebaseUID: "..." } }
     ```

2. **Verify User in Strapi**
   - Go to Strapi Admin → **Content Manager** → **User** (under Users & Permissions Plugin)
   - Click on the newly created user
   - Verify the user has:
     - Email ✅
     - firebaseUID (should be a long string like "xK2j3kL4n5m6...") ✅
     - name ✅
     - age ✅

3. **Test Unlocking an Artwork**
   - In your app code, add a test button somewhere:
   ```typescript
   import { unlockArtwork } from '@/services/userService';
   
   // When user taps an artwork or completes an action
   const handleUnlock = async () => {
     const success = await unlockArtwork(1); // Use your actual artwork ID
     if (success) {
       Alert.alert('Success', 'Artwork unlocked!');
     }
   };
   ```

4. **Verify Unlock in Strapi**
   - Go to Strapi Admin → **Content Manager** → **User Unlocked Artwork**
   - You should see a new entry with:
     - user: (your user)
     - artwork: (the artwork you unlocked)
     - unlockedAt: (current timestamp)

5. **Test Getting Unlocked Artworks**
   - In your app:
   ```typescript
   import { getUnlockedArtworks } from '@/services/userService';
   
   const unlockedIds = await getUnlockedArtworks();
   console.log('Unlocked artwork IDs:', unlockedIds); // [1, 5, 7, ...]
   ```

---

## Troubleshooting

### Error: "Forbidden" or 403
- **Cause**: Permissions not set correctly
- **Fix**: Go back to Step 3 and verify all permissions are checked
- **Also check**: Make sure you're passing the JWT token in requests

### Error: "firebaseUID field does not exist"
- **Cause**: Field not added to User model or server didn't restart
- **Fix**: Go to Content-Type Builder → User → Add firebaseUID field → Save and wait for restart

### Error: "user-unlocked-artworks not found"
- **Cause**: Collection not created or API ID is wrong
- **Fix**: Go to Content-Type Builder and verify "User Unlocked Artwork" collection exists
- **Check**: API ID should be exactly `user-unlocked-artwork` (singular)

### Users can't see each other's unlocked artworks
- **This is correct!** Each user has their own dataset
- **How it works**: When querying, we filter by `user.id` so each user only sees their own unlocks

### Error: "Cannot read property 'id' of null"
- **Cause**: User not logged in or token expired
- **Fix**: Check AsyncStorage has `strapiToken` and `strapiUserId`
- **Also**: Make sure login/register properly saves user data

### Strapi server keeps restarting
- **Cause**: You may have made an invalid configuration
- **Fix**: Check the Strapi logs in the admin panel
- **Last resort**: Revert the content type changes and try again

---

## How It Works

### User Registration/Login Flow:
1. User registers/logs in with Firebase Authentication
2. Firebase ID token is sent to Strapi (`/api/auth/firebase`)
3. Strapi verifies the token and creates/updates user with Firebase UID
4. Returns Strapi JWT token and user data
5. React Native app stores: `strapiToken`, `strapiUserId`, `firebaseUID`, `userEmail`

### Unlocking Artworks:
1. When user scans/views an artwork and unlocks it
2. Call `unlockArtwork(artworkId)` from `userService.ts`
3. This creates a record in `user-unlocked-artworks` linking the user to the artwork
4. Each user has their own separate dataset

### Viewing Unlocked Artworks:
1. Call `getUnlockedArtworks()` to get array of unlocked artwork IDs
2. Call `isArtworkUnlocked(artworkId)` to check if specific artwork is unlocked
3. Filter UI to show locked/unlocked states

---

## Usage Examples

```typescript
import { 
  unlockArtwork, 
  getUnlockedArtworks, 
  isArtworkUnlocked,
  getCurrentUser 
} from '@/services/userService';

// Check current user
const user = await getCurrentUser();
if (user) {
  console.log('Logged in as:', user.userEmail);
  console.log('Firebase UID:', user.firebaseUID);
}

// Unlock an artwork
const success = await unlockArtwork(123);
if (success) {
  console.log('Artwork unlocked!');
}

// Get all unlocked artworks
const unlockedIds = await getUnlockedArtworks();
console.log('You have unlocked:', unlockedIds.length, 'artworks');

// Check if specific artwork is unlocked
const isUnlocked = await isArtworkUnlocked(123);
if (isUnlocked) {
  console.log('You already unlocked this!');
}
```

---

## Database Structure

### users_permissions_user table:
- id
- username
- email
- firebaseUID (NEW)
- name (NEW)
- age (NEW)
- provider
- confirmed
- blocked

### user_unlocked_artworks table:
- id
- user_id (foreign key → users_permissions_user)
- artwork_id (foreign key → artworks)
- unlockedAt (timestamp)

Each row represents one unlocked artwork for one user, ensuring:
- ✅ Each user has their own dataset
- ✅ Artworks are linked to specific users via Firebase UID
- ✅ Progress is saved in Strapi Cloud database
- ✅ Users can see their locked/unlocked stickers

---

## Testing

1. Register a new user in your app
2. Check Strapi Admin → Content Manager → User
3. Verify the user has a `firebaseUID`
4. Use the app to unlock an artwork
5. Check Strapi Admin → Content Manager → User Unlocked Artwork
6. Verify the record exists with correct user and artwork IDs

---

## Important Notes

### Security & Performance:
- Make sure your Strapi server is running and accessible at all times
- The Firebase Admin SDK must be properly configured in Strapi (check `firebase-service-account.json`)
- JWT tokens expire after a certain time - handle 401 authentication errors in your app by re-authenticating
- Consider adding database indices on `firebaseUID` and `user_id` for better query performance

### Preventing Duplicate Unlocks:
- The current implementation allows duplicate unlock records (same user + artwork multiple times)
- **Optional**: To prevent duplicates, you can add a unique constraint in Strapi:
  1. Go to Content-Type Builder → User Unlocked Artwork → Advanced Settings
  2. Add unique index on combination of `user` + `artwork` fields
- **Or**: Check before unlocking in your app:
  ```typescript
  const alreadyUnlocked = await isArtworkUnlocked(artworkId);
  if (!alreadyUnlocked) {
    await unlockArtwork(artworkId);
  }
  ```

### Data Privacy:
- User data (name, age) is stored in Strapi Cloud - ensure you comply with privacy regulations
- Firebase UIDs are unique identifiers - never expose them in public APIs
- Consider adding a privacy policy in your app

### Future Enhancements:
- Add achievement badges based on number of unlocked artworks
- Track unlock timestamps to create user activity timelines
- Add social features (share unlocked artworks with friends)
- Implement unlock rewards or gamification
- Add analytics to track which artworks are most popular
