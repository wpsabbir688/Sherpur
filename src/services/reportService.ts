import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { ContentReport, ReportStatus, ReportTargetType } from '../types/community';

const REPORTS_COL = 'reports';

export async function submitContentReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  reportedBy: string;
  reportedByName?: string;
}): Promise<ContentReport> {
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const report: ContentReport = {
    id: reportId,
    targetType: input.targetType,
    targetId: input.targetId,
    targetTitle: input.targetTitle,
    reason: input.reason,
    details: input.details,
    reportedBy: input.reportedBy,
    reportedByName: input.reportedByName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, REPORTS_COL, reportId), report);
  } catch (err) {
    console.warn('Could not save report to Firestore, saving to local reports:', err);
    try {
      const local = JSON.parse(localStorage.getItem('sherpur_reports_cache') || '[]');
      local.push(report);
      localStorage.setItem('sherpur_reports_cache', JSON.stringify(local));
    } catch {}
  }

  return report;
}

export async function getReportsForAdmin(statusFilter?: ReportStatus): Promise<ContentReport[]> {
  try {
    const colRef = collection(db, REPORTS_COL);
    let q = query(colRef);
    if (statusFilter) {
      q = query(colRef, where('status', '==', statusFilter));
    }
    const snap = await getDocs(q);
    const list: ContentReport[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ContentReport));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error reading reports from Firestore:', err);
    try {
      return JSON.parse(localStorage.getItem('sherpur_reports_cache') || '[]');
    } catch {
      return [];
    }
  }
}

export async function resolveReport(
  reportId: string,
  resolvedBy: string,
  resolutionNotes?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, REPORTS_COL, reportId), {
      status: 'resolved',
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    });
  } catch (err) {
    console.error('Error resolving report:', err);
  }
}

export async function dismissReport(
  reportId: string,
  resolvedBy: string
): Promise<void> {
  try {
    await updateDoc(doc(db, REPORTS_COL, reportId), {
      status: 'dismissed',
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error dismissing report:', err);
  }
}
