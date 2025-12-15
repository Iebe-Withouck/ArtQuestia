# 🔥 Fix: Firebase is not configured in Strapi Cloud

## The Problem

Your Strapi Cloud instance can't verify Firebase authentication tokens because it doesn't have the Firebase Admin SDK credentials. The `firebase-service-account.json` file only exists on your local computer, not on Strapi Cloud.

## Solution: Add Firebase Credentials to Strapi Cloud

### Step 1: Get Your Firebase Credentials

1. **Open your Firebase Service Account file:**
   - Location: `/Users/witho/Desktop/BAP/ArtQuestia/artworks/firebase-service-account.json`
   - Open it with a text editor

2. **You'll see something like this:**
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     ...
   }
   ```

3. **Copy these 3 values:**
   - `project_id`
   - `client_email`
   - `private_key` (the entire thing, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

### Step 2: Add Environment Variables to Strapi Cloud

1. **Login to Strapi Cloud:**
   - Go to: https://cloud.strapi.io/
   - Find your project (colorful-charity-cafd22260f)

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Variables** (or **Environment Variables**)

3. **Add these 3 variables:**

   **Variable 1:**
   - Name: `FIREBASE_PROJECT_ID`
   - Value: (paste your `project_id` value)

   **Variable 2:**
   - Name: `FIREBASE_CLIENT_EMAIL`
   - Value: (paste your `client_email` value)

   **Variable 3:**
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: (paste your `private_key` value - the entire thing)
   - ⚠️ **Important:** Make sure to include the entire key with line breaks

4. **Save and Redeploy:**
   - Click **Save** or **Add Variable**
   - Strapi Cloud will automatically redeploy your instance
   - Wait 1-2 minutes for deployment to complete

### Step 3: Verify It Works

1. **Wait for Strapi to finish redeploying** (check deployment status in Strapi Cloud dashboard)

2. **Close and restart your React Native app**

3. **Try logging in again**

4. **Check console logs** - you should now see:
   ```
   Successfully authenticated with Strapi: { jwt: "...", user: {...} }
   User data saved: { strapiUserId: X, firebaseUID: "...", email: "..." }
   ```

---

## Alternative: Quick Test Locally First

If you want to test locally before deploying to Strapi Cloud:

### Run Strapi Locally:

```bash
cd /Users/witho/Desktop/BAP/ArtQuestia/artworks
npm run develop
```

This will start Strapi on `http://localhost:1337` and it will use your local `firebase-service-account.json` file.

### Update React Native App to Use Local Strapi:

In your React Native app, temporarily change the STRAPI_URL:

```typescript
// In login.tsx, register.tsx, and userService.ts
const STRAPI_URL = 'http://localhost:1337'; // For testing locally
```

**Note:** Make sure to change it back to the cloud URL after testing!

---

## Troubleshooting

### Error: "Firebase is not configured"
- ✅ Make sure all 3 environment variables are added in Strapi Cloud
- ✅ Check that variable names are EXACTLY: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- ✅ Wait for Strapi Cloud to finish redeploying
- ✅ Verify the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Error: "Invalid private key"
- The private key must include line breaks (`\n`)
- Copy the ENTIRE private key from the JSON file
- Don't add extra spaces or formatting

### Can't find Environment Variables in Strapi Cloud
- Look for: Settings → Variables
- Or: Settings → Environment Variables
- Or: Project Settings → Configuration

### Still not working?
1. Check Strapi Cloud logs for errors
2. Verify your Firebase service account has Admin SDK access
3. Make sure your Firebase project is active
4. Try running Strapi locally first to confirm the file works

---

## Security Note

⚠️ **Never commit `firebase-service-account.json` to Git!**

Make sure it's in your `.gitignore` file:
```
firebase-service-account.json
```

The file contains sensitive credentials that should never be shared publicly.

---

## After Adding Variables

Once you've added the environment variables to Strapi Cloud:

1. ✅ Strapi will redeploy automatically
2. ✅ Firebase authentication will work
3. ✅ You can login to your app
4. ✅ Unlocked artworks will be saved to Strapi Cloud database
5. ✅ Everything will work as expected!

---

## Quick Command to View Your Credentials

Run this in terminal to see your credentials (without exposing private key):

```bash
cat /Users/witho/Desktop/BAP/ArtQuestia/artworks/firebase-service-account.json | grep -E "project_id|client_email" 
```

This will show you the project ID and client email you need to copy.
