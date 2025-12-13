import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { db } from './firebase'; 
console.log("Firebase Connection Check:", db);

createRoot(document.getElementById("root")!).render(<App />);
