import { useState, useEffect } from 'react';
import catalogFallback from '../data/catalogFallback.json';

// In-memory cache across hook instances (fast 0ms re-renders)
let cachedProducts = catalogFallback || [];

/**
 * Robust CSV Line Parser that handles escaped quotes and commas inside cells
 */
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

/**
 * Parse full CSV text into standard catalog product objects
 */
const parseCSV = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const nameIdx = headers.findIndex(h => h === 'name' || h === 'nombre');
  const photoIdx = headers.findIndex(h => h === 'photo' || h === 'foto' || h === 'image' || h === 'imagen');
  const catIdx = headers.findIndex(h => h === 'category' || h === 'categoria' || h === 'categoría');
  const priceIdx = headers.findIndex(h => h === 'price' || h === 'precio');
  const descIdx = headers.findIndex(h => h === 'descripción' || h === 'descripcion' || h === 'description');
  const qtyIdx = headers.findIndex(h => h === 'quantity' || h === 'cantidad');

  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const name = cols[nameIdx];
    if (!name) continue;
    const rawPrice = parseFloat((cols[priceIdx] || '0').replace(/[^0-9.]/g, '')) || 0;
    const rawQty = cols[qtyIdx] !== undefined && cols[qtyIdx] !== '' ? parseInt(cols[qtyIdx], 10) : 1;

    items.push({
      id: `prod_${i}`,
      name: name,
      price: `$${rawPrice.toFixed(2)}`,
      rawPrice: rawPrice,
      quantity: isNaN(rawQty) ? 1 : rawQty,
      availability: 1,
      category: cols[catIdx] || 'Otros',
      image: cols[photoIdx] || '',
      description: cols[descIdx] || '',
      color: "#2563EB"
    });
  }
  return items;
};

/**
 * Fast, resilient catalog hook decoupled from Firestore.
 * Always renders products instantly with zero latency, zero permissions issues,
 * and dynamically updates from the public CSV file.
 */
export const useGallery = () => {
  const [products, setProducts] = useState(cachedProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCSV = async () => {
      try {
        const res = await fetch('/plantilla_productos_muestra.csv');
        if (!res.ok) return;
        const text = await res.text();
        const parsed = parseCSV(text);

        if (parsed.length > 0) {
          cachedProducts = parsed;
          if (isMounted) {
            setProducts(parsed);
          }
        }
      } catch (err) {
        console.warn('Notice loading live CSV, fallback catalog active:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCSV();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading };
};
