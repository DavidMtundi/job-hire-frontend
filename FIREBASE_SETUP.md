# 🔥 Firebase Storage Setup Guide

## Overview
The project now uses **Firebase Storage** instead of AWS S3 for storing resumes and profile images. This is perfect for personal projects as Firebase has a generous free tier.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard
4. Enable **Firebase Storage** in the project

## Step 2: Get Firebase Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file (this contains your credentials)
5. **Important:** Keep this file secure and never commit it to version control

## Step 3: Get Storage Bucket Name

1. In Firebase Console, go to **Storage**
2. Your bucket name will be shown (format: `your-project-id.appspot.com`)
3. Copy this bucket name

## Step 4: Configure in Docker Compose

### Option 1: Environment Variable (Recommended)

Add to `docker-compose.dev.yml`:

```yaml
backend:
  environment:
    - FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
    - FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Note:** The `FIREBASE_CREDENTIALS` should be the entire JSON content as a single-line string.

### Option 2: Use .env File

1. Create a `.env` file in the frontend directory
2. Add:
   ```bash
   FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

3. Update `docker-compose.dev.yml`:
   ```yaml
   backend:
     environment:
       - FIREBASE_CREDENTIALS=${FIREBASE_CREDENTIALS}
       - FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
   ```

## Step 5: Set Storage Rules (Important!)

In Firebase Console → Storage → Rules, set:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to resumes
    match /resumes/{userId}/{allPaths=**} {
      allow read: if true;  // Public read (or restrict as needed)
      allow write: if request.auth != null;  // Only authenticated users
    }
    
    // Allow read access to profile images
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Only authenticated users
    }
  }
}
```

## Step 6: Restart Backend

```bash
docker compose -f docker-compose.dev.yml restart backend
```

## Verification

After setup, test by uploading a resume. The file should be stored in Firebase Storage at:
- Path: `resumes/{user_id}.pdf`
- Public URL: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/resumes%2F{user_id}.pdf?alt=media`

## Benefits of Firebase Storage

✅ **Free Tier:** 5GB storage, 1GB/day downloads (generous for personal projects)
✅ **Easy Setup:** No AWS account needed
✅ **CDN:** Automatic CDN for fast file delivery
✅ **Security:** Built-in authentication and security rules
✅ **Scalable:** Grows with your project

## Troubleshooting

### Error: "Firebase Storage is not configured"
- Check that `FIREBASE_CREDENTIALS` is set correctly
- Verify the JSON is valid (use a JSON validator)
- Ensure `FIREBASE_STORAGE_BUCKET` is set

### Error: "Permission denied"
- Check Firebase Storage rules
- Verify service account has Storage Admin role

### Files not accessible
- Check Storage rules allow public read (if needed)
- Verify bucket name is correct

## Security Note

⚠️ **Never commit Firebase credentials to version control!**
- Use environment variables
- Add `.env` to `.gitignore`
- Use secrets management in production

