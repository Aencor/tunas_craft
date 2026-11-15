import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// Helper to load sample products CSV as a resilient fallback if Firestore is unreachable
const loadFallbackCSV = async () => {
  try {
    const res = await fetch('/plantilla_productos_muestra.csv');
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length <= 1) return [];

    const parseCSVLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'nombre');
    const photoIdx = headers.findIndex(h => h === 'photo' || h === 'foto' || h === 'image' || h === 'imagen');
    const catIdx = headers.findIndex(h => h === 'category' || h === 'categoria' || h === 'categoría');
    const priceIdx = headers.findIndex(h => h === 'price' || h === 'precio');
    const descIdx = headers.findIndex(h => h === 'descripción' || h === 'descripcion' || h === 'description');
    const qtyIdx = headers.findIndex(h => h === 'quantity' || h === 'cantidad');

    const fallbackItems = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (!cols[nameIdx]) continue;
      const rawPrice = parseFloat((cols[priceIdx] || '0').replace(/[^0-9.]/g, '')) || 0;
      fallbackItems.push({
        id: `local_${i}`,
        name: cols[nameIdx],
        price: `$${rawPrice.toFixed(2)}`,
        rawPrice,
        quantity: qtyIdx !== -1 ? Number(cols[qtyIdx]) || 1 : 1,
        availability: 1,
        category: cols[catIdx] || 'Otros',
        image: cols[photoIdx] || '',
        description: cols[descIdx] || '',
        color: "#2563EB"
      });
    }
    return fallbackItems;
  } catch (e) {
    console.warn("Could not load fallback CSV:", e);
    return [];
  }
};

export const useGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        // Ensure anonymous auth is active so Firestore security rules (request.auth != null) are satisfied
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr) {
            console.warn("Anonymous auth in useGallery notice:", authErr);
          }
        }

        // Query Firestore products
        let querySnapshot = null;
        try {
          const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
          querySnapshot = await getDocs(q);
        } catch (orderErr) {
          console.warn("Retrying Firestore query without orderBy:", orderErr);
          querySnapshot = await getDocs(collection(db, 'products'));
        }

        if (querySnapshot && !querySnapshot.empty) {
          const fetchedProducts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const numericPrice = parseFloat(data.price) || 0;
            return {
              id: doc.id,
              name: data.name || 'Sin nombre',
              price: typeof data.price === 'string' && data.price.startsWith('$') ? data.price : `$${numericPrice.toFixed(2)}`,
              rawPrice: numericPrice,
              quantity: data.quantity !== undefined ? Number(data.quantity) : 1,
              availability: data.availability !== undefined ? Number(data.availability) : 1,
              category: data.category || 'Otros',
              image: data.photo || data.image || '',
              description: data.description || data.descripción || '',
              color: "#2563EB"
            };
          });

          if (isMounted) setProducts(fetchedProducts);
        } else {
          // If Firestore is empty, load fallback CSV
          const fallback = await loadFallbackCSV();
          if (isMounted && fallback.length > 0) setProducts(fallback);
        }
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
        // Fallback to sample CSV so catalog is never empty
        const fallback = await loadFallbackCSV();
        if (isMounted && fallback.length > 0) setProducts(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading };
};
