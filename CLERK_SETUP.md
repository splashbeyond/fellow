# Clerk Authentication Setup

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## Step 2: Get Your Publishable Key

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the `frontend` directory (or update existing one):
   ```env
   VITE_SIGNALING_SERVER_URL=http://localhost:3001
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

2. Replace `pk_test_your_key_here` with your actual Clerk Publishable Key

## Step 4: Configure Clerk Settings

In your Clerk Dashboard:

1. Go to **User & Authentication** → **Email, Phone, Username**
   - Enable the authentication methods you want (Email, Google, etc.)

2. Go to **Paths**
   - Set **Sign-in path**: `/sign-in`
   - Set **Sign-up path**: `/sign-up`

3. (Optional) Go to **Appearance** to customize the look to match your color scheme

## Step 5: Restart Your Dev Server

```bash
cd frontend
npm run dev
```

## Features Included

- ✅ Sign in/Sign up pages with your color scheme
- ✅ User button in top-right corner
- ✅ Protected routes (users must sign in to use video chat)
- ✅ User session management
- ✅ Social login support (if configured in Clerk)

## Next Steps (Optional)

- Add user profile information to the UI
- Store user data in your backend
- Add role-based access control
- Customize the Clerk UI further to match your design

