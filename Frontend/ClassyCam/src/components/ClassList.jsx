// Example: src/components/ClassList.jsx
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchClasses } from "../services/classService";

function ClassList() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Ensure user is logged in before fetching
    auth.onAuthStateChanged((user) => {
      if (user) {
        fetchClasses().then(setClasses);
      }
    });
  }, []);

  return <div>{/* Render classes */}</div>;
}