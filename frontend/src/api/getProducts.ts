import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getProducts = async () => {
  const colRef = collection(db, "competitors");
  const snapshot = await getDocs(colRef);

  const data: string[] = [];
  snapshot.forEach((doc) => data.push(doc.id));

  return data.sort();
};
