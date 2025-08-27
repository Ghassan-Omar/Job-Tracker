# Job Tracker Application

A modern, responsive React application for tracking job applications with Firebase backend integration. Built with Material UI for a professional and polished user experience.

## Features

- **User Authentication**: Secure sign-up and sign-in with Firebase Auth
- **CRUD Operations**: Create, Read, Update, and Delete job applications
- **Real-time Data**: Live updates with Firebase Firestore
- **Search & Filter**: Find applications by company, position, or location
- **Status Tracking**: Track application status (Applied, Interview, Offer, Rejected, Withdrawn)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Material UI components with modern design

## Technologies Used

- **Frontend**: React 19, Material UI, Emotion
- **Backend**: Firebase (Authentication, Firestore)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Styling**: Material UI with custom theming

## Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- Firebase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd job-tracker

# Install dependencies
pnpm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create a database in test mode

### 3. Configure Firebase

1. In Firebase Console, go to Project Settings > General > Your apps
2. Click "Add app" and select "Web"
3. Register your app and copy the configuration object
4. Copy `firebase-config-demo.js` to `firebase-config.js`
5. Replace the demo values with your actual Firebase configuration:

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

6. Update `src/firebase.js` to import from your config file:

```javascript
import { firebaseConfig } from '../firebase-config.js';
```

### 4. Firestore Security Rules

Set up security rules in Firestore to ensure users can only access their own data:

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

### 5. Run the Application

```bash
# Start the development server
pnpm run dev

# Or with host flag for external access
pnpm run dev --host
```

The application will be available at `http://localhost:5173`

## Usage

### Getting Started

1. **Sign Up**: Create a new account with your email and password
2. **Sign In**: Log in with your credentials
3. **Add Applications**: Click the + button to add new job applications
4. **Manage Applications**: Edit, delete, or update the status of your applications
5. **Search & Filter**: Use the search bar and status filter to find specific applications

### Application Fields

- **Company**: Name of the company (required)
- **Position**: Job title or position (required)
- **Location**: Job location (optional)
- **Salary Range**: Expected or offered salary (optional)
- **Status**: Current application status
- **Application Date**: Date when you applied
- **Job URL**: Link to the job posting (optional)
- **Notes**: Additional notes about the application (optional)

### Status Options

- **Applied**: Initial application submitted
- **Interview Scheduled**: Interview arranged
- **Offer Received**: Job offer received
- **Rejected**: Application rejected
- **Withdrawn**: Application withdrawn

## Project Structure

```
job-tracker/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and static files
│   ├── components/        # React components
│   │   ├── AuthComponent.jsx
│   │   ├── JobApplicationForm.jsx
│   │   └── JobApplicationList.jsx
│   ├── firebase.js        # Firebase configuration
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.jsx          # Application entry point
├── firebase-config-demo.js # Demo Firebase config
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Building for Production

```bash
# Build the application
pnpm run build

# Preview the production build
pnpm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## Deployment Options

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables for Firebase configuration
3. Deploy automatically on push

### Netlify
1. Build the project: `pnpm run build`
2. Upload the `dist/` folder to Netlify
3. Configure environment variables

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize hosting: `firebase init hosting`
3. Build and deploy: `pnpm run build && firebase deploy`

## Environment Variables (Optional)

For production deployments, you can use environment variables instead of the config file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Ensure your Firebase config is correct
   - Check that Authentication and Firestore are enabled
   - Verify security rules are properly set

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
   - Check for TypeScript errors if using TypeScript

3. **Authentication Issues**
   - Ensure Email/Password provider is enabled in Firebase Auth
   - Check browser console for detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check the browser console for error messages
4. Create an issue in the repository

---

**Happy job hunting!**