import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/firestoreError';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';

const CATEGORIES_COL = 'categories';

export async function getCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, CATEGORIES_COL);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return INITIAL_CATEGORIES;
    }
    const categories: Category[] = [];
    snapshot.forEach(docSnap => {
      categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
    });
    return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.warn('Error fetching categories from Firestore, using initial:', error);
    return INITIAL_CATEGORIES;
  }
}

export async function saveCategory(category: Category): Promise<string> {
  const catId = category.id || category.slug;
  try {
    const docRef = doc(db, CATEGORIES_COL, catId);
    await setDoc(docRef, {
      nameBn: category.nameBn,
      slug: category.slug,
      nameEn: category.nameEn || '',
      descriptionBn: category.descriptionBn || '',
      icon: category.icon || 'Compass',
      order: category.order || 1,
    }, { merge: true });
    return catId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CATEGORIES_COL}/${catId}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COL, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COL}/${id}`);
  }
}

export async function seedInitialCategories(): Promise<number> {
  let count = 0;
  for (const cat of INITIAL_CATEGORIES) {
    try {
      const docRef = doc(db, CATEGORIES_COL, cat.id);
      await setDoc(docRef, cat, { merge: true });
      count++;
    } catch (e) {
      console.error(`Failed to seed category ${cat.id}:`, e);
    }
  }
  return count;
}
