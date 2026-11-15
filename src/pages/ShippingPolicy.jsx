import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import SEO from '../components/SEO';

const ShippingPolicy = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <SEO 
                title="Política de Envíos, Entregas y Garantías | Tuna's Craft"
                description="Conoce las modalidades de entrega personal en CDMX (Metro Chabacano), envíos nacionales y garantías de impresión 3D en Tuna's Craft."
                canonical="https://tunascraft.com/envios-devoluciones"
            />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} /> Volver a Inicio
                    </Link>
                </div>

                <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                    {/* Header */}
                    <div className="border-b border-slate-800 pb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <Truck size={14} /> Logística y Calidad
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Política de Envíos, Entregas y Garantías
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">
                            Entregas en Ciudad de México y envíos a toda la República Mexicana
                        </p>
                    </div>

                    {/* Section 1: Entregas Personales en CDMX */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MapPin size={18} className="text-amber-400" />
                            1. Entregas Personales en Ciudad de México (Sin Costo de Envío)
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Para clientes en la CDMX y zona conurbada, ofrecemos entrega presencial gratuita en nuestro punto de encuentro oficial:
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                            <p className="font-bold text-white">📍 Estación Metro Chabacano (Líneas 2, 8 y 9)</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1.5">
                                <Clock size={13} className="text-amber-400" /> Horario fijo: Todos los sábados de 11:00 am a 3:00 pm
                            </p>
                            <p className="text-slate-400 text-xs">
                                Opciones adicionales entre semana disponibles previa coordinación en estaciones intermedias céntricas.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Envíos Nacionales */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Truck size={18} className="text-amber-400" />
                            2. Envíos Nacionales a todo México
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Realizamos envíos a los 32 estados de la República Mexicana mediante paqueterías reconocidas (DHL, FedEx, Estafeta y Correos de México):
                        </p>
                        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1.5 pl-2">
                            <li><strong>Tiempos de tránsito:</strong> De 2 a 5 días hábiles a ciudades principales; de 4 a 7 días hábiles a zonas extendidas.</li>
                            <li><strong>Rastreo en tiempo real:</strong> Cada paquete incluye su número de guía oficial para seguimiento directo desde la plataforma de la paquetería o nuestro rastreador interno.</li>
                            <li><strong>Empaque de alta protección:</strong> Embalaje con plástico burbuja, esquineros y material amortiguador para garantizar que las piezas 3D no sufran deformaciones ni roturas durante el transporte.</li>
                        </ul>
                    </section>

                    {/* Section 3: Garantía de Fabricación */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck size={18} className="text-amber-400" />
                            3. Garantía de Calidad y Reimpresión
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Si una pieza presenta un defecto atribuible al proceso de fabricación (delaminación de capas grave, desprendimiento de soportes defectuoso o rotura durante el envío certificado), el cliente deberá notificarnos dentro de las primeras 48 horas posteriores a la recepción con fotografías de la pieza. Evaluaremos el caso de inmediato y, de proceder, realizaremos la reimpresión sin costo adicional.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default ShippingPolicy;
