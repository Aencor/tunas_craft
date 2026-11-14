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
          const numericPrice = parseFloat(data.price) || 0;
          return {
            id: doc.id,
            name: data.name || 'Sin nombre',
            price: `$${numericPrice.toFixed(2)}`,
            rawPrice: numericPrice,
            quantity: data.quantity !== undefined ? Number(data.quantity) : 1,
            availability: data.availability !== undefined ? Number(data.availability) : 1,
            category: data.category || 'Otros',
            image: data.photo || data.image || '',
            description: data.description || data.descripción || '',
            color: "#2563EB"
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
