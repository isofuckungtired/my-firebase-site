
// src/firebase/firestore-service.ts
import { db, firebaseInitialized } from '@/firebase/client';
import type { ProblemHistoryItem, KnowledgeNookHistoryItem, LeaderboardEntry } from '@/types';
import { collection, addDoc, query, getDocs, orderBy, doc, deleteDoc, Timestamp, where, limit as firestoreLimit } from 'firebase/firestore';

// Firestore 中 ProblemHistoryItem 的介面，確保 timestamp 是 Firestore Timestamp
interface FirestoreProblemHistoryItem extends Omit<ProblemHistoryItem, 'timestamp' | 'id' > {
  solution: string;
  timestamp: Timestamp;
  userId: string;
  problemImageUri?: string | null;
  problemStatement?: string | null;
  knowledgePoints?: string | null;
  userAttempt?: string | null;
  isIncorrectAttempt?: boolean;
}

interface FirestoreKnowledgeNookHistoryItem extends Omit<KnowledgeNookHistoryItem, 'timestamp' | 'id'> {
  knowledgePoints: string;
  timestamp: Timestamp;
  userId: string;
}

interface FirestoreLeaderboardEntry extends Omit<LeaderboardEntry, 'timestamp' | 'id'> {
  userId?: string | null;
  displayName: string;
  score: number;
  timestamp: Timestamp;
}


/**
 * 將單筆解題記錄儲存到使用者的 Firestore problemHistory 子集合中。
 * @param userId 使用者 ID
 * @param item 要儲存的解題記錄
 */
export async function saveProblemHistoryItem(userId: string, item: ProblemHistoryItem): Promise<string | null> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (saveProblemHistoryItem) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return null;
  }
  if (!userId) {
    console.error("儲存解題歷史錯誤：未提供使用者 ID");
    return null;
  }
  try {
    const historyCollectionRef = collection(db, 'users', userId, 'problemHistory');
    
    const dataToSave: Partial<FirestoreProblemHistoryItem> = { 
      solution: item.solution,
      timestamp: Timestamp.fromMillis(item.timestamp),
      userId: userId,
    };

    // 只包含已定義的欄位
    if (item.problemImageUri !== undefined) dataToSave.problemImageUri = item.problemImageUri; else dataToSave.problemImageUri = null;
    if (item.problemStatement !== undefined) dataToSave.problemStatement = item.problemStatement; else dataToSave.problemStatement = null;
    if (item.knowledgePoints !== undefined) dataToSave.knowledgePoints = item.knowledgePoints; else dataToSave.knowledgePoints = null;
    if (item.userAttempt !== undefined) dataToSave.userAttempt = item.userAttempt; else dataToSave.userAttempt = null;
    if (item.isIncorrectAttempt !== undefined) dataToSave.isIncorrectAttempt = item.isIncorrectAttempt; else dataToSave.isIncorrectAttempt = false;
    
    console.log(`[Firestore] 準備儲存解題歷史到 users/${userId}/problemHistory:`, dataToSave);
    const docRef = await addDoc(historyCollectionRef, dataToSave as FirestoreProblemHistoryItem);
    console.log("[Firestore] 解題歷史已儲存，文件 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] 儲存解題歷史至 Firestore 時發生錯誤:", error);
    return null;
  }
}

/**
 * 從 Firestore 載入特定使用者的所有解題記錄。
 * @param userId 使用者 ID
 * @returns ProblemHistoryItem 陣列
 */
