import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Clock, Scale, ArrowLeft, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- AD SENSE COMPONENT (Reused for consistency) ---
const AdBanner = ({ slotId, className = '' }) => {
    useEffect(() => {
        try {
            if (window.adsbygoogle) console.log('AdSense Push'); 
        } catch (e) {
            console.error('AdSense Error', e);
        }
    }, []);

    return (
        <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center my-6 ${className}`}>
             <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Publicidad</span>
             <div className="w-full h-24 bg-slate-700/30 flex items-center justify-center text-slate-500 text-sm">
                 Espacio para Google AdSense
             </div>
        </div>
    );
};

const PublicManualQuote = () => {
    // Inputs
    const [material, setMaterial] = useState('PLA');
    const [weight, setWeight] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [profitMargin, setProfitMargin] = useState(200); // Default Margin
    const [filamentPrice, setFilamentPrice] = useState(400); // Price per Kg

    const [price, setPrice] = useState(0);

    // --- CONFIGURATION CONSTANTS (HIDDEN FROM UI) ---
    // These should mimic the "standard" defaults from the admin calculator
    const SETTINGS = {
        powerRating: 150, // Watts
        kwhCost: 2.5, // $
        laborRate: 50, // $/h
        laborTime: 15, // mins (post-processing average)
        printerRate: 5, // $/h (maintenance)
        failureRate: 10, // %
        // profitMargin removed from fixed settings, now dynamic
        taxRate: 16, // %
    };

    const MATERIALS = {
        PLA: { name: 'PLA Estándar', price: 400 },
        PETG: { name: 'PETG Resistente', price: 500 },
        TPU: { name: 'TPU Flexible', price: 650 },
        ABS: { name: 'ABS Ingeniería', price: 450 },
    };

    // --- CALCULATION LOGIC ---
    useEffect(() => {
        const w = parseFloat(weight) || 0;
        const h = parseFloat(hours) || 0;
        const m = parseFloat(minutes) || 0;
        const margin = parseFloat(profitMargin) || 0;
        
        if (w === 0 && h === 0 && m === 0) {
            setPrice(0);
            return;
        }

        // 1. Material Cost
        // 1. Material Cost
        // const matPrice = MATERIALS[material].price; // Old logic
        const materialCost = (w / 1000) * parseFloat(filamentPrice);

        // 2. Time
        const totalHours = h + (m / 60);

        // 3. Electricity
        const electricityCost = (SETTINGS.powerRating * totalHours / 1000) * SETTINGS.kwhCost;

        // 4. Labor (Fixed time per print for estimate)
        const laborCost = (SETTINGS.laborTime / 60) * SETTINGS.laborRate;

        // 5. Machine Depreciation
        const machineCost = totalHours * SETTINGS.printerRate;

        // 6. Subtotal
        let subtotal = materialCost + electricityCost + laborCost + machineCost;

        // 7. Failure Rate
        subtotal += subtotal * (SETTINGS.failureRate / 100);

        // 8. Profit (Dynamic)
        const profit = subtotal * (margin / 100);
        const basePrice = subtotal + profit;

        // 9. Rounding (Nearest 5)
        const roundedBase = Math.ceil(basePrice / 5) * 5;

        // 10. Tax
        const tax = roundedBase * (SETTINGS.taxRate / 100);
        const finalPrice = roundedBase + tax;

        setPrice(finalPrice);

    }, [weight, hours, minutes, material, profitMargin, filamentPrice]);

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand-orange selection:text-white">
            <header className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="text-slate-400 group-hover:text-white transition-colors" size={20}/>
                        <span className="font-display font-bold text-xl">Tuna's <span className="text-brand-orange">Craft</span></span>
                    </Link>
                    <div className="text-xs font-bold bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
                        Calculadora Manual
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <AdBanner slotId="MANUAL_TOP" />

                <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* INPUTS */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-display font-bold mb-2">Datos de Impresión</h1>
                                <p className="text-slate-400 text-sm">Ingresa los datos proporcionados por tu slicer (Cura, PrusaSlicer, Orca, etc).</p>
                            </div>

                            {/* Material */}
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Material</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.keys(MATERIALS).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => {
                                                setMaterial(m);
                                                setFilamentPrice(MATERIALS[m].price);
                                            }}
                                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                                                material === m 
                                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Costo Filamento */}
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Costo Filamento (1kg)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={filamentPrice}
                                        onChange={e => setFilamentPrice(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Weight */}
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Peso (Gramos)</label>
                                <div className="relative group">
                                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                    <input 
                                        type="number" 
                                        value={weight}
                                        onChange={e => setWeight(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-lg"
                                    />
                                </div>
                            </div>

                             {/* Time */}
                             <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Tiempo de Impresión</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                        <input 
                                            type="number" 
                                            value={hours}
                                            onChange={e => setHours(e.target.value)}
                                            placeholder="Horas"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-lg"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">m</span>
                                        <input 
                                            type="number" 
                                            value={minutes}
                                            onChange={e => setMinutes(e.target.value)}
                                            placeholder="Minutos"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-4 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Profit Margin (NEW) */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                     <label className="text-slate-400 text-xs font-bold uppercase">Margen de Ganancia</label>
                                     <span className="text-green-400 font-bold text-xs">{profitMargin}%</span>
                                </div>
                                <div className="relative group">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors" size={20} />
                                    <input 
                                        type="number" 
                                        value={profitMargin}
                                        onChange={e => setProfitMargin(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono text-lg"
                                    />
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="500" 
                                    value={profitMargin} 
                                    onChange={e => setProfitMargin(e.target.value)}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 mt-3" 
                                />
                            </div>

                        </div>

                        {/* RESULTS */}
                        <div className="flex flex-col justify-center space-y-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                            
                            <div className="text-center space-y-1">
                                <span className="text-slate-400 text-xs font-bold uppercase">Precio Sugerido</span>
                                <div className="text-5xl font-black text-white tracking-tight">
                                    {formatCurrency(price)}
                                </div>
                                <span className="text-sm text-slate-500">MXN (IVA Incluido)</span>
                            </div>

                            <div className="space-y-2 pt-6 border-t border-slate-700/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Material</span>
                                    <span className="text-white font-bold">{MATERIALS[material].name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Peso</span>
                                    <span className="text-white font-mono">{weight || 0}g</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Tiempo</span>
                                    <span className="text-white font-mono">{hours||0}h {minutes||0}m</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Margen</span>
                                    <span className="text-green-400 font-mono">{profitMargin}%</span>
                                </div>
                            </div>
                            
                            {/* Button Removed */}
                            <div className="mt-auto text-center text-xs text-slate-600">
                                * Este precio es solo una referencia.
                            </div>

                        </div>
                    </div>
                </div>

                <AdBanner slotId="MANUAL_BOTTOM" />

            </main>
        </div>
    );
};

export default PublicManualQuote;
