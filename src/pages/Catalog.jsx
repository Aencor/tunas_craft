import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, X, ShoppingCart, Plus, Minus, Search, 
    FileDown, Eye, Check, MessageCircle, SlidersHorizontal, 
    Sparkles, PackageCheck, AlertCircle, RotateCcw
} from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { useCart } from '../context/CartContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Catalog = () => {
    const { products, loading } = useGallery();
    const { addToCart, totalItems } = useCart();

    // Filters and Search State
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'name-asc'
    const [onlyInStock, setOnlyInStock] = useState(false);

    // Modals
    const [selectedProduct, setSelectedProduct] = useState(null); // Quick view modal
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Trigger toast notification
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Google Drive URL parser for thumbnails
    const getGoogleDriveImage = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return '/logo.png';
        const driveRegex = /(?:\/d\/|id=)([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
        return url;
    };

    // Extract unique categories with counts
    const categoriesWithCount = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            const cat = p.category || 'Otros';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [products]);

    const categories = useMemo(() => {
        return ['Todos', ...Object.keys(categoriesWithCount).sort()];
    }, [categoriesWithCount]);

    // Filter and Sort Products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filter by category
        if (activeCategory !== 'Todos' && activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        // Filter by search query (name, category, description)
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p => {
                const name = (p.name || '').toLowerCase();
                const cat = (p.category || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                return name.includes(q) || cat.includes(q) || desc.includes(q);
            });
        }

        // Filter by stock
        if (onlyInStock) {
            result = result.filter(p => p.quantity > 0);
        }

        // Sorting
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => (a.rawPrice || 0) - (b.rawPrice || 0));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.rawPrice || 0) - (a.rawPrice || 0));
                break;
            case 'name-asc':
                result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'featured':
            default:
                // Keep original order
                break;
        }

        return result;
    }, [products, activeCategory, searchQuery, onlyInStock, sortBy]);

    // Handle add to cart with feedback animation
    const handleAddToCart = (product, qty = 1) => {
        for (let i = 0; i < qty; i++) {
            addToCart(product);
        }
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        showToast(`Agregado al carrito: ${product.name}`);
    };

    // Open product quick view modal
    const openQuickView = (product) => {
        setSelectedProduct(product);
        setModalQuantity(1);
    };

    // Helper to format/optimize image URLs for direct fetching
    const getOptimalImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return null;
        const driveMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
        if (driveMatch && driveMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w300`;
        }
        return url;
    };

    // Load an image and convert it to a base64 Data URL via canvas
    const loadImageAsDataUrl = (rawUrl) => {
        return new Promise((resolve) => {
            const url = getOptimalImageUrl(rawUrl);
            if (!url) return resolve(null);

            const img = new Image();
            img.crossOrigin = 'anonymous';

            let timer = setTimeout(() => {
                resolve(null);
            }, 4500);

            img.onload = () => {
                clearTimeout(timer);
                try {
                    const canvas = document.createElement('canvas');
                    const maxDim = 240;
                    let width = img.naturalWidth || img.width || 100;
                    let height = img.naturalHeight || img.height || 100;

                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = Math.max(width, 1);
                    canvas.height = Math.max(height, 1);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    resolve({ dataUrl, width, height });
                } catch (err) {
                    console.warn('Canvas export failed for:', url, err);
                    resolve(null);
                }
            };

            img.onerror = () => {
                clearTimeout(timer);
                resolve(null);
            };

            img.src = url;
        });
    };

    // Export Catalog to PDF with product photos
    const handleExportPDF = async () => {
        if (filteredProducts.length === 0) {
            alert('No hay productos que coincidan con los filtros actuales para exportar.');
            return;
        }

        setIsGeneratingPDF(true);
        showToast('Preparando fotos y generando PDF...');

        try {
            // Load logo and product images in parallel (in chunks to prevent browser congestion)
            const [logoData, loadedImages] = await Promise.all([
                loadImageAsDataUrl('/logo.png'),
                (async () => {
                    const results = new Array(filteredProducts.length).fill(null);
                    const CHUNK_SIZE = 6;
                    for (let i = 0; i < filteredProducts.length; i += CHUNK_SIZE) {
                        const chunk = filteredProducts.slice(i, i + CHUNK_SIZE);
                        const chunkPromises = chunk.map(async (p, idx) => {
                            const res = await loadImageAsDataUrl(p.image);
                            results[i + idx] = res;
                        });
                        await Promise.all(chunkPromises);
                    }
                    return results;
                })()
            ]);

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const primaryColor = [15, 23, 42]; // #0F172A (Slate 900)
            const accentColor = [245, 158, 11]; // #F59E0B (Amber 500)
            const lightSlate = [248, 250, 252]; // #F8FAFC
            const darkText = [30, 41, 59]; // #1E293B

            // Header Banner (Solid primary color, no gradient)
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(0, 0, 210, 32, 'F');

            // Draw Logo in Header if available
            let titleStartX = 14;
            if (logoData && logoData.dataUrl) {
                try {
                    doc.addImage(logoData.dataUrl, 'JPEG', 14, 5, 22, 22, undefined, 'FAST');
                    titleStartX = 40;
                } catch (e) {
                    titleStartX = 14;
                }
            }

            // Header Title
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text("TUNA'S CRAFT", titleStartX, 13);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(203, 213, 225);
            doc.text("ESTUDIO DE IMPRESIÓN 3D & MODELADO DIGITAL", titleStartX, 19);
            doc.text("Sitio web: tunascraft.com · CDMX, México · WhatsApp: +52 55 4474 4531", titleStartX, 24);

            // Right Info
            doc.setFontSize(8);
            const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
            doc.text(`Fecha: ${dateStr}`, 196, 13, { align: 'right' });
            const catLabel = activeCategory === 'all' || activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory;
            doc.text(`Filtro: ${catLabel}`, 196, 19, { align: 'right' });
            doc.text(`Total: ${filteredProducts.length} productos`, 196, 24, { align: 'right' });

            // Accent divider bar (Solid amber)
            doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.rect(0, 32, 210, 2, 'F');

            // Build Table Data
            const tableData = filteredProducts.map((p, idx) => {
                const desc = p.description || p.descripción || 'Pieza impresa en 3D con acabados de alta precisión.';
                const isAvail = p.quantity > 0;
                return [
                    idx + 1,
                    { content: '', styles: { minCellHeight: 20 } },
                    p.name || 'Sin nombre',
                    p.category || 'Otros',
                    p.price || `$${(p.rawPrice || 0).toFixed(2)}`,
                    isAvail ? 'Disponible' : 'Bajo pedido',
                    desc
                ];
            });

            autoTable(doc, {
                startY: 38,
                head: [['#', 'Foto', 'Producto', 'Categoría', 'Precio', 'Disponibilidad', 'Descripción']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'left',
                    cellPadding: 2.5
                },
                bodyStyles: {
                    textColor: darkText,
                    fontSize: 7.5,
                    cellPadding: 2,
                    valign: 'middle'
                },
                alternateRowStyles: {
                    fillColor: lightSlate
                },
                columnStyles: {
                    0: { cellWidth: 7, halign: 'center' },
                    1: { cellWidth: 22, halign: 'center' },
                    2: { cellWidth: 36, fontStyle: 'bold' },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 18, fontStyle: 'bold', textColor: [180, 83, 9] },
                    5: { cellWidth: 22, halign: 'center' },
                    6: { cellWidth: 'auto' }
                },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        const cell = data.cell;
                        const rowIndex = (Array.isArray(data.row.raw) && typeof data.row.raw[0] === 'number')
                            ? data.row.raw[0] - 1
                            : data.row.index;
                        const imgObj = loadedImages[rowIndex];

                        if (imgObj && imgObj.dataUrl) {
                            const maxW = cell.width - 2.5;
                            const maxH = cell.height - 2.5;
                            const aspect = (imgObj.width || 1) / (imgObj.height || 1);
                            let imgW = maxW;
                            let imgH = imgW / aspect;
                            if (imgH > maxH) {
                                imgH = maxH;
                                imgW = imgH * aspect;
                            }
                            const imgX = cell.x + (cell.width - imgW) / 2;
                            const imgY = cell.y + (cell.height - imgH) / 2;

                            try {
                                doc.addImage(imgObj.dataUrl, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');
                            } catch (err) {
                                console.warn('Error dibujando imagen en celda:', err);
                            }
                        } else {
                            doc.setFontSize(6);
                            doc.setTextColor(148, 163, 184);
                            doc.text('Sin foto', cell.x + cell.width / 2, cell.y + cell.height / 2, {
                                align: 'center',
                                baseline: 'middle'
                            });
                        }
                    }
                },
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(7.5);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Página ${data.pageNumber} de ${pageCount} · Catálogo Oficial Tuna's Craft · tunascraft.com`,
                        105,
                        290,
                        { align: 'center' }
                    );
                },
                margin: { top: 38, bottom: 14, left: 14, right: 14 }
            });

            const categorySlug = activeCategory.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const fileName = `catalogo_tunas_craft_${categorySlug}_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);
            showToast('Catálogo PDF con fotos descargado con éxito');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Hubo un error al generar el PDF.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans pb-24">
            
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/" 
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 flex items-center gap-2 text-sm font-semibold"
                            title="Volver a Inicio"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Inicio</span>
                        </Link>
                        <div>
                            <h1 className="font-display text-2xl font-bold text-white tracking-tight leading-none">
                                Catálogo de Productos
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">
                                {products.length} productos en catálogo · Impresión 3D
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* PDF Export Button */}
                        <button 
                            onClick={handleExportPDF}
                            disabled={isGeneratingPDF || loading}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                            title="Exportar productos actuales como documento PDF"
                        >
                            {isGeneratingPDF ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent" />
                            ) : (
                                <FileDown size={18} className="text-amber-400" />
                            )}
                            <span className="hidden sm:inline">
                                {isGeneratingPDF ? 'Generando PDF con fotos...' : 'Exportar como PDF'}
                            </span>
                            <span className="sm:hidden">
                                {isGeneratingPDF ? 'Generando...' : 'PDF'}
                            </span>
                        </button>

                        {/* Cart Link */}
                        <Link 
                            to="/checkout" 
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 relative shadow-md shadow-amber-500/20"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">Carrito</span>
                            {totalItems > 0 && (
                                <span className="bg-slate-950 text-amber-400 font-extrabold w-5 h-5 rounded-full text-xs flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                
                {/* Search & Filter Controls Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 space-y-4">
                    
                    {/* Top Row: Search and Sort */}
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nombre, categoría o descripción..." 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Sort & Availability Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                                <label className="text-slate-400 font-medium">Ordenar:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                                >
                                    <option value="featured" className="bg-slate-900">Destacados</option>
                                    <option value="price-asc" className="bg-slate-900">Precio: Menor a Mayor</option>
                                    <option value="price-desc" className="bg-slate-900">Precio: Mayor a Menor</option>
                                    <option value="name-asc" className="bg-slate-900">Nombre (A - Z)</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 cursor-pointer hover:border-slate-600 transition-colors select-none">
                                <input 
                                    type="checkbox" 
                                    checked={onlyInStock} 
                                    onChange={(e) => setOnlyInStock(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-800 border-slate-700 cursor-pointer"
                                />
                                <span className="font-medium">Solo disponibles</span>
                            </label>

                            {(searchQuery || activeCategory !== 'all' || onlyInStock || sortBy !== 'featured') && (
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('all');
                                        setOnlyInStock(false);
                                        setSortBy('featured');
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors px-2 py-2"
                                    title="Restablecer filtros"
                                >
                                    <RotateCcw size={14} />
                                    <span>Limpiar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-800 scrollbar-none">
                        {categories.map(cat => {
                            const isSelected = activeCategory === cat || (cat === 'Todos' && activeCategory === 'all');
                            const count = cat === 'Todos' ? products.length : (categoriesWithCount[cat] || 0);

                            return (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveCategory(cat === 'Todos' ? 'all' : cat)}
                                    className={`px-3.5 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                                        isSelected 
                                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                        isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Results Status */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
                    <div>
                        Mostrando <strong className="text-white">{filteredProducts.length}</strong> productos
                        {activeCategory !== 'all' && activeCategory !== 'Todos' && (
                            <span> en categoría <strong className="text-amber-400">{activeCategory}</strong></span>
                        )}
                        {searchQuery && (
                            <span> con búsqueda "<strong className="text-amber-400">{searchQuery}</strong>"</span>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent" />
                        <p className="text-sm font-medium">Cargando catálogo oficial...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
                        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No se encontraron productos</h3>
                        <p className="text-slate-400 text-xs mb-6">
                            No hay productos que coincidan con tus criterios de búsqueda o filtro actual.
                        </p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                                setOnlyInStock(false);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
                        >
                            <RotateCcw size={14} /> Ver catálogo completo
                        </button>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const isInStock = product.quantity > 0;
                            const imageSrc = getGoogleDriveImage(product.image);

                            return (
                                <div 
                                    key={product.id}
                                    onClick={() => openQuickView(product)}
                                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col cursor-pointer"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                                        <img 
                                            src={imageSrc} 
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />

                                        {/* Category Badge on top-left */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="bg-slate-900/90 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-700 tracking-wide uppercase">
                                                {product.category || 'Otros'}
                                            </span>
                                        </div>

                                        {/* Availability Badge on top-right */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase border ${
                                                isInStock 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                    : 'bg-slate-800/90 text-slate-400 border-slate-700'
                                            }`}>
                                                {isInStock ? 'Disponible' : 'Bajo pedido'}
                                            </span>
                                        </div>

                                        {/* Quick View Hover Button */}
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                            <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-lg">
                                                <Eye size={14} className="text-amber-400" />
                                                <span>Ver Detalles</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                                                {product.name}
                                            </h3>

                                            {/* Description preview */}
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2rem]">
                                                {product.description || product.descripción || 'Pieza impresa en 3D de alta precisión y calidad garantizada.'}
                                            </p>
                                        </div>

                                        {/* Price and Action Bar */}
                                        <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Precio</span>
                                                <span className="text-lg font-bold text-amber-400">
                                                    {product.price}
                                                </span>
                                            </div>

                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-sm hover:shadow-amber-500/20"
                                                title="Añadir al carrito"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Quick View / Detail Modal */}
            {selectedProduct && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div 
                        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full border border-slate-700 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Product Photo */}
                            <div 
                                className="bg-slate-950 aspect-square md:aspect-auto h-full flex items-center justify-center p-4 relative group cursor-pointer"
                                onClick={() => setLightboxSrc(getGoogleDriveImage(selectedProduct.image))}
                                title="Click para ver imagen completa"
                            >
                                <img 
                                    src={getGoogleDriveImage(selectedProduct.image)} 
                                    alt={selectedProduct.name}
                                    className="max-h-[380px] w-full object-contain rounded-xl"
                                />
                                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-[10px] text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                                    <Eye size={12} /> Click para zoom
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700 uppercase tracking-wide">
                                            {selectedProduct.category || 'Otros'}
                                        </span>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wide ${
                                            selectedProduct.quantity > 0 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            {selectedProduct.quantity > 0 ? 'Disponible' : 'Bajo pedido'}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                        {selectedProduct.name}
                                    </h2>

                                    <div className="text-2xl font-bold text-amber-400 mb-4">
                                        {selectedProduct.price}
                                    </div>

                                    <div className="border-t border-slate-800 pt-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Descripción del producto
                                        </h4>
                                        <p className="text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2">
                                            {selectedProduct.description || selectedProduct.descripción || 'Pieza original impresa en 3D con materiales de alta calidad y precisión milimétrica.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2 py-1">
                                            <button 
                                                onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                                className="p-1.5 text-slate-400 hover:text-white"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-3 text-sm font-bold text-white">{modalQuantity}</span>
                                            <button 
                                                onClick={() => setModalQuantity(modalQuantity + 1)}
                                                className="p-1.5 text-slate-400 hover:text-white"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button 
                                            onClick={() => {
                                                handleAddToCart(selectedProduct, modalQuantity);
                                                setSelectedProduct(null);
                                            }}
                                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-amber-500/20"
                                        >
                                            <ShoppingCart size={16} />
                                            <span>Agregar al carrito ({modalQuantity})</span>
                                        </button>
                                    </div>

                                    {/* WhatsApp Direct Inquire */}
                                    <a 
                                        href={`https://wa.me/525544744531?text=${encodeURIComponent(`Hola Tuna's Craft, me interesa este producto de su catálogo: ${selectedProduct.name} (${selectedProduct.price})`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={15} className="text-emerald-400" />
                                        <span>Consultar detalles por WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxSrc && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setLightboxSrc(null)}
                >
                    <button 
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-4 right-4 text-white hover:text-amber-400 p-2 bg-slate-800/80 rounded-full border border-slate-700"
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={lightboxSrc} 
                        alt="Vista completa" 
                        className="max-h-[85vh] max-w-[95vw] rounded-xl shadow-2xl border border-slate-800" 
                        onClick={e => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* Floating Cart Button (when items in cart) */}
            {totalItems > 0 && (
                <Link 
                    to="/checkout" 
                    className={`fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 rounded-full shadow-2xl shadow-amber-500/40 transition-all flex items-center justify-center group ${
                        isAnimating ? 'scale-125 ring-4 ring-amber-300 duration-100' : 'hover:scale-105 duration-300'
                    }`}
                    title="Ir a finalizar pedido"
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2.5 -right-2.5 bg-slate-950 text-amber-400 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-xs border border-amber-400">
                            {totalItems}
                        </span>
                    </div>
                </Link>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 left-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in-up">
                    <Check size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default Catalog;
