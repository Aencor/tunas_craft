import React, { useState, useEffect } from 'react';
import Hero3D from '../components/Hero3D';
import AdSense from '../components/AdSense';
import { Menu, X, Instagram, Facebook, Ruler, Palette, Home, Package, HelpCircle, User } from 'lucide-react';
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
              <Link to="/catalogo" className="text-slate-300 hover:text-white font-bold transition-colors">Catálogo</Link>
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
                    <Link to="/catalogo" onClick={toggleMenu} className="text-brand-orange font-bold text-lg">Catálogo</Link>
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
                <div className="w-full max-w-lg mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl shadow-brand-blue/20 border border-white/10 mt-4">
                    <video 
                        src="/video/video_web.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-auto object-cover pointer-events-none"
                    />
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

      {/* About Us */}
      <section className="py-24 bg-brand-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue/5 to-transparent pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-brand-orange/10 rounded-full mb-6 text-brand-orange">
                  <User size={32} />
              </div>
              <h2 className="font-display text-4xl font-bold mb-6">Sobre <span className="text-brand-orange">Nosotros</span></h2>
              <div className="prose prose-invert prose-lg mx-auto text-gray-300 leading-relaxed">
                  <p className="mb-6">
                      En <strong>Tuna's Craft</strong>, somos apasionados de la tecnología y el arte. Nacimos con la misión de 
                      transformar ideas digitales en objetos tangibles de alta calidad. Desde figuras coleccionables 
                      hasta prototipos funcionales, cada capa que imprimimos lleva nuestra dedicación y precisión.
                  </p>
                  <p>
                      Utilizamos tecnología de impresión 3D de última generación (FDM y Resina) para garantizar 
                      acabados suaves y detalles impresionantes. Nuestro compromiso es ofrecerte no solo un producto, 
                      sino una experiencia creativa única, apoyándote desde el diseño hasta la entrega final.
                  </p>
              </div>
          </div>
      </section>

      {/* AdSense Zone 1 */}
      <div className="container mx-auto px-4 max-w-4xl">
        <AdSense slot="1234567890" /> {/* Replace with actual slot ID if available, or keep generic for auto ads to pick up */}
      </div>

      {/* FAQ */}
      <section className="py-24 bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="font-display text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                      <HelpCircle className="text-brand-blue" /> Preguntas Frecuentes
                  </h2>
                  <p className="text-gray-400">Todo lo que necesitas saber antes de pedir.</p>
              </div>

              <div className="space-y-6">
                  <FAQItem 
                      question="¿Hacen envíos a todo México?" 
                      answer="Sí, realizamos envíos seguros a cualquier parte de la República Mexicana. El costo depende del volumen de tu pedido y tu código postal. Generalmente utilizamos paqueterías como FedEx, DHL o Estafeta para garantizar que tu pieza llegue intacta." 
                  />
                  <FAQItem 
                      question="¿Qué materiales utilizan?" 
                      answer="Trabajamos principalmente con PLA (plástico biodegradable derivado del maíz) para impresiones estándar por su versatilidad y resistencia. Para figuras de alto detalle (miniaturas, joyería), utilizamos Resina UV de alta resolución que captura hasta el más mínimo detalle." 
                  />
                  <FAQItem 
                      question="¿Pueden pintar las figuras?" 
                      answer="¡Claro! Ofrecemos el servicio de post-procesado y pintura a mano. Puedes pedir tu figura en 'crudo' (solo impresa y limpia) o completamente terminada y pintada por nuestros artistas. El costo varía según la complejidad del esquema de color." 
                  />
                  <FAQItem 
                      question="¿Cómo solicito una cotización personalizada?" 
                      answer="Es muy fácil. Ve a la sección de 'Cotizar Ahora' en nuestro menú, sube tu archivo STL si lo tienes, o descríbenos tu idea. Si no tienes el modelo 3D, nosotros podemos ayudarte a encontrarlo o modelarlo para ti." 
                  />
                  <FAQItem 
                      question="¿Cuánto tiempo tarda mi pedido?" 
                      answer="El tiempo de producción depende del tamaño y complejidad de la pieza, así como de nuestra carga de trabajo actual. Un pedido promedio toma entre 3 a 5 días hábiles. Para trabajos urgentes, contáctanos directamente para verificar disponibilidad." 
                  />
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
                    onClick={() => setLightboxSrc(getGoogleDriveImage(product.image))}
                    className="group relative overflow-hidden rounded-2xl shadow-lg aspect-square bg-gray-900 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02]"
                >
                    <div 
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${getGoogleDriveImage(product.image)}')` }}
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

        {/* Catalog Button */}
        <div className="mt-12 text-center">
            <Link to="/catalogo" className="inline-flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-orange-500/25">
                Ver Catálogo Completo &rarr;
            </Link>
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

const FAQItem = ({ question, answer }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-colors">
        <h3 className="text-lg font-bold text-white mb-2 flex items-start gap-2">
            <span className="text-brand-orange mt-1">Q:</span> {question}
        </h3>
        <p className="text-gray-400 pl-6 text-sm leading-relaxed">
            {answer}
        </p>
    </div>
);

export default Landing;
