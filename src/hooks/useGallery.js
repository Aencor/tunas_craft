import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export const useGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Sin nombre',
            price: data.price ? `$${parseFloat(data.price).toFixed(2)}` : '$0.00',
            quantity: 1, // Defaulting to available
            category: data.category || 'Otros',
            image: data.photo || '',
            color: "#2563EB" // Default color theme inherited from previous implementation
          };
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};
