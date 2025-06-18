// src/services/classService.js
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  getDoc,
  getDocs,
  query,
  where 
} from 'firebase/firestore';

// Add a new class with owner information
export const addClass = async (classData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const classWithOwner = {
      ...classData,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
      active: true,
      alerts: 0,
      students: classData.students || 0
    };

    const docRef = await addDoc(collection(db, "classes"), classWithOwner);
    return { ...classWithOwner, id: docRef.id };
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

// Get all classes for current user
export const getClasses = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, "classes"),
      where("ownerId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Convert Firestore Timestamp to Date if needed
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error("Error getting classes:", error);
    throw error;
  }
};

// Update class active status
export const updateClassActiveStatus = async (classId, isActive) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify the class belongs to the user
    const classRef = doc(db, "classes", classId);
    const classSnap = await getDoc(classRef);
    
    if (!classSnap.exists()) {
      throw new Error('Class not found');
    }

    if (classSnap.data().ownerId !== user.uid) {
      throw new Error('Unauthorized to update this class');
    }

    await updateDoc(classRef, { 
      active: isActive,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

// Subscribe to real-time updates for current user's classes
export const subscribeToClasses = (callback) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const q = query(
    collection(db, "classes"),
    where("ownerId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to Date if needed
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
      callback(classes);
    },
    (error) => {
      console.error("Real-time subscription error:", error);
    }
  );

  return unsubscribe;
};