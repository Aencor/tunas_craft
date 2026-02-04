import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Center, Stage } from '@react-three/drei';
import { Upload, Calculator, DollarSign, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Link from 'react-router-dom';
import * as THREE from 'three';
import AdBanner from '../components/AdBanner';

// --- AD SENSE COMPONENT ---
// Local AdBanner removed in favor of shared component

// --- 3D VIEWER COMPONENTS ---

const ModelViewer = ({ url, onVolumeCalculated }) => {
    const geometry = useLoader(STLLoader, url);
    
    useEffect(() => {
        if (geometry && onVolumeCalculated) {
             // Calculate Volume
             let vol = 0;
             const pos = geometry.attributes.position;
             if(pos) {
                 const faces = pos.count / 3;
                 const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
                 for(let i = 0; i < faces; i++) {
                     p1.fromBufferAttribute(pos, i * 3 + 0);
                     p2.fromBufferAttribute(pos, i * 3 + 1);
                     p3.fromBufferAttribute(pos, i * 3 + 2);
                     vol += p1.dot(p2.cross(p3)) / 6.0;
                 }
             }
             onVolumeCalculated(Math.abs(vol)); // Volume in cubic units (usually mm³)
        }
    }, [geometry, onVolumeCalculated]);

    return (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#4f46e5" roughness={0.5} metalness={0.5} />
        </mesh>
    );
};

// --- MAIN PAGE ---

const PublicScanner = () => {
    const [file, setFile] = useState(null);
    const [modelUrl, setModelUrl] = useState(null);
    const [volumeCm3, setVolumeCm3] = useState(0);
    const [material, setMaterial] = useState('PLA');
    const [isThinking, setIsThinking] = useState(false);

    // --- PRICING CONSTANTS (Approximation) ---
    // These mask the real complexity of machine time, labor, etc. into a "per gram" or "per cm3" heuristic
    // typically density is used to convert cm3 to grams. 
    // PLA ~ 1.24 g/cm3
    const MATERIALS = {
        PLA: { name: 'PLA Estándar', density: 1.24, pricePerGram: 1.5 }, // Example public price
        PETG: { name: 'PETG Resistente', density: 1.27, pricePerGram: 1.8 },
        TPU: { name: 'TPU Flexible', density: 1.21, pricePerGram: 2.2 },
        ABS: { name: 'ABS Ingeniería', density: 1.04, pricePerGram: 1.6 },
    };

    // --- HANDLERS ---
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        if (!uploadedFile.name.toLowerCase().endsWith('.stl')) {
            alert('Solo se permiten archivos .stl');
            return;
        }

        setIsThinking(true);
        setFile(uploadedFile);
        
        // Clean up old URL
        if(modelUrl) URL.revokeObjectURL(modelUrl);
        
        const url = URL.createObjectURL(uploadedFile);
        setModelUrl(url);
        setVolumeCm3(0); // Reset until calculated
    };

    const handleVolume = (volMm3) => {
        // Convert cubic mm to cubic cm: / 1000
        const volCm3 = volMm3 / 1000;
        setVolumeCm3(volCm3);
        setIsThinking(false);
    };

    const handleReset = () => {
        setFile(null);
        if(modelUrl) URL.revokeObjectURL(modelUrl);
        setModelUrl(null);
        setVolumeCm3(0);
    };

    // --- CALCULATION ---
    const estimatedWeight = volumeCm3 * MATERIALS[material].density;
    
    // Heuristic Price Logic for Public:
    // Base setup fee + (Weight * PricePerGram)
    // Adjust these numbers based on your actual public pricing strategy!
    const setupFee = 50; 
    const price = (estimatedWeight * MATERIALS[material].pricePerGram) + setupFee;
    
    // Time Estimation (Heuristic: 10g per hour roughly? Very vague)
    const printSpeedGramsPerHour = 12; // Conservative average
    const hours = estimatedWeight / printSpeedGramsPerHour;

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand-orange selection:text-white">
            
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="text-slate-400 group-hover:text-white transition-colors" size={20}/>
                        <span className="font-display font-bold text-xl">Tuna's <span className="text-brand-orange">Craft</span></span>
                    </Link>
                    <div className="text-xs font-bold bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full border border-brand-blue/20">
                        Cotizador Público Beta
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Ad Banner Top */}
                <AdBanner slotId="TOP_BANNER_ID" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT: 3D Viewer Area */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className={`relative w-full aspect-video lg:aspect-[4/3] bg-slate-800 rounded-2xl border-2 border-dashed ${!file ? 'border-slate-600 hover:border-brand-blue/50' : 'border-slate-700/50'} overflow-hidden transition-all group`}>
                            
                            {!file ? (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 group-hover:text-brand-blue transition-colors">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Sube tu archivo STL</h3>
                                    <p className="text-slate-400 text-sm">Arrastra o haz click para seleccionar</p>
                                    <input type="file" className="hidden" accept=".stl" onChange={handleFileUpload} />
                                </label>
                            ) : (
                                <>
                                    <Canvas shadows dpr={[1, 2]} camera={{ position: [50, 50, 50], fov: 50 }}>
                                        <Suspense fallback={null}>
                                            <Stage environment="city" intensity={0.6}>
                                                <ModelViewer url={modelUrl} onVolumeCalculated={handleVolume} />
                                            </Stage>
                                        </Suspense>
                                        <OrbitControls autoRotate />
                                    </Canvas>
                                    
                                    <button 
                                        onClick={handleReset}
                                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur transition-all"
                                    >
                                        <X size={20} />
                                    </button>

                                    {isThinking && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                            <div className="flex flex-col items-center animate-pulse">
                                                <Calculator className="text-brand-blue mb-4" size={48} />
                                                <span className="text-xl font-bold">Analizando geometría...</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-4">
                            <AlertCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-200 text-sm mb-1">Nota sobre la precisión</h4>
                                <p className="text-sm text-blue-300/80">
                                    Este cotizador utiliza un cálculo geométrico aproximado. El precio final puede variar dependiendo de la complejidad de los soportes y la orientación óptima de impresión.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Controls & Price */}
                    <div className="space-y-6">
                        
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                                <Calculator className="text-brand-orange" /> Cotización Rápida
                            </h2>

                            <div className="space-y-6">
                                {/* Material Selector */}
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Material</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(MATERIALS).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setMaterial(m)}
                                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                                                    material === m 
                                                    ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-blue-500/20' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                                }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 text-right">
                                        {MATERIALS[material].name}
                                    </p>
                                </div>

                                {/* Results Display */}
                                <div className={`space-y-4 transition-opacity duration-300 ${!file || isThinking ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400 text-sm">Volumen</span>
                                        <span className="font-mono text-white">{volumeCm3 > 0 ? volumeCm3.toFixed(2) : '--'} cm³</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400 text-sm">Peso Estimado</span>
                                        <span className="font-mono text-white">{volumeCm3 > 0 ? estimatedWeight.toFixed(1) : '--'} g</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                        <span className="text-slate-400 text-sm">Tiempo Aprox.</span>
                                        <span className="font-mono text-white">{volumeCm3 > 0 ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m` : '--'}</span>
                                    </div>

                                    <div className="bg-slate-900 rounded-xl p-6 mt-6 border border-slate-700 text-center">
                                        <span className="text-slate-400 text-xs font-bold uppercase">Precio Estimado</span>
                                        <div className="text-4xl font-extrabold text-white mt-1 mb-1 tracking-tight">
                                            {file && !isThinking ? formatCurrency(price) : '$0.00'}
                                        </div>
                                        <span className="text-xs text-slate-500">MXN (IVA Incluido)</span>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <button 
                                    disabled={!file || isThinking}
                                    onClick={() => {
                                        const phone = '525619956812';
                                        const msg = `Hola Tuna's Craft 🌵, coticé una pieza en su web:\n\n- Material: ${material}\n- Peso Est: ${estimatedWeight.toFixed(1)}g\n- Precio Est: ${formatCurrency(price)}\n\nMe gustaría proceder con el pedido.`;
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                                        !file || isThinking
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        : 'bg-brand-orange hover:bg-orange-600 shadow-orange-500/20 hover:scale-[1.02] text-white'
                                    }`}
                                >
                                    <DollarSign size={20} />
                                    Solicitar Impresión
                                </button>
                                
                                <p className="text-center text-xs text-slate-500 mt-2">
                                    Al continuar serás redirigido a WhatsApp.
                                </p>
                            </div>
                        </div>

                        {/* Ad Banner Sidebar/Bottom */}
                        <AdBanner slotId="SIDEBAR_BANNER_ID" />

                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicScanner;
