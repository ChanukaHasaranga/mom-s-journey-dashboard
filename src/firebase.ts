import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";


export const firebaseConfig = {
  apiKey: "AIzaSyB5fhYC6qoMEPVa-Q-jdtd-fIVbrX4vXaU",
  authDomain: "mansa-e1f7e.firebaseapp.com",
  databaseURL: "https://mansa-e1f7e-default-rtdb.firebaseio.com",
  projectId: "mansa-e1f7e",
  storageBucket: "mansa-e1f7e.firebasestorage.app",
  messagingSenderId: "238627897949",
  appId: "1:238627897949:web:91d3fb323f475701ca83b4",
  measurementId: "G-L46ZWYW0FC"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let secondaryApp;
try {
   secondaryApp = initializeApp(firebaseConfig, "Secondary");
} catch (e) {
   secondaryApp = getApp("Secondary");
}
export const secondaryAuth = getAuth(secondaryApp);