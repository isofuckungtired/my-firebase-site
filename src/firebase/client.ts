
// src/firebase/client.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Console logs to check if environment variables are read (for debugging)
// console.log('Attempting Firebase Init. Using NEXT_PUBLIC_FIREBASE_API_KEY:', apiKey ? 'Exists' : 'MISSING or EMPTY');
// console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomain ? 'Exists' : 'MISSING or EMPTY');
// console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId ? 'Exists' : 'MISSING or EMPTY');

if (!apiKey) {
  console.warn(
    "Firebase API 金鑰 (NEXT_PUBLIC_FIREBASE_API_KEY) 遺失或為空字串。 " +
    "請確保它已在您的 .env 檔案中正確設定，並且值是有效的，且開發伺服器已重新啟動。"
  );
}
if (!authDomain) {
  console.warn(
    "Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) 遺失。 " +
    "請確保它已在您的 .env 檔案中設定，並且開發伺服器已重新啟動。"
  );
}
if (!projectId) {
  console.warn(
    "Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) 遺失。 " +
    "請確保它已在您的 .env 檔案中設定，並且開發伺服器已重新啟動。"
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let firebaseInitialized = false;

if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    firebaseInitialized = true;
    console.log("Firebase 已成功初始化。");
  } catch (error: any) {
    console.error("Firebase 初始化過程中發生錯誤:", error.message || error);
    // Log more details about the config, redacting API key for safety in logs
    const configToLog = { ...firebaseConfig };
    if (configToLog.apiKey) configToLog.apiKey = "REDACTED_FOR_LOG";
    console.error("使用的 Firebase 設定 (API 金鑰已隱藏):", JSON.stringify(configToLog));
    console.error("請再次檢查您的 Firebase 專案設定 (API 金鑰、Auth Domain、Project ID) 是否正確無誤，並且已在 .env 檔案中正確設定，然後重新啟動開發伺服器。");
  }
} else {
  console.error(
    "Firebase 初始化失敗：由於缺少必要的設定（API 金鑰、Auth Domain 或 Project ID），無法繼續。" +
    "請檢查您的 .env 檔案以及其中的 NEXT_PUBLIC_FIREBASE_... 變數是否已正確填寫，並且開發伺服器已重新啟動。" +
    "偵測到的 apiKey 值為: " + (firebaseConfig.apiKey ? "存在 (但可能仍有其他設定缺失)" : "遺失")
  );
}

export { app, authInstance as auth, dbInstance as db, firebaseInitialized };
