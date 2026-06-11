import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  increment 
} from 'firebase/firestore';
import { db } from './config';
import { subjects, getLessonById, getTopicById } from '../data/curriculum';

// Create a new user profile in Firestore
export const createUserProfile = async (userId, username, email) => {
  const userRef = doc(db, 'users', userId);
  const initialData = {
    uid: userId,
    username: username || email.split('@')[0],
    email: email,
    profileImage: '',
    xp: 0,
    level: 1,
    streak: 0,
    completedLessons: [],
    completedTopics: [],
    achievements: [],
    createdAt: new Date().toISOString(),
    subjectProgress: {
      biology: 0,
      physics: 0,
      chemistry: 0
    }
  };

  try {
    await setDoc(userRef, initialData);
    return initialData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to initialize user profile in database.');
  }
};

// Retrieve a user profile from Firestore
export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to retrieve user profile data.');
  }
};

// Update user profile information (e.g., username, profile image)
export const updateUserProfile = async (userId, updates) => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, updates);
    // Fetch and return the updated profile
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.data();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile changes.');
  }
};

// Get the total number of lessons in a subject
export const getSubjectLessonsCount = (subjectId) => {
  const subject = subjects[subjectId];
  if (!subject) return 0;
  return subject.topics.reduce((acc, topic) => acc + topic.lessons.length, 0);
};

// Calculate level based on XP (e.g., 100 XP per level)
export const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

// Update progress for a specific subject
export const updateProgress = async (userId, subjectId) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return 0;

    const completed = userProfile.completedLessons || [];
    const subject = subjects[subjectId];
    if (!subject) return 0;

    // Filter completed lessons that belong to this subject
    const subjectLessonIds = [];
    subject.topics.forEach(topic => {
      topic.lessons.forEach(lesson => {
        subjectLessonIds.push(lesson.id);
      });
    });

    const completedInSubject = completed.filter(id => subjectLessonIds.includes(id));
    const totalLessons = subjectLessonIds.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedInSubject.length / totalLessons) * 100) : 0;

    await updateDoc(userRef, {
      [`subjectProgress.${subjectId}`]: progressPercent
    });

    return progressPercent;
  } catch (error) {
    console.error('Error updating subject progress:', error);
    throw error;
  }
};

// Mark a topic as completed
export const markTopicComplete = async (userId, topicId) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return;

    const completedTopics = userProfile.completedTopics || [];
    if (completedTopics.includes(topicId)) return; // Already completed

    // Topic completion reward: 100 XP
    const additionalXp = 100;
    const newXp = (userProfile.xp || 0) + additionalXp;
    const newLevel = calculateLevel(newXp);

    await updateDoc(userRef, {
      completedTopics: arrayUnion(topicId),
      xp: increment(additionalXp),
      level: newLevel
    });
  } catch (error) {
    console.error('Error marking topic complete:', error);
    throw error;
  }
};

// Mark a lesson as completed, and auto-update topic and subject progress
export const markLessonComplete = async (userId, lessonId) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) throw new Error('User profile not found.');

    const completedLessons = userProfile.completedLessons || [];
    if (completedLessons.includes(lessonId)) {
      return userProfile; // Already completed, no changes
    }

    // Get the lesson metadata to check for custom XP
    const lessonInfo = getLessonById(lessonId);
    const additionalXp = lessonInfo?.xp || 50;
    const newXp = (userProfile.xp || 0) + additionalXp;
    const newLevel = calculateLevel(newXp);

    // Add to completed lessons and update XP/Level
    await updateDoc(userRef, {
      completedLessons: arrayUnion(lessonId),
      xp: increment(additionalXp),
      level: newLevel
    });

    // Update subject progress
    if (lessonInfo) {
      const { subjectId, topicId } = lessonInfo;
      
      // Update subject progress
      await updateProgress(userId, subjectId);

      // Check if all lessons in the topic are now complete
      const topicInfo = getTopicById(topicId);
      if (topicInfo) {
        // Fetch fresh profile data to check completed lessons
        const freshProfile = await getUserProfile(userId);
        const updatedCompleted = freshProfile.completedLessons || [];
        const allLessonsCompleted = topicInfo.lessons.every(l => updatedCompleted.includes(l.id));

        if (allLessonsCompleted) {
          await markTopicComplete(userId, topicId);
        }
      }
    }

    // Return the updated profile document
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    throw error;
  }
};
