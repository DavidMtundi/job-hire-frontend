# 🔑 How to Get Google Gemini API Key

## Direct Link to Create API Key

**👉 [Create Google AI Studio API Key](https://aistudio.google.com/apikey)**

## Step-by-Step Instructions

### 1. Go to Google AI Studio
Visit: **https://aistudio.google.com/apikey**

### 2. Sign In
- Sign in with your Google account
- If you don't have an account, create one at [accounts.google.com](https://accounts.google.com)

### 3. Create API Key
- Click **"Create API Key"** button
- Select or create a Google Cloud project
- The API key will be generated automatically

### 4. Copy Your API Key
- Copy the generated API key (it will look like: `AIzaSy...`)
- **Important:** Keep this key secure and don't share it publicly

## Setting Up in Your Project

### Option 1: Add to docker-compose.dev.yml

Edit `docker-compose.dev.yml` and add the API key to the backend environment:

```yaml
backend:
  environment:
    - GOOGLE_API_KEY=your-api-key-here
```

### Option 2: Use Environment Variable File

Create a `.env` file in the frontend directory:

```bash
GOOGLE_API_KEY=your-api-key-here
```

Then reference it in `docker-compose.dev.yml`:

```yaml
backend:
  environment:
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}
```

### Option 3: Export in Terminal

```bash
export GOOGLE_API_KEY=your-api-key-here
```

## After Adding the Key

1. Restart the backend service:
   ```bash
   docker compose -f docker-compose.dev.yml restart backend
   ```

2. Verify it's working:
   ```bash
   docker compose -f docker-compose.dev.yml exec backend python -c "from core.config import settings; print('GOOGLE_API_KEY:', 'SET' if settings.GOOGLE_API_KEY else 'NOT SET')"
   ```

## Important Notes

- ⚠️ **Free Tier:** Google AI Studio provides free API credits, but usage limits apply
- 🔒 **Security:** Never commit API keys to version control
- 💰 **Billing:** Monitor your usage to avoid unexpected charges
- 📊 **Quotas:** Check your quota limits in Google Cloud Console

## Alternative: Google Cloud Console

If you prefer using Google Cloud Console:
1. Go to: **https://console.cloud.google.com/**
2. Navigate to **APIs & Services** > **Credentials**
3. Click **Create Credentials** > **API Key**
4. Enable the **Generative Language API** for your project

## Need Help?

- Google AI Studio Docs: https://ai.google.dev/docs
- API Documentation: https://ai.google.dev/api
- Support: https://support.google.com/cloud