export async function loadProblemHistory(userId: string): Promise<ProblemHistoryItem[]> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (loadProblemHistory) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return [];
  }
  if (!userId) {
    console.error("載入解題歷史錯誤：未提供使用者 ID");
    return [];
  }
  try {
    console.log(`[Firestore] 準備從 users/${userId}/problemHistory 載入解題歷史...`);
    const historyCollectionRef = collection(db, 'users', userId, 'problemHistory');
    const q = query(historyCollectionRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const historyItems: ProblemHistoryItem[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestoreProblemHistoryItem;
      return {
        id: docSnap.id,
        solution: data.solution,
        timestamp: (data.timestamp as Timestamp).toMillis(),
        userId: data.userId,
        problemImageUri: data.problemImageUri === null ? undefined : data.problemImageUri,
        problemStatement: data.problemStatement === null ? undefined : data.problemStatement,
        knowledgePoints: data.knowledgePoints === null ? undefined : data.knowledgePoints,
        userAttempt: data.userAttempt === null ? undefined : data.userAttempt,
        isIncorrectAttempt: data.isIncorrectAttempt === null ? undefined : data.isIncorrectAttempt,
      } as ProblemHistoryItem;
    });
    console.log(`[Firestore] 已從 Firestore 載入 ${historyItems.length} 筆解題歷史`);
    return historyItems;
  } catch (error) {
    console.error("[Firestore] 從 Firestore 載入解題歷史時發生錯誤:", error);
    return [];
  }
}

/**
 * 從 Firestore 刪除特定使用者的單筆解題記錄。
 * @param userId 使用者 ID
 * @param itemId 要刪除的記錄的 Firestore 文件 ID
 */
export async function deleteProblemHistoryItem(userId: string, itemId: string): Promise<boolean> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (deleteProblemHistoryItem) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return false;
  }
  if (!userId || !itemId) {
    console.error("刪除解題歷史錯誤：未提供使用者 ID 或項目 ID");
    return false;
  }
  try {
    const itemDocRef = doc(db, 'users', userId, 'problemHistory', itemId);
    console.log(`[Firestore] 準備從 users/${userId}/problemHistory 刪除項目 ID: ${itemId}`);
    await deleteDoc(itemDocRef);
    console.log(`[Firestore] 已從 Firestore 刪除解題歷史項目，ID: ${itemId}`);
    return true;
  } catch (error) {
    console.error("[Firestore] 從 Firestore 刪除解題歷史項目時發生錯誤:", error);
    return false;
  }
}

// --- Knowledge Nook History Firestore Service Functions ---

/**
 * 將單筆知識點記錄儲存到使用者的 Firestore knowledgeNookHistory 子集合中。
 * @param userId 使用者 ID
 * @param item 要儲存的知識點記錄
 */
export async function saveKnowledgeNookHistoryItem(userId: string, item: KnowledgeNookHistoryItem): Promise<string | null> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (saveKnowledgeNookHistoryItem) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return null;
  }
  if (!userId) {
    console.error("儲存知識點歷史錯誤：未提供使用者 ID");
    return null;
  }
  try {
    const historyCollectionRef = collection(db, 'users', userId, 'knowledgeNookHistory');
    
    const dataToSave: FirestoreKnowledgeNookHistoryItem = {
      knowledgePoints: item.knowledgePoints,
      timestamp: Timestamp.fromMillis(item.timestamp),
      userId: userId,
    };
    
    console.log(`[Firestore] 準備儲存知識點歷史到 users/${userId}/knowledgeNookHistory:`, dataToSave);
    const docRef = await addDoc(historyCollectionRef, dataToSave);
    console.log("[Firestore] 知識點歷史已儲存至 Firestore，文件 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] 儲存知識點歷史至 Firestore 時發生錯誤:", error);
    return null;
  }
}

/**
 * 從 Firestore 載入特定使用者的所有知識點記錄。
 * @param userId 使用者 ID
 * @returns KnowledgeNookHistoryItem 陣列
 */
export async function loadKnowledgeNookHistory(userId: string): Promise<KnowledgeNookHistoryItem[]> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (loadKnowledgeNookHistory) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return [];
  }
  if (!userId) {
    console.error("載入知識點歷史錯誤：未提供使用者 ID");
    return [];
  }
  try {
    console.log(`[Firestore] 準備從 users/${userId}/knowledgeNookHistory 載入知識點歷史...`);
    const historyCollectionRef = collection(db, 'users', userId, 'knowledgeNookHistory');
    const q = query(historyCollectionRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const historyItems: KnowledgeNookHistoryItem[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestoreKnowledgeNookHistoryItem;
      return {
        id: docSnap.id,
        knowledgePoints: data.knowledgePoints,
        timestamp: (data.timestamp as Timestamp).toMillis(),
        userId: data.userId, // Added userId to the returned object
      } as KnowledgeNookHistoryItem;
    });
    console.log(`[Firestore] 已從 Firestore 載入 ${historyItems.length} 筆知識點歷史`);
    return historyItems;
  } catch (error) {
    console.error("[Firestore] 從 Firestore 載入知識點歷史時發生錯誤:", error);
    return [];
  }
}

