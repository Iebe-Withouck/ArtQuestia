# ✅ Strapi Cloud Collection Type Verification Checklist

## How to Check Your Strapi Cloud Setup

### Step 1: Login to Strapi Cloud Admin

1. Go to: **https://colorful-charity-cafd22260f.strapiapp.com/admin**
2. Login with your admin credentials

---

## Step 2: Verify User Model Custom Fields

1. In the left sidebar, click **"Content-Type Builder"**
2. Under **"USER & PERMISSIONS PLUGIN"** section, click on **"User"**

### ✅ Check these fields exist:

- [ ] **firebaseUID**
  - Type: Text
  - Should show: "Unique" badge
  - If missing: Click "+ Add another field" → Text → Name: `firebaseUID` → Advanced Settings → Check "Unique"

- [ ] **name**
  - Type: Text
  - If missing: Click "+ Add another field" → Text → Name: `name`

- [ ] **age**
  - Type: Text or Number
  - If missing: Click "+ Add another field" → Text/Number → Name: `age`

**If you made changes:** Click **"Save"** and wait for server restart (10-30 seconds)

---

## Step 3: Verify User Unlocked Artwork Collection

1. Still in **"Content-Type Builder"**
2. Under **"COLLECTION TYPES"** section, look for **"User Unlocked Artwork"**

### ✅ If it exists, click on it and verify:

- [ ] **user** field
  - Type: Relation
  - Should show: "Relation with User (from: users-permissions)"
  - Relation type: Many-to-One (User Unlocked Artwork → User)

- [ ] **artwork** field
  - Type: Relation
  - Should show: "Relation with Artwork"
  - Relation type: Many-to-One (User Unlocked Artwork → Artwork)

- [ ] **unlockedAt** field
  - Type: Date (datetime)

### ❌ If "User Unlocked Artwork" doesn't exist:

1. Click **"+ Create new collection type"**
2. Display name: `User Unlocked Artwork`
3. API ID (Singular): `user-unlocked-artwork` (should auto-fill)
4. Click **"Continue"**
5. Add these fields:
   - **Relation** → Name: `user` → Select "User (from: users-permissions)" → Choose "Many-to-One"
   - **Relation** → Name: `artwork` → Select "Artwork" → Choose "Many-to-One"
   - **Date** → Name: `unlockedAt` → Type: datetime
6. Click **"Save"** and wait for restart

---

## Step 4: Verify Permissions

1. In the left sidebar, click **"Settings"** (gear icon at bottom)
2. Under **"USERS & PERMISSIONS PLUGIN"**, click **"Roles"**
3. Click on **"Authenticated"** role

### ✅ Check User-unlocked-artwork permissions:

Scroll down to find **"User-unlocked-artwork"** section:

- [ ] **find** - ✅ Should be checked
- [ ] **findOne** - ✅ Should be checked
- [ ] **create** - ✅ Should be checked
- [ ] **update** - ❌ Should be unchecked (users shouldn't modify)
- [ ] **delete** - ❌ Should be unchecked (users shouldn't delete)

### ✅ Check User permissions:

Scroll to find **"User"** section (under Users-permissions):

- [ ] **find** - ✅ Should be checked
- [ ] **findOne** - ✅ Should be checked
- [ ] **update** - ✅ Should be checked
- [ ] **me** - ✅ Should be checked

### ✅ Check Artwork permissions:

- [ ] **find** - ✅ Should be checked
- [ ] **findOne** - ✅ Should be checked

**If you made changes:** Scroll to top and click **"Save"**

---

## Step 5: Test API Endpoints

After verifying the setup, test if the API endpoints work:

### Test 1: Check collection exists
```bash
curl "https://colorful-charity-cafd22260f.strapiapp.com/api/user-unlocked-artworks"
```
**Expected:** `{"data":null,"error":{"status":403...}}`  
✅ This means collection exists (403 = needs auth, 404 = doesn't exist)

### Test 2: Check with authentication (after fixing Firebase)
After you login successfully in your app, you should see these logs:
```
User data saved: { strapiUserId: X, firebaseUID: "...", email: "..." }
```

---

## Step 6: Check Current Data

1. In Strapi Admin, click **"Content Manager"** (left sidebar)
2. Check **"User"** (under Users & Permissions Plugin)
   - Click on any user
   - Verify if `firebaseUID`, `name`, `age` fields are visible

3. Check **"User Unlocked Artwork"** (if you have any data)
   - Should show entries with user + artwork relations

---

## Common Issues & Solutions

### Issue: "User Unlocked Artwork" not in Content-Type Builder
**Solution:** Create it using Step 3 instructions above

### Issue: Fields missing from User model
**Solution:** Add them using Step 2 instructions above

### Issue: Permissions not set
**Solution:** Set them using Step 4 instructions above

### Issue: Can see collection in Content-Type Builder but not in Content Manager
**Solution:** 
1. Check if collection was saved properly (click on it in Content-Type Builder)
2. Try refreshing the browser
3. Check if Strapi finished restarting

### Issue: Relation fields showing error
**Solution:**
1. Make sure both User and Artwork collections exist
2. Re-create the relation fields if needed
3. Save and restart Strapi

---

## What Should Work After This:

1. ✅ Login to app → User data saved with Strapi ID and Firebase UID
2. ✅ Unlock artwork in AR → Data saved to Strapi Cloud
3. ✅ Close and reopen app → Unlocked artworks still show as unlocked
4. ✅ Check Strapi Admin → See unlocked artworks in database

---

## Quick Visual Check in Strapi Admin

**Content-Type Builder should look like this:**

```
COLLECTION TYPES
  ├─ Artwork
  ├─ Theme
  └─ User Unlocked Artwork  ← Should be here

USER & PERMISSIONS PLUGIN
  └─ User
      ├─ email (email)
      ├─ username (text)
      ├─ firebaseUID (text, unique)  ← Should be here
      ├─ name (text)  ← Should be here
      ├─ age (text/number)  ← Should be here
      └─ ... (other default fields)
```

---

## After Verification

Once you've checked everything:

1. If you made any changes, **restart your React Native app**
2. Try logging in again
3. Try unlocking an artwork
4. Check Strapi Admin → Content Manager → User Unlocked Artwork for new entries

---

## Need Help?

Take screenshots of:
1. Content-Type Builder → User (showing all fields)
2. Content-Type Builder → User Unlocked Artwork (showing all fields)
3. Settings → Roles → Authenticated → User-unlocked-artwork permissions
4. Any error messages in app console

This will help identify exactly what's missing or misconfigured.
