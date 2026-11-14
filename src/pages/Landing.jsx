import React, { useState, useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import AdSense from '../components/AdSense';
import SEO from '../components/SEO';
import { 
    Menu, X, Instagram, Facebook, Ruler, Palette, Home, 
    Package, HelpCircle, Sparkles, ArrowRight, CheckCircle2, 
    ShieldCheck, MapPin, Clock, CreditCard, ArrowRightLeft, 
    Banknote, ShoppingBag, Eye, Zap, Layers, FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGallery } from '../hooks/useGallery';

const Landing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [heroTab, setHeroTab] = useState('3d'); // '3d' or 'video'
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Gallery products
    const { products, loading } = useGallery();

    const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
    
    // Filter logic
    const filteredProducts = activeCategory === 'Todos' || activeCategory === 'all' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    // Limit to 12 for Home showcase
    const displayedProducts = filteredProducts.slice(0, 12);

    // Google Drive URL parser for thumbnails and logo fallback
    const getGoogleDriveImage = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return '/logo.png';
        const driveRegex = /(?:\/d\/|id=)([a-zA-Z0-9_-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
        return url;
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
            <SEO 
                title="Tuna's Craft | Impresión 3D, Modelado y Prototipado en CDMX y México"
                description="Taller especializado en impresión 3D, prototipado y modelado digital en Ciudad de México (CDMX). Cotiza tus archivos STL/3MF al instante y recibe envíos a todo México."
                canonical="https://tunascraft.com/"
            />
            
            {/* Top Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20' 
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo & Brand */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img className="h-10 w-auto rounded-lg" src="/logo.png" alt="Tuna's Craft" />
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                                    Tuna's Craft
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                                    Impresión 3D & Arte
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex space-x-7 items-center text-sm font-medium">
                            <a href="#gallery" className="text-slate-300 hover:text-white transition-colors">Catálogo Rápido</a>
                            <a href="#services" className="text-slate-300 hover:text-white transition-colors">Servicios</a>
                            <a href="#about" className="text-slate-300 hover:text-white transition-colors">Nosotros</a>
                            <a href="#delivery" className="text-slate-300 hover:text-white transition-colors">Entregas y Pagos</a>
                            <Link to="/status" className="text-slate-300 hover:text-white transition-colors">Estatus de Pedido</Link>
                            
                            <Link 
                                to="/catalogo" 
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl transition-colors font-semibold"
                            >
                                Catálogo Completo
                            </Link>

                            <Link 
                                to="/quote" 
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
                            >
                                Cotizar Ahora
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={toggleMenu} 
                                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                aria-label="Abrir menú"
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Dropdown Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-6 space-y-3">
                        <a href="#gallery" onClick={toggleMenu} className="block text-slate-300 hover:text-white py-2 text-base font-medium">Catálogo Rápido</a>
                        <a href="#services" onClick={toggleMenu} className="block text-slate-300 hover:text-white py-2 text-base font-medium">Servicios</a>
                        <a href="#about" onClick={toggleMenu} className="block text-slate-300 hover:text-white py-2 text-base font-medium">Nosotros</a>
                        <a href="#delivery" onClick={toggleMenu} className="block text-slate-300 hover:text-white py-2 text-base font-medium">Entregas y Pagos</a>
                        <Link to="/status" onClick={toggleMenu} className="block text-slate-300 hover:text-white py-2 text-base font-medium">Estatus de Pedido</Link>
                        <div className="pt-4 border-t border-slate-800 space-y-2">
                            <Link to="/catalogo" onClick={toggleMenu} className="block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-700">
                                Ver Catálogo Completo
                            </Link>
                            <Link to="/quote" onClick={toggleMenu} className="block text-center bg-amber-500 text-slate-950 font-bold py-3 rounded-xl">
                                Cotizar Pieza Ahora
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                            
                            {/* Status Pill */}
                            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>Taller de Impresión 3D & Fabricación Digital · CDMX</span>
                            </div>

                            {/* Headline (Crisp solid typography, NO gradients) */}
                            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                                Tus ideas, creadas en <span className="text-amber-400">3D de alta precisión</span>.
                            </h1>

                            {/* Description */}
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Creamos figuras coleccionables, prototipos técnicos, accesorios gaming y piezas personalizadas con acabados premium. Desde tu archivo STL o modelado desde cero.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link 
                                    to="/catalogo" 
                                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5 text-base active:scale-95"
                                >
                                    <ShoppingBag size={20} />
                                    <span>Explorar Catálogo</span>
                                    <ArrowRight size={18} />
                                </Link>

                                <Link 
                                    to="/quote" 
                                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-base"
                                >
                                    <Sparkles size={18} className="text-amber-400" />
                                    <span>Cotizar Pieza Personalizada</span>
                                </Link>
                            </div>

                            {/* Quick Stats Banner */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-display font-extrabold text-white">+1,000</div>
                                    <div className="text-xs text-slate-400">Piezas impresas</div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-display font-extrabold text-white">0.08 mm</div>
                                    <div className="text-xs text-slate-400">Resolución FDM/Resina</div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-display font-extrabold text-white">100%</div>
                                    <div className="text-xs text-slate-400">Material certificado</div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-display font-extrabold text-amber-400">Nacional</div>
                                    <div className="text-xs text-slate-400">Envíos a todo México</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Interactive Showcase (3D Model / Video Switcher) */}
                        <div className="lg:col-span-5 w-full">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden">
                                
                                {/* Tab selector */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 px-2">
                                    <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                        <button 
                                            onClick={() => setHeroTab('3d')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                heroTab === '3d' 
                                                    ? 'bg-amber-500 text-slate-950' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Modelo 3D Interactivo
                                        </button>
                                        <button 
                                            onClick={() => setHeroTab('video')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                heroTab === 'video' 
                                                    ? 'bg-amber-500 text-slate-950' 
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Video del Taller
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">
                                        {heroTab === '3d' ? 'Gira con mouse/touch' : 'Impresión en directo'}
                                    </span>
                                </div>

                                {/* Viewer Frame */}
                                <div className="relative h-[360px] sm:h-[420px] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 flex items-center justify-center">
                                    {heroTab === '3d' ? (
                                        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
                                            <Hero3D />
                                            <div className="absolute bottom-3 left-3 bg-slate-900/90 text-[10px] text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
                                                Arrastra para rotar la pieza 3D
                                            </div>
                                        </div>
                                    ) : (
                                        <video 
                                            src="/video/video_web.mp4" 
                                            autoPlay 
                                            loop 
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-slate-900/40 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Especialidades</span>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                            Nuestros Servicios de Fabricación
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            Combinamos tecnologías FDM y Resina UV de alta definición con materiales de grado técnico para lograr resultados excepcionales.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-blue-400 border border-slate-700">
                                <Ruler size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">Impresión a Medida & Prototipos</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Fabricación de refacciones, engranes, gabinetes, soportes y componentes funcionales con tolerancias milimétricas.
                            </p>
                            <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Materiales: PLA+, PETG, ABS y TPU flexible</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Optimización y reparación de archivos STL</span>
                                </li>
                            </ul>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-amber-400 border border-slate-700">
                                <Palette size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">Figuras, Miniaturas & Coleccionables</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Reproducciones de personajes de anime, videojuegos, TCGs y esculturas con nivel de detalle microscópico.
                            </p>
                            <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Resina UV 8K sin líneas visibles</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Disponibles en crudo o pintadas a mano</span>
                                </li>
                            </ul>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-purple-400 border border-slate-700">
                                <Home size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">Decoración & Setup Gaming</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Soportes para control (PS5, Switch, Xbox), cajas deckbox temáticas, alhajeros góticos, lámparas y macetas.
                            </p>
                            <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Líneas temáticas: Goth, TCGs, Pokémon, Cosplay</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>Diseños listos para entrega o envío</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-14 shadow-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            
                            <div className="lg:col-span-6 space-y-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Compromiso y Precisión</span>
                                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                    Sobre Tuna's Craft
                                </h2>
                                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                    En <strong>Tuna's Craft</strong> transformamos archivos digitales en objetos tangibles con la más alta fidelidad técnica. Nacimos para ofrecer piezas bien terminadas, resistentes y con la estética exacta que buscas para tu colección, tu setup o tus proyectos profesionales.
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Supervisamos cada fase del proceso: preparación del modelo 3D, calibración de extrusión, post-procesado manual y control de calidad antes de entrega o empaque.
                                </p>
                                <div className="pt-2">
                                    <Link 
                                        to="/catalogo" 
                                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl border border-slate-700 transition-colors"
                                    >
                                        <span>Conoce nuestro catálogo</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                                    <ShieldCheck className="text-amber-400 mb-3" size={24} />
                                    <h4 className="font-bold text-white text-sm mb-1">Garantía de Calidad</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Revisión rigurosa de capas y soporte en cada pieza antes de entregarla.
                                    </p>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                                    <Zap className="text-blue-400 mb-3" size={24} />
                                    <h4 className="font-bold text-white text-sm mb-1">Tiempos Rápidos</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Producción ágil en 3 a 5 días hábiles, con opción urgente disponible.
                                    </p>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                                    <Layers className="text-purple-400 mb-3" size={24} />
                                    <h4 className="font-bold text-white text-sm mb-1">Múltiples Tecnologías</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        FDM de alta velocidad y Resina UV de máxima definición según el tipo de pieza.
                                    </p>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                                    <Package className="text-emerald-400 mb-3" size={24} />
                                    <h4 className="font-bold text-white text-sm mb-1">Empaque Reforzado</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Protección anti-impactos para que tus piezas lleguen intactas a cualquier estado.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* AdSense Zone */}
            <div className="container mx-auto px-4 max-w-4xl py-4">
                <AdSense slot="1234567890" />
            </div>

            {/* Gallery / Catalog Showcase Section */}
            <section id="gallery" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Galería de Trabajos</span>
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-1">
                            Piezas Destacadas
                        </h2>
                    </div>

                    <div className="flex gap-3">
                        <Link 
                            to="/catalogo" 
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <FileDown size={16} />
                            <span>Ver Catálogo Completo & PDF</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
                                (activeCategory === cat || (cat === 'Todos' && activeCategory === 'all'))
                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-slate-400 text-sm">
                        Cargando galería...
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayedProducts.map((product, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setLightboxSrc(getGoogleDriveImage(product.image))}
                                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col cursor-pointer"
                            >
                                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                                    <div 
                                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url('${getGoogleDriveImage(product.image)}')` }}
                                    />
                                    
                                    {/* Availability Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                            (product.quantity > 0) 
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                                                : "bg-slate-800 text-slate-400 border-slate-700"
                                        }`}>
                                            {(product.quantity > 0) ? "Disponible" : "Bajo pedido"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                                            {product.category || 'Otros'}
                                        </span>
                                        <h3 className="text-white font-bold text-sm leading-tight group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                                            {product.name}
                                        </h3>
                                    </div>

                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-amber-400 font-bold text-base">{product.price}</span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-white transition-colors">
                                            <Eye size={14} /> Ver
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Full Catalog Button */}
                <div className="mt-12 text-center">
                    <Link 
                        to="/catalogo" 
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
                    >
                        <span>Explorar el Catálogo Completo ({products.length} productos)</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Delivery & Payment Information Section */}
            <section id="delivery" className="py-24 border-b border-slate-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Puntos y Formas de Pago</span>
                        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                            Entregas y Métodos de Pago
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        
                        {/* Delivery Options */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="text-amber-400" size={22} />
                                <span>Opciones de Entrega</span>
                            </h3>

                            {/* Point 1: Chabacano */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
                                    <MapPin size={22} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Punto de Entrega Principal (Sin Costo)</h4>
                                    <p className="text-xs text-slate-400">Metro Chabacano (Líneas 2, 8 y 9), CDMX</p>
                                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                                        <Clock size={13} /> Sábados: 11:00 am - 3:00 pm
                                    </p>
                                    <a 
                                        href="https://maps.google.com/?q=Metro+Chabacano" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                                    >
                                        Ver ubicación en Google Maps &rarr;
                                    </a>
                                </div>
                            </div>

                            {/* Point 2: Nationwide */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                                    <Package size={22} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Envíos a Todo México</h4>
                                    <p className="text-xs text-slate-400">
                                        Paquetería certificada (FedEx, DHL, Estafeta) con número de guía y seguro de envío.
                                    </p>
                                </div>
                            </div>

                            {/* Point 3: Urgent */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
                                    <Zap size={22} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-sm">Entregas Urgentes / Entre Semana</h4>
                                    <p className="text-xs text-slate-400">
                                        Coordinación en estación intermedia en CDMX con costo de traslado mínimo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods (Clean icons, NO emojis) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-amber-400" size={22} />
                                    <span>Métodos de Pago Aceptados</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Tarjetas Débito / Crédito</div>
                                            <div className="text-[11px] text-slate-400">Visa, Mastercard, AMEX</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
                                            <ArrowRightLeft size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Transferencia SPEI</div>
                                            <div className="text-[11px] text-slate-400">Acreditación instantánea</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
                                            <Banknote size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Efectivo</div>
                                            <div className="text-[11px] text-slate-400">Pago en entrega Chabacano</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-purple-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Mercado Pago & PayPal</div>
                                            <div className="text-[11px] text-slate-400">Protección al comprador</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-xs text-slate-400">¿Ya tienes un pedido activo con nosotros?</span>
                                <Link 
                                    to="/status" 
                                    className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5"
                                >
                                    <span>Consultar estatus del pedido</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 border-b border-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Dudas Comunes</span>
                        <h2 className="font-display text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                            <HelpCircle className="text-amber-400" size={28} />
                            <span>Preguntas Frecuentes</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <FAQItem 
                            question="¿Cómo solicito una cotización de mi archivo 3D?" 
                            answer="Puedes ingresar a la sección de 'Cotizar Ahora' en el menú, subir tu archivo STL o describirnos la idea con enlaces o imágenes. Te responderemos en menos de 24 horas con el costo y tiempo de producción exactos." 
                        />
                        <FAQItem 
                            question="¿Qué materiales y tecnologías utilizan?" 
                            answer="Para piezas funcionales y decorativas estándar usamos FDM con filamentos de primera calidad como PLA ecológico, PETG y ABS. Para miniaturas y joyería de precisión milimétrica utilizamos Resina UV 8K con curado profesional." 
                        />
                        <FAQItem 
                            question="¿Hacen envíos a todo México?" 
                            answer="Sí, enviamos a todos los estados de la República Mexicana por paqueterías seguras como FedEx, DHL y Estafeta. Cada envío se empaca con protección especial para piezas frágiles." 
                        />
                        <FAQItem 
                            question="¿Ofrecen piezas pintadas a mano?" 
                            answer="Sí, contamos con servicio de pintura artística para figuras y miniaturas. Puedes solicitar tu pieza impresa en crudo o terminada con esquema de colores personalizado." 
                        />
                        <FAQItem 
                            question="¿Puedo recoger mi pedido personalmente en CDMX?" 
                            answer="¡Claro! Entregamos sin costo adicional todos los sábados de 11:00 am a 3:00 pm en Metro Chabacano. También podemos convenir otros puntos de entrega según disponibilidad." 
                        />
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxSrc && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" 
                    onClick={() => setLightboxSrc(null)}
                >
                    <button 
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-4 right-4 text-white hover:text-amber-400 p-2 bg-slate-900/80 rounded-full border border-slate-700"
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={lightboxSrc} 
                        alt="Vista completa" 
                        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl border border-slate-800" 
                        onClick={e => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* Modern Footer (Clean, NO emoji excess) */}
            <footer className="bg-slate-950 py-16 border-t border-slate-900 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="flex justify-center gap-6">
                        <a 
                            href="https://facebook.com/tunascraft3d" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a 
                            href="https://instagram.com/tunas_craft" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                        <p className="font-medium text-slate-300">
                            &copy; 2026 Tuna's Craft · Impresión 3D y Modelado Digital · Ciudad de México
                        </p>
                        <p className="text-slate-500">
                            Todos los derechos reservados. Diseñado para ofrecer la más alta calidad en fabricación aditiva.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-900">
                        <Link to="/admin" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
                            Acceso de Administración
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FAQItem = ({ question, answer }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
        <h3 className="text-base font-bold text-white mb-2 flex items-start gap-2.5">
            <span className="text-amber-400 font-extrabold">P:</span> 
            <span>{question}</span>
        </h3>
        <p className="text-slate-400 pl-6 text-sm leading-relaxed">
            {answer}
        </p>
    </div>
);

export default Landing;
