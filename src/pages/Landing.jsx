import React, { useState, useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import { Menu, X, Instagram, Facebook, Ruler, Palette, Home, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGallery } from '../hooks/useGallery';

const Landing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Use Hook
    const { products, loading } = useGallery();

    const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
    
    // Filter logic
    const filteredProducts = activeCategory === 'Todos' || activeCategory === 'all' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    // Limit to 12 for Home
    const displayedProducts = filteredProducts.slice(0, 12);

    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="bg-brand-dark min-h-screen text-slate-100 font-sans">
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
               <img className="h-12 w-auto" src="/logo.png" alt="Tuna's Craft" />
               <span className="font-display font-bold text-2xl tracking-tight text-white">Tuna's Craft</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#gallery" className="text-slate-300 hover:text-white transition-colors">Galería</a>
              <a href="#services" className="text-slate-300 hover:text-white transition-colors">Servicios</a>
              <a href="#delivery" className="text-slate-300 hover:text-white transition-colors">Entregas</a>
              <Link to="/status" className="text-slate-300 hover:text-white transition-colors">Status del Pedido</Link>
              <Link to="/quote" className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/25">
                Cotizar Ahora
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-300 hover:text-white p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-brand-dark border-t border-white/10 p-4">
                <div className="space-y-4 flex flex-col items-center">
                    <a href="#gallery" onClick={toggleMenu} className="text-slate-300 hover:text-white text-lg">Galería</a>
                    <a href="#services" onClick={toggleMenu} className="text-slate-300 hover:text-white text-lg">Servicios</a>
                    <a href="#delivery" onClick={toggleMenu} className="text-slate-300 hover:text-white text-lg">Entregas</a>
                    <Link to="/status" onClick={toggleMenu} className="text-slate-300 hover:text-white text-lg">Status del Pedido</Link>
                    <Link to="/quote" onClick={toggleMenu} className="bg-brand-orange text-white px-8 py-3 rounded-full font-bold text-lg mt-4">
                        Cotizar Ahora
                    </Link>
                </div>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 w-full">
            <div className="flex-1 text-center md:text-left z-10">
                <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                    Tus ideas, impresas en <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-orange">3D Realidad</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto md:mx-0">
                    Creamos figuras, adornos y piezas personalizadas con la mejor calidad. 
                    ¡Si lo imaginas, lo podemos imprimir!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link to="/quote" className="bg-brand-blue hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                        Hacer un Pedido
                    </Link>
                </div>
            </div>
            <div className="flex-1 w-full h-[400px] md:h-[600px] relative z-10">
                <Hero3D />
            </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-brand-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="font-display text-4xl font-bold mb-4">Nuestros <span className="text-brand-blue">Servicios</span></h2>
                <p className="text-gray-400">Calidad premium en cada capa.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ServiceCard icon={<Ruler size={40} className="text-brand-blue" />} title="Impresión a Medida" desc="Prototipos, refacciones y piezas técnicas diseñadas específicamente para tus necesidades." />
                <ServiceCard icon={<Palette size={40} className="text-brand-orange" />} title="Figuras y Arte" desc="Coleccionables de anime, videojuegos y miniaturas de alta resolución para pintar." />
                <ServiceCard icon={<Home size={40} className="text-purple-500" />} title="Decoración" desc="Macetas, lámparas, litofanías y regalos únicos para darle vida a tus espacios." />
            </div>
        </div>
      </section>

      {/* Delivery Section (Design Match) */}
      <section id="delivery" className="py-24 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12">
                   
                   {/* Left Col: Info */}
                   <div className="flex-1 space-y-8">
                       <h2 className="text-3xl font-display font-bold text-white">Información de <span className="text-brand-orange">Entregas</span></h2>
                       
                       <div className="space-y-6">
                           {/* Main Point */}
                           <div className="flex gap-4">
                               <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                   <Home size={24} />
                               </div>
                               <div>
                                   <h4 className="font-bold text-white text-lg">Punto de Entrega Principal</h4>
                                   <p className="text-gray-400">Metro Chabacano, CDMX</p>
                                   <a href="https://maps.google.com/?q=Metro+Chabacano" target="_blank" rel="noreferrer" className="inline-block mt-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                       Ver Ubicación en Mapa
                                   </a>
                                   <p className="text-blue-400 text-xs font-bold mt-2">Sábados: 11:00 am - 3:00 pm</p>
                               </div>
                           </div>
                           
                           {/* Urgent */}
                           <div className="flex items-center gap-4">
                               <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                                   <Ruler size={24} /> 
                               </div>
                               <div>
                                   <h4 className="font-bold text-white">Entregas Urgentes / Entre Semana</h4>
                                   <p className="text-sm text-gray-500">Punto a convenir (Con costo extra)</p>
                               </div>
                           </div>

                           {/* Nationwide */}
                           <div className="flex items-center gap-4">
                               <div className="flex-shrink-0 w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-black font-bold shadow-lg shadow-orange-500/20">
                                   <Package size={24} />
                               </div>
                               <div>
                                   <h4 className="font-bold text-white">Envíos a todo México</h4>
                                   <p className="text-sm text-gray-500">Paquetería segura (Con costo adicional)</p>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Right Col: Payment Methods */}
                   <div className="flex-1 bg-black/20 rounded-2xl p-8 border border-white/5">
                        <h3 className="text-xl font-bold text-center mb-8 text-white">Métodos de Pago</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-center text-sm font-medium text-gray-300 hover:bg-slate-700/50 transition-colors cursor-default">
                                💳 Tarjeta / MSI
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-center text-sm font-medium text-gray-300 hover:bg-slate-700/50 transition-colors cursor-default">
                                💸 Transferencia
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-center text-sm font-medium text-gray-300 hover:bg-slate-700/50 transition-colors cursor-default">
                                💵 Efectivo
                            </div>
                             <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                                <span className="text-blue-500 font-bold italic">mercadopago</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center">
                            <Link to="/status" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:text-white transition-colors">
                                Revisa estatus de tu pedido &rarr;
                            </Link>
                        </div>
                   </div>

               </div>
          </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-bold mb-6 text-center text-white">Galería de <span className="text-brand-orange">Trabajos</span></h2>
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 
                        ${(activeCategory === cat || (cat === 'Todos' && activeCategory === 'all'))
                            ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-orange-500/30' 
                            : 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-400 hover:text-white'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product, idx) => (
                <div 
                    key={idx}
                    onClick={() => setLightboxSrc(product.image)}
                    className="group relative overflow-hidden rounded-2xl shadow-lg aspect-square bg-gray-900 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02]"
                >
                    <div 
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${product.image}')` }}
                    />
                    
                    {/* Availability Badge */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                            (product.quantity > 0) ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                        }`}>
                            {(product.quantity > 0) ? "Disponible" : "Agotado"}
                        </span>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <h3 className="text-white font-bold text-lg drop-shadow-md leading-tight">{product.name}</h3>
                        <p className="text-brand-orange font-bold text-xl mt-1">{product.price}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
            <button className="absolute top-4 right-4 text-white hover:text-brand-orange p-2">
                <X size={32} />
            </button>
            <img src={lightboxSrc} alt="Full view" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-white/10 text-center relative overflow-hidden">
        <div className="flex justify-center gap-10 mb-10">
            <SocialLink href="https://facebook.com/tunascraft3d" icon={<Facebook />} label="Facebook" />
            <SocialLink href="https://instagram.com/tunas_craft" icon={<Instagram />} label="Instagram" />
        </div>
        <p className="text-gray-500 font-medium text-sm">&copy; 2024 Tuna's Craft. Hecho con 💙 y 🟠.</p>
        <div className="mt-4">
             <Link to="/admin" className="text-xs text-gray-700 hover:text-brand-blue">Admin Access</Link>
        </div>
      </footer>
    </div>
  );
}

const ServiceCard = ({ icon, title, desc }) => (
    <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all cursor-default group">
        <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="font-display text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

const SocialLink = ({ href, icon, label }) => (
    <a href={href} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-blue/10 group-hover:scale-110 transition-all border border-white/5 shadow-lg">
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </a>
)

export default Landing;
