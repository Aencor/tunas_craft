import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';

const Catalog = () => {
    const { products, loading } = useGallery();
    const [activeCategory, setActiveCategory] = useState('all');
    const [lightboxSrc, setLightboxSrc] = useState(null);

    const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
    
    const filteredProducts = activeCategory === 'Todos' || activeCategory === 'all' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    // Google Drive URL parser for thumbnails
    const getGoogleDriveImage = (url) => {
        if (!url) return '';
        const driveRegex = /(?:\/d\/|id=)([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
        return url;
    };

    return (
        <div className="bg-brand-dark min-h-screen text-slate-100 font-sans pb-16">
            
            {/* Header */}
            <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Catálogo Completo
                    </h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8 sticky top-4 z-40 py-4 bg-brand-dark/95 backdrop-blur rounded-2xl px-4 border border-white/5">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full font-bold text-sm transition-all border 
                                ${(activeCategory === cat || (cat === 'Todos' && activeCategory === 'all'))
                                    ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-orange-500/30' 
                                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-slate-500">Cargando productos...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setLightboxSrc(getGoogleDriveImage(product.image))}
                                className="group relative overflow-hidden rounded-2xl shadow-xl aspect-square bg-gray-900 cursor-pointer hover:shadow-2xl hover:shadow-brand-blue/10 transition-all hover:scale-[1.02] border border-white/5"
                            >
                                <div 
                                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                    style={{ backgroundImage: `url('${getGoogleDriveImage(product.image)}')` }}
                                />
                                
                                {/* Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                                        (product.quantity > 0) ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                                    }`}>
                                        {(product.quantity > 0) ? "Disponible" : "Agotado"}
                                    </span>
                                </div>

                                {/* Info Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                                    <h3 className="text-white font-bold text-lg leading-tight truncate">{product.name}</h3>
                                    <p className="text-brand-orange font-bold text-xl">{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-brand-orange p-2 bg-black/50 rounded-full">
                        <X size={32} />
                    </button>
                    <img src={lightboxSrc} alt="Vista completa" className="max-h-[85vh] max-w-[95vw] rounded-lg shadow-2xl border border-white/10" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default Catalog;
