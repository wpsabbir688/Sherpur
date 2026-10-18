import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/firestoreError';
import { ContactMessage } from '../types';

const CONTACTS_COL = 'contacts';

export async function submitContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<string> {
  const id = `msg-${Date.now()}`;
  try {
    const docRef = doc(db, CONTACTS_COL, id);
    await setDoc(docRef, {
      name: message.name,
      email: message.email,
      phone: message.phone || '',
      message: message.message,
      createdAt: new Date().toISOString(),
      status: 'unread',
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${CONTACTS_COL}/${id}`);
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const colRef = collection(db, CONTACTS_COL);
    const snapshot = await getDocs(colRef);
    const messages: ContactMessage[] = [];
    snapshot.forEach(docSnap => {
      messages.push({ id: docSnap.id, ...docSnap.data() } as ContactMessage);
    });
    return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CONTACTS_COL);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const docRef = doc(db, CONTACTS_COL, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONTACTS_COL}/${id}`);
  }
}
