# Game Requests Feature Documentation

## Overview
This document describes the newly implemented Game Requests feature that allows users to submit game files for admin review and approval.

## Features Implemented

### 1. Admin Role System
- Added `role` column to `users` table with values: `'user'` (default) or `'admin'`
- Admin users have special permissions to manage game requests

### 2. Game Requests System
- **Request Submission**: Users can upload ZIP files containing games
- **Status Management**: Requests have three states:
  - `waiting` (default) - Pending admin review
  - `accepted` - Approved by admin
  - `declined` - Rejected by admin
- **Admin Review**: Admins can review, approve/decline requests with notes

### 3. Storage System
- **Requests Bucket**: New Supabase storage bucket for uploaded game files
- **File Security**: Users can only access their own files, admins can access all
- **File Validation**: Only ZIP files up to 100MB are accepted

### 4. User Interface Components

#### For Regular Users:
- **Game Request Upload Form** (`GameRequestUpload.tsx`)
  - Title, description, category selection
  - ZIP file upload with validation
  - Real-time upload progress and error handling

- **Request History** (`GameRequestList.tsx`)
  - View all submitted requests
  - Status tracking with color-coded badges
  - Admin notes display for declined/accepted requests

#### For Admins:
- **Admin Dashboard** (`AdminRequestDashboard.tsx`)
  - View all user requests with filtering
  - Statistics overview (total, waiting, accepted, declined)
  - Download submitted files for review
  - Approve/decline requests with admin notes

### 5. Navigation Integration
- Added "Game Requests" tab to user dashboard
- Added "Admin" tab (only visible to admin users)
- Both desktop and mobile navigation support

## Database Schema

### Updated Users Table
```sql
ALTER TABLE public.users ADD COLUMN role text CHECK (role IN ('user','admin')) DEFAULT 'user';
```

### New Game Requests Table
```sql
CREATE TABLE public.game_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('Strategi','Aksi','Horor','Arcade','Puzzle')) DEFAULT 'Arcade',
  file_path text NOT NULL,
  status text CHECK (status IN ('waiting','accepted','declined')) DEFAULT 'waiting',
  admin_notes text,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Security & Permissions

### Row Level Security (RLS) Policies
- Users can only view/create their own requests
- Users can only update their own requests if status is 'waiting'
- Admins can view and update all requests

### Storage Policies
- Users can upload to requests bucket
- Users can only read their own uploaded files
- Admins can read and delete all request files

## API Services

### GameRequestService (`gameRequestService.ts`)
- `createRequest()` - Submit new game request
- `getUserRequests()` - Get user's own requests
- `getAllRequests()` - Get all requests (admin only)
- `updateRequestStatus()` - Update request status (admin only)
- `deleteRequest()` - Delete request and file
- `getRequestFileUrl()` - Get signed download URL (admin only)
- `isUserAdmin()` - Check if user has admin role

## Setup Instructions

### 1. Database Migration
Run the migration file to set up the database:
```sql
-- Apply the migration
\i supabase/migrations/add_game_requests_feature.sql
```

### 2. Create Admin User
To make a user an admin, update their role in the database:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
```

### 3. Storage Bucket
The migration automatically creates the 'requests' storage bucket with appropriate policies.

## Usage Flow

### For Users:
1. Navigate to Dashboard → Game Requests
2. Fill out the upload form with game details
3. Upload ZIP file containing the game
4. Track request status in the requests list
5. View admin feedback if request is declined

### For Admins:
1. Navigate to Dashboard → Admin
2. View all pending requests with statistics
3. Download and review submitted game files
4. Approve or decline requests with optional notes
5. Monitor overall request activity

## File Structure
```
src/
├── components/
│   ├── admin/
│   │   └── AdminRequestDashboard.tsx
│   └── requests/
│       ├── GameRequestUpload.tsx
│       ├── GameRequestList.tsx
│       └── GameRequestManager.tsx
├── services/
│   └── gameRequestService.ts
└── lib/
    └── supabase.ts (updated with new types)

supabase/
└── migrations/
    └── add_game_requests_feature.sql
```

## Security Considerations
- File uploads are validated for type and size
- All database operations use RLS policies
- Admin privileges are checked server-side
- File access is controlled through signed URLs
- User input is sanitized and validated

## Future Enhancements
- Email notifications for request status changes
- Bulk admin operations
- Request categories management
- File preview capabilities
- Advanced search and filtering
- Request comments/discussion system
