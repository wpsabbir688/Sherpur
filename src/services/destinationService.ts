import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/firestoreError';
import { Destination } from '../types';
import { INITIAL_DESTINATIONS } from '../data/initialData';

const DESTINATIONS_COL = 'destinations';

export async function getDestinations(includeDrafts = false): Promise<Destination[]> {
  try {
    const colRef = collection(db, DESTINATIONS_COL);
    let q = query(colRef);
    if (!includeDrafts) {
      q = query(colRef, where('status', '==', 'published'));
    }
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If Firestore is still empty before admin seeds it, serve initial verified data
      if (includeDrafts) {
        return INITIAL_DESTINATIONS;
      }
      return INITIAL_DESTINATIONS.filter(d => d.status === 'published');
    }

    const destinations: Destination[] = [];
    snapshot.forEach(docSnap => {
      destinations.push({ id: docSnap.id, ...docSnap.data() } as Destination);
    });
    return destinations;
  } catch (error) {
    console.warn('Firestore fetch destinations encountered error, falling back to local dataset:', error);
    try {
      handleFirestoreError(error, OperationType.LIST, DESTINATIONS_COL);
    } catch {
      // Return initial verified data so public visitors always have content
      if (includeDrafts) return INITIAL_DESTINATIONS;
      return INITIAL_DESTINATIONS.filter(d => d.status === 'published');
    }
  }
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const colRef = collection(db, DESTINATIONS_COL);
    const q = query(colRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Destination;
    }
    // Fallback search in initial data
    const found = INITIAL_DESTINATIONS.find(d => d.slug === slug);
    return found || null;
  } catch (error) {
    console.warn('Error fetching destination by slug:', error);
    const found = INITIAL_DESTINATIONS.find(d => d.slug === slug);
    return found || null;
  }
}

export async function saveDestination(dest: Partial<Destination>): Promise<string> {
  const destId = dest.id || dest.slug || `dest-${Date.now()}`;
  const now = new Date().toISOString();
  
  const payload: Record<string, any> = {
    titleBn: dest.titleBn || '',
    slug: dest.slug || destId,
    summaryBn: dest.summaryBn || '',
    upazilaId: dest.upazilaId || 'sherpur-sadar',
    status: dest.status || 'draft',
    updatedAt: now,
  };

  if (dest.titleEn) payload.titleEn = dest.titleEn;
  if (dest.descriptionBn) payload.descriptionBn = dest.descriptionBn;
  if (dest.categoryIds) payload.categoryIds = dest.categoryIds;
  if (dest.coverImage) payload.coverImage = dest.coverImage;
  if (dest.coverImageAlt) payload.coverImageAlt = dest.coverImageAlt;
  if (dest.locationName) payload.locationName = dest.locationName;
  if (dest.latitude !== undefined && dest.latitude !== null) payload.latitude = Number(dest.latitude);
  if (dest.longitude !== undefined && dest.longitude !== null) payload.longitude = Number(dest.longitude);
  if (dest.googleMapsUrl) payload.googleMapsUrl = dest.googleMapsUrl;
  if (dest.howToGetThereBn) payload.howToGetThereBn = dest.howToGetThereBn;
  if (dest.bestSeasonBn) payload.bestSeasonBn = dest.bestSeasonBn;
  if (dest.openingHours) payload.openingHours = dest.openingHours;
  if (dest.entryFee) payload.entryFee = dest.entryFee;
  if (dest.travelTipsBn) payload.travelTipsBn = dest.travelTipsBn;
  if (dest.accessibilityNotesBn) payload.accessibilityNotesBn = dest.accessibilityNotesBn;
  if (dest.safetyNotesBn) payload.safetyNotesBn = dest.safetyNotesBn;
  if (dest.lastVerifiedAt) payload.lastVerifiedAt = dest.lastVerifiedAt;
  if (dest.isFeatured !== undefined) payload.isFeatured = Boolean(dest.isFeatured);
  if (dest.createdAt) payload.createdAt = dest.createdAt;
  else payload.createdAt = now;

  try {
    const docRef = doc(db, DESTINATIONS_COL, destId);
    await setDoc(docRef, payload, { merge: true });
    return destId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DESTINATIONS_COL}/${destId}`);
  }
}

export async function deleteDestination(id: string): Promise<void> {
  try {
    const docRef = doc(db, DESTINATIONS_COL, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${DESTINATIONS_COL}/${id}`);
  }
}

export async function toggleDestinationStatus(id: string, newStatus: 'draft' | 'published'): Promise<void> {
  try {
    const docRef = doc(db, DESTINATIONS_COL, id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${DESTINATIONS_COL}/${id}`);
  }
}

export async function seedInitialDestinations(): Promise<number> {
  let count = 0;
  for (const item of INITIAL_DESTINATIONS) {
    try {
      const docRef = doc(db, DESTINATIONS_COL, item.id);
      await setDoc(docRef, {
        ...item,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      count++;
    } catch (e) {
      console.error(`Failed to seed ${item.id}:`, e);
    }
  }
  return count;
}
