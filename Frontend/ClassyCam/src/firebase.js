// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv5HB3NIdybfSK2IpREy5YEHq1JVJs94s",
  authDomain: "classycam-534e7.firebaseapp.com",
  projectId: "classycam-534e7",
  storageBucket: "classycam-534e7.firebasestorage.app",
  messagingSenderId: "41344100111",
  appId: "1:41344100111:web:e109fd292cef732bde807a",
  measurementId: "G-MYLHSDLFY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth };