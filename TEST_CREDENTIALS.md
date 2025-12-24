# ✅ Test User Credentials

## Test User Created Successfully!

**Email:** `test@gmail.com`  
**Password:** `Test@123`  
**Role:** Candidate

## How to Login

1. Go to: http://localhost:3000/login
2. Enter:
   - Email: `test@gmail.com`
   - Password: `Test@123`
3. Click "Login"

## Other Test Users

**Admin User:**
- Email: `admin@musthire.com`
- Password: `admin123`
- Role: Admin

**HR User:**
- Email: `hr@musthire.com`
- Password: `hr123`
- Role: HR

## API Login Test

You can also test login via API:

```bash
curl -X POST "http://localhost:8002/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "password": "Test@123"}'
```

## Status

✅ User created in database  
✅ Password hashed correctly  
✅ User is active  
✅ Email is verified  
✅ Ready to login!

