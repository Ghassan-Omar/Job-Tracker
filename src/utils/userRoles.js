// User Roles Management System
import { doc, getDoc, setDoc, collection, query, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// User roles constants
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

// Admin email addresses (you can modify this list)
const ADMIN_EMAILS = [
  'admin@jobtracker.com',
  'admin2@jobtracker.com',
  // Add your admin email here
];

/**
 * Initialize user profile in Firestore
 * @param {Object} user - Firebase user object
 */
export const initializeUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Determine user role based on email
      const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
        role: isAdmin ? USER_ROLES.ADMIN : USER_ROLES.USER,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        displayName: user.displayName || user.email.split('@')[0],
      };
      
      await setDoc(userRef, userProfile);
      return userProfile;
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
      return userDoc.data();
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Check if user has admin role
 * @param {string} userId - User ID
 */
export const isUserAdmin = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

/**
 * Get all users (admin only)
 * @param {string} requestingUserId - ID of user making the request
 */
export const getAllUsers = async (requestingUserId) => {
  try {
    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Update user role (admin only)
 * @param {string} requestingUserId - ID of user making the request
 * @param {string} targetUserId - ID of user to update
 * @param {string} newRole - New role to assign
 */
export const updateUserRole = async (requestingUserId, targetUserId, newRole) => {
  try {
    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Validate role
    if (!Object.values(USER_ROLES).includes(newRole)) {
      throw new Error('Invalid role specified');
    }
    
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Toggle user active status (admin only)
 * @param {string} requestingUserId - ID of user making the request
 * @param {string} targetUserId - ID of user to update
 * @param {boolean} isActive - New active status
 */
export const toggleUserStatus = async (requestingUserId, targetUserId, isActive) => {
  try {
    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      isActive: isActive,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Get user statistics for admin dashboard
 * @param {string} requestingUserId - ID of user making the request
 */
export const getUserStatistics = async (requestingUserId) => {
  try {
    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserId);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const users = await getAllUsers(requestingUserId);
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      adminUsers: users.filter(user => user.role === USER_ROLES.ADMIN).length,
      regularUsers: users.filter(user => user.role === USER_ROLES.USER).length,
      moderatorUsers: users.filter(user => user.role === USER_ROLES.MODERATOR).length,
      recentUsers: users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
};