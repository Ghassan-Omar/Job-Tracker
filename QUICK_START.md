# Quick Start Guide - Job Tracker Application

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd job-tracker
pnpm install
```

### Step 2: Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Get your config from Project Settings > General > Your apps

### Step 3: Configure Firebase
1. Copy `firebase-config-demo.js` to `firebase-config.js`
2. Replace the demo values with your Firebase config:

```javascript
// firebase-config.js
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

3. Update `src/firebase.js` line 6:
```javascript
import { firebaseConfig } from '../firebase-config.js';
```

### Step 4: Set Firestore Rules
In Firebase Console > Firestore > Rules, paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobApplications/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Step 5: Run the Application
```bash
pnpm run dev
```

Visit `http://localhost:5173` and start tracking your job applications!

## 📱 Features Overview

- **Authentication**: Secure sign up/sign in
- **Dashboard**: Statistics and progress tracking
- **CRUD Operations**: Add, edit, delete job applications
- **Search & Filter**: Find applications quickly
- **Status Tracking**: Applied, Interview, Offer, Rejected, Withdrawn
- **Responsive Design**: Works on all devices

## 🔧 Troubleshooting

**Firebase Error?** 
- Check your config values
- Ensure Auth and Firestore are enabled
- Verify security rules are set

**Build Issues?**
- Clear cache: `rm -rf node_modules && pnpm install`
- Check Node.js version (v18+)

## 📦 Deployment

**Build for production:**
```bash
pnpm run build
```

**Deploy to Vercel/Netlify:**
- Upload the `dist/` folder
- Set environment variables for Firebase config

---

**Need help?** Check the full README.md for detailed instructions.

