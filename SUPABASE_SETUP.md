# Supabase Setup Guide

This guide will help you set up Supabase for user authentication and friend management in your React application.

## Prerequisites

1. Node.js and npm installed
2. A Supabase account (sign up at https://supabase.com)

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `game-online` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Wait for the project to be created (this may take a few minutes)

## Step 3: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 4: Set Up Environment Variables

1. Create a `.env` file in your project root:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to execute the SQL commands

This will create:
- `users` table for user profiles
- `friends` table for managing friendships
- Row Level Security (RLS) policies
- Triggers for automatic profile creation and timestamp updates

## Step 6: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173` (for development)
   - Enable email confirmations if desired

## Step 7: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. The authentication and friend management features should now work with your Supabase backend.

## Database Schema Overview

### Users Table
- Extends Supabase's built-in `auth.users`
- Stores additional profile information (username, full_name, avatar_url)
- Automatically created when a user signs up

### Friends Table
- Manages friendships between users
- Supports different statuses: `pending`, `accepted`, `blocked`
- Prevents duplicate friend requests
- Includes timestamps for tracking

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data and related friend data
- **Authentication Required**: All operations require a valid user session
- **Input Validation**: Services include error handling and validation
- **Unique Constraints**: Prevents duplicate usernames and friend relationships

## API Usage Examples

### Authentication
```typescript
import { AuthService } from './services/authService'

// Sign up
const { user, error } = await AuthService.signUp({
  email: 'user@example.com',
  password: 'password123',
  username: 'username'
})

// Sign in
const { user, error } = await AuthService.signIn({
  email: 'user@example.com',
  password: 'password123'
})
```

### Friend Management
```typescript
import { FriendService } from './services/friendService'

// Send friend request
const { friendship, error } = await FriendService.sendFriendRequest(friendId)

// Get friends list
const { friends, error } = await FriendService.getFriends('accepted')

// Search users
const { users, error } = await FriendService.searchUsers('username')
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env` file is in the project root and variables start with `VITE_`

2. **Database connection errors**: Verify your Supabase URL and anon key are correct

3. **RLS policy errors**: Ensure you've run the complete schema SQL and that users are properly authenticated

4. **Email confirmation issues**: Check your Supabase authentication settings and email templates

### Getting Help

- Check the browser console for detailed error messages
- Review the Supabase dashboard logs
- Ensure your database schema matches the provided SQL file
- Verify that RLS policies are properly configured

## Production Deployment

When deploying to production:

1. Update your Supabase project settings with your production URLs
2. Set up proper environment variables in your hosting platform
3. Configure email templates and SMTP settings in Supabase
4. Review and test all RLS policies
5. Set up database backups and monitoring