/**
 * 從 Firestore 刪除特定使用者的單筆知識點記錄。
 * @param userId 使用者 ID
 * @param itemId 要刪除的記錄的 Firestore 文件 ID
 */
export async function deleteKnowledgeNookHistoryItem(userId: string, itemId: string): Promise<boolean> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (deleteKnowledgeNookHistoryItem) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return false;
  }
  if (!userId || !itemId) {
    console.error("刪除知識點歷史錯誤：未提供使用者 ID 或項目 ID");
    return false;
  }
  try {
    const itemDocRef = doc(db, 'users', userId, 'knowledgeNookHistory', itemId);
    console.log(`[Firestore] 準備從 users/${userId}/knowledgeNookHistory 刪除項目 ID: ${itemId}`);
    await deleteDoc(itemDocRef);
    console.log(`[Firestore] 已從 Firestore 刪除知識點歷史項目，ID: ${itemId}`);
    return true;
  } catch (error) {
    console.error("[Firestore] 從 Firestore 刪除知識點歷史項目時發生錯誤:", error);
    return false;
  }
}


// --- Leaderboard Firestore Service Functions ---

/**
 * 將分數記錄新增到 Firestore 的 leaderboard 集合中。
 * @param entry 要新增的排行榜記錄
 */
export async function addScoreToLeaderboard(entry: LeaderboardEntry): Promise<string | null> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (addScoreToLeaderboard) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return null;
  }
  try {
    const leaderboardCollectionRef = collection(db, 'leaderboard');
    const dataToSave: FirestoreLeaderboardEntry = {
      displayName: entry.displayName,
      score: entry.score,
      timestamp: Timestamp.fromMillis(entry.timestamp),
      userId: entry.userId || null, 
    };
    console.log(`[Firestore] 準備儲存分數到 leaderboard:`, dataToSave);
    const docRef = await addDoc(leaderboardCollectionRef, dataToSave);
    console.log("[Firestore] 分數已儲存至排行榜，文件 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] 儲存分數至排行榜時發生錯誤:", error);
    return null;
  }
}

/**
 * 從 Firestore 載入排行榜分數。
 * @param count 要載入的分數數量，預設為 10
 * @returns LeaderboardEntry 陣列
 */
export async function getLeaderboardScores(count: number = 10): Promise<LeaderboardEntry[]> {
  if (!firebaseInitialized || !db) {
    console.error("Firestore 服務 (getLeaderboardScores) 錯誤：Firebase 未初始化或 db 物件不存在。");
    return [];
  }
  try {
    console.log(`[Firestore] 準備從 leaderboard 載入排行榜分數...`);
    const leaderboardCollectionRef = collection(db, 'leaderboard');
    const q = query(leaderboardCollectionRef, orderBy('score', 'desc'), orderBy('timestamp', 'asc'), firestoreLimit(count));
    const querySnapshot = await getDocs(q);

    const leaderboardEntries: LeaderboardEntry[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestoreLeaderboardEntry;
      return {
        id: docSnap.id,
        displayName: data.displayName,
        score: data.score,
        timestamp: (data.timestamp as Timestamp).toMillis(),
        userId: data.userId,
      } as LeaderboardEntry;
    });
    console.log(`[Firestore] 已從 Firestore 載入 ${leaderboardEntries.length} 筆排行榜記錄`);
    return leaderboardEntries;
  } catch (error) {
    console.error("[Firestore] 從 Firestore 載入排行榜時發生錯誤:", error);
    return [];
  }
}
