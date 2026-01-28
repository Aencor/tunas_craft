import { useState, useEffect } from 'react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZQKUeUWpxU8XNWtif8j4aEKN0InJpbxQFpK4Q4Ci5zVI1ZIlUlKTU42AomgXFPfa73Rb0w1CT1mU-/pub?output=csv';

export const useGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGoogleDriveImage = (url) => {
    if (!url) return '';
    const driveRegex = /(?:\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    return url;
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      if (currentLine.length < headers.length) continue;

      const product = {};
      headers.forEach((header, index) => {
        let value = currentLine[index] ? currentLine[index].trim() : '';
        product[header] = value;
      });

      if (product.name) {
        result.push({
          name: product.name,
          price: product.price || '$0',
          quantity: parseInt(product.quantity || product.availability || 0),
          category: product.category || 'Otros',
          image: getGoogleDriveImage(product.photo || product.image),
          color: "#2563EB" // Default color
        });
      }
    }
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const fetchedProducts = parseCSV(text);
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { products, loading };
};
