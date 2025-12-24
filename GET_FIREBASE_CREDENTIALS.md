# 🔥 Get Firebase Credentials for JobHire Project

## Project Information
- **Project ID:** `jobhire-1766594347`
- **Project Name:** JobHire
- **Storage Bucket:** `jobhire-1766594347.appspot.com`
- **Firebase Console:** https://console.firebase.google.com/project/jobhire-1766594347/overview

## Step 1: Enable Firebase Storage

1. Go to Firebase Console: https://console.firebase.google.com/project/jobhire-1766594347/storage
2. Click **"Get Started"** if Storage is not enabled
3. Choose **"Start in test mode"** (we'll set rules later)
4. Select a location (choose closest to you, e.g., `us-central1`)
5. Click **"Done"**

## Step 2: Get Service Account Credentials

1. Go to: https://console.firebase.google.com/project/jobhire-1766594347/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. A dialog will appear - click **"Generate key"**
4. A JSON file will download (e.g., `jobhire-1766594347-firebase-adminsdk-xxxxx.json`)

## Step 3: Configure Docker Compose

### Option A: Using Environment Variables (Recommended)

1. Open the downloaded JSON file
2. Copy the **entire JSON content** (it's a single object)
3. Convert it to a single-line string (remove all newlines and extra spaces)
4. Add to your `.env` file or directly to `docker-compose.dev.yml`:

```yaml
backend:
  environment:
    - FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"jobhire-1766594347",...}'
    - FIREBASE_STORAGE_BUCKET=jobhire-1766594347.appspot.com
```

**Important:** The `FIREBASE_CREDENTIALS` must be a valid JSON string on a single line.

### Option B: Using a Script to Convert JSON

Run this command to convert the JSON file to a single-line string:

```bash
# Replace with your actual JSON file path
cat /path/to/jobhire-1766594347-firebase-adminsdk-xxxxx.json | jq -c . | sed "s/'/\\\'/g"
```

Then add the output to `docker-compose.dev.yml`:

```yaml
- FIREBASE_CREDENTIALS='<paste-output-here>'
```

## Step 4: Set Storage Security Rules

1. Go to: https://console.firebase.google.com/project/jobhire-1766594347/storage/rules
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to resumes
    match /resumes/{userId}/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Only authenticated users
    }
    
    // Allow read access to profile images
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Only authenticated users
    }
    
    // Allow read access to audio answers
    match /audio_answers/{applicationId}/{interviewId}/{audioId}/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Only authenticated users
    }
  }
}
```

3. Click **"Publish"**

## Step 5: Restart Backend

```bash
docker compose -f docker-compose.dev.yml restart backend
```

## Verification

After setup, test by uploading a resume. The file should be stored in Firebase Storage at:
- Path: `resumes/{user_id}.pdf`
- Public URL: `https://firebasestorage.googleapis.com/v0/b/jobhire-1766594347.appspot.com/o/resumes%2F{user_id}.pdf?alt=media`

## Quick Test

Once configured, you can test the connection:

```bash
docker compose -f docker-compose.dev.yml logs backend | grep -i firebase
```

You should see: `Firebase Admin SDK initialized successfully`

