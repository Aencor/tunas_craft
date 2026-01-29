import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Zap, Hammer, Printer, Calculator, RefreshCw, Package, Save, Trash2, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';

const PriceCalculator = () => {
    const { addQuote, quotes, deleteQuote } = useData();

    // Default Presets
    const presets = {
        PLA: { name: 'PLA Genérico', price: 400, density: 1.24 },
        PETG: { name: 'PETG Genérico', price: 500, density: 1.27 },
        TPU: { name: 'TPU Flexible', price: 650, density: 1.21 },
        ABS: { name: 'ABS Genérico', price: 450, density: 1.04 },
    };

    // State
    const [partName, setPartName] = useState('');
    const [filamentType, setFilamentType] = useState('PLA');
    const [filamentPrice, setFilamentPrice] = useState(400); // Price per Kg
    const [weight, setWeight] = useState(0); // Grams
    
    const [timeHours, setTimeHours] = useState(0);
    const [timeMinutes, setTimeMinutes] = useState(0);
    
    const [powerRating, setPowerRating] = useState(150); // Watts (Average printer)
    const [kwhCost, setKwhCost] = useState(2.5); // Cost per kWh
    
    const [failureRate, setFailureRate] = useState(10); // %
    const [laborTime, setLaborTime] = useState(10); // Minutes
    const [laborRate, setLaborRate] = useState(50); // Hourly rate
    
    const [printerRate, setPrinterRate] = useState(5); // Depreciation/Maintenance per hour
    
    const [profitMargin, setProfitMargin] = useState(200); // % (Markup)
    const [taxRate, setTaxRate] = useState(16); // % (IVA)

    // Results
    const [costs, setCosts] = useState({
        material: 0,
        electricity: 0,
        labor: 0,
        machine: 0,
        failureMockup: 0,
        subtotal: 0,
        total: 0,
        priceNoTax: 0,
        suggested: 0
    });

    // Handle Preset Change
    const handlePresetChange = (type) => {
        setFilamentType(type);
        if (presets[type]) {
            setFilamentPrice(presets[type].price);
        }
    };

    // Calculate Costs
    useEffect(() => {
        // Material Cost
        const materialCost = (weight / 1000) * filamentPrice;

        // Time
        const totalHours = parseFloat(timeHours) + (parseFloat(timeMinutes) / 60);

        // Electricity Cost
        // Watts * Hours / 1000 = kWh * Cost
        const electricityCost = (powerRating * totalHours / 1000) * kwhCost;

        // Labor Cost
        const laborCost = (laborTime / 60) * laborRate;

        // Machine Cost (Depreciation)
        const machineCost = totalHours * printerRate;

        // Subtotal (Production Cost)
        let subtotal = materialCost + electricityCost + laborCost + machineCost;

        // Failure Rate (Add % to subtotal)
        const failureCost = subtotal * (failureRate / 100);
        subtotal += failureCost;

        // Profit
        const profit = subtotal * (profitMargin / 100);

        // Taxes (On top of Price + Profit)
        const preTaxTotal = subtotal + profit;
        const tax = preTaxTotal * (taxRate / 100);

        const finalPrice = preTaxTotal + tax;

        setCosts({
            material: materialCost,
            electricity: electricityCost,
            labor: laborCost,
            machine: machineCost,
            failureMockup: failureCost,
            subtotal: subtotal,
            total: subtotal, // Production Cost
            priceNoTax: preTaxTotal,
            suggested: finalPrice
        });

    }, [filamentPrice, weight, timeHours, timeMinutes, powerRating, kwhCost, failureRate, laborTime, laborRate, printerRate, profitMargin, taxRate]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
    };

    const handleSaveQuote = async () => {
        if (!partName.trim()) return alert('Ingresa un nombre para la pieza');
        
        try {
            await addQuote({
                name: partName,
                params: {
                    filamentType, filamentPrice, weight, timeHours, timeMinutes, 
                    printerRate, failureRate, powerRating, kwhCost, laborTime, 
                    laborRate, profitMargin, taxRate
                },
                costs // Save the calculated result too
            });
            alert('Cotización guardada');
            setPartName('');
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        }
    };

    const loadQuote = (quote) => {
        setPartName(quote.name);
        if(quote.params) {
            const p = quote.params;
            setFilamentType(p.filamentType || 'PLA');
            setFilamentPrice(p.filamentPrice || 400);
            setWeight(p.weight || 0);
            setTimeHours(p.timeHours || 0);
            setTimeMinutes(p.timeMinutes || 0);
            setPrinterRate(p.printerRate || 10);
            setFailureRate(p.failureRate || 10);
            setPowerRating(p.powerRating || 150);
            setKwhCost(p.kwhCost || 2.5);
            setLaborTime(p.laborTime || 15);
            setLaborRate(p.laborRate || 50);
            setProfitMargin(p.profitMargin || 100);
            setTaxRate(p.taxRate || 16);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-6">
                    
                {/* 1. Material */}
                <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
                    <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-brand-blue">
                        <Package size={20} /> Material
                    </h3>
                    
                    {/* Part Name Input (Merged) */}
                    <div className="mb-4">
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Nombre de la Pieza</label>
                        <input 
                            type="text" 
                            value={partName} 
                            onChange={e => setPartName(e.target.value)}
                            placeholder="Ej. Soporte Monitor VESA"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-brand-blue outline-none font-bold" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Preset</label>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                {Object.keys(presets).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handlePresetChange(type)}
                                        className={`flex-1 py-1 text-xs font-bold rounded ${filamentType === type ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Precio Rollo (1kg)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input 
                                    type="number" 
                                    value={filamentPrice} 
                                    onChange={e => setFilamentPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-7 pr-4 py-2 text-sm focus:border-brand-blue outline-none" 
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Peso del Modelo (g)</label>
                             <input 
                                type="number" 
                                value={weight} 
                                onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                                placeholder="Ej. 120g"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none font-bold text-white text-lg" 
                            />
                        </div>
                    </div>
                </div>

                    {/* 2. Time & Machine */}
                    <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
                        <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-purple-400">
                            <Clock size={20} /> Tiempo y Máquina
                        </h3>
                        {/* Mobile: 1 col, Desktop: 2 cols */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Horas</label>
                                <input 
                                    type="number" 
                                    value={timeHours} 
                                    onChange={e => setTimeHours(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Minutos</label>
                                <input 
                                    type="number" 
                                    value={timeMinutes} 
                                    onChange={e => setTimeMinutes(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Mantenimiento $/h</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input 
                                        type="number" 
                                        value={printerRate} 
                                        onChange={e => setPrinterRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-7 pr-4 py-2 text-sm focus:border-purple-500 outline-none" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Fallo Esperado %</label>
                                <input 
                                    type="number" 
                                    value={failureRate} 
                                    onChange={e => setFailureRate(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none" 
                                    />
                            </div>
                        </div>
                    </div>

                    {/* 3. Labor & Energy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-yellow-400">
                                <Zap size={18} /> Energía
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Consumo (Watts)</label>
                                    <input 
                                        type="number" 
                                        value={powerRating} 
                                        onChange={e => setPowerRating(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-yellow-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Costo kWh</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input 
                                            type="number" 
                                            value={kwhCost} 
                                            onChange={e => setKwhCost(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-7 pr-4 py-2 text-sm focus:border-yellow-500 outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-brand-orange">
                                <Hammer size={18} /> Mano de Obra
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Tiempo Post (min)</label>
                                    <input 
                                        type="number" 
                                        value={laborTime} 
                                        onChange={e => setLaborTime(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-brand-orange outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Tarifa $/hora</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input 
                                            type="number" 
                                            value={laborRate} 
                                            onChange={e => setLaborRate(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-7 pr-4 py-2 text-sm focus:border-brand-orange outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <div className="bg-slate-800 p-4 md:p-8 rounded-2xl border border-slate-700 lg:sticky lg:top-6">
                        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                            <Calculator size={32} className="text-brand-orange" /> Resultado
                        </h2>

                        <div className="space-y-2 mb-8">
                            <Row label="Costo Material" value={costs.material} icon={<Package size={14}/>} />
                            <Row label="Costo Energía" value={costs.electricity} icon={<Zap size={14}/>} />
                            <Row label="Costo Máquina" value={costs.machine} icon={<Printer size={14}/>} />
                            <Row label="Mano de Obra" value={costs.labor} icon={<Hammer size={14}/>} />
                            <Row label={`Margen de Fallo (${failureRate}%)`} value={costs.failureMockup} color="text-red-400" />
                            
                            <div className="border-t border-slate-700 my-4 pt-4 flex justify-between items-center bg-slate-700/30 p-3 rounded-lg">
                                <span className="text-slate-300 font-bold">Costo Producción</span>
                                <span className="text-xl font-bold text-white">{formatCurrency(costs.total)}</span>
                            </div>
                        </div>

                        {/* Margins */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-slate-400 text-xs font-bold uppercase">Margen Ganancia %</label>
                                    <span className="text-green-400 font-bold">{profitMargin}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="300" 
                                    value={profitMargin} 
                                    onChange={e => setProfitMargin(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-slate-400 text-xs font-bold uppercase">Impuestos (IVA) %</label>
                                    <span className="text-slate-300 font-bold">{taxRate}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="30" 
                                    value={taxRate} 
                                    onChange={e => setTaxRate(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-500" 
                                />
                            </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Precio sin IVA</p>
                                    <div className="text-3xl font-bold text-white tracking-tight">
                                        {formatCurrency(costs.priceNoTax)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Precio Final (con IVA)</p>
                                    <div className="text-5xl font-black text-brand-orange tracking-tight">
                                        {formatCurrency(costs.suggested)}
                                    </div>
                                </div>
                                
                                <p className="text-green-400 text-sm font-bold pt-2 border-t border-slate-700/50">
                                    Ganancia Neta: {formatCurrency(costs.priceNoTax - costs.total)}
                                </p>
                            </div>
                            <button 
                                onClick={handleSaveQuote}
                                className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <Save size={20} /> Guardar Cotización
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Quotes Table (Full Width) */}
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <div className="p-4 md:p-6 border-b border-slate-700 flex items-center gap-3">
                     <Save size={24} className="text-brand-orange"/>
                     <h3 className="text-xl font-bold">Piezas Cotizadas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-700/50 text-slate-300">
                             <tr>
                                <th className="p-4">Pieza</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Peso</th>
                                <th className="p-4">Tiempo</th>
                                <th className="p-4">Costo Prod.</th>
                                <th className="p-4">Sin IVA</th>
                                <th className="p-4">Total (IVA)</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {quotes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(quote => (
                                <tr key={quote.id} className="hover:bg-slate-700/30">
                                    <td className="p-4 font-bold text-white">{quote.name}</td>
                                    <td className="p-4 text-sm text-slate-400">{new Date(quote.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm text-slate-300">{quote.params?.weight}g</td>
                                    <td className="p-4 text-sm text-slate-300">{quote.params?.timeHours}h {quote.params?.timeMinutes}m</td>
                                    <td className="p-4 font-mono text-slate-400">{formatCurrency(quote.costs?.total || 0)}</td>
                                    <td className="p-4 font-mono text-slate-300">
                                        {formatCurrency(quote.costs?.priceNoTax || (quote.costs?.suggested / (1 + ((quote.params?.taxRate || 16)/100))) || 0)}
                                    </td>
                                    <td className="p-4 font-mono font-bold text-brand-orange">{formatCurrency(quote.costs?.suggested || 0)}</td>
                                    <td className="p-4 text-center">
                                         <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => loadQuote(quote)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400"
                                                title="Cargar Datos"
                                            >
                                                <ArrowRight size={16} />
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Borrar cotización?')) deleteQuote(quote.id) }} 
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-red-400"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quotes.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">
                                        No hay cotizaciones guardadas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Row = ({ label, value, icon, color = 'text-slate-400' }) => (
    <div className="flex justify-between items-center text-sm">
        <span className={`flex items-center gap-2 ${color}`}>
            {icon} {label}
        </span>
        <span className="font-mono text-slate-200">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}
        </span>
    </div>
);

export default PriceCalculator;


