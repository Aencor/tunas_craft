import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Cpu, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Guides = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <SEO 
                title="Guías y Tutoriales de Impresión 3D | Tuna's Craft"
                description="Aprende sobre materiales de impresión 3D (PLA, PETG, ABS, TPU), cómo preparar tus modelos STL/3MF y técnicas profesionales de postprocesado."
                canonical="https://tunascraft.com/guias"
            />

            <div className="max-w-5xl mx-auto space-y-10">
                {/* Back to Home */}
                <div className="flex items-center justify-between">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} /> Volver a Inicio
                    </Link>
                    <Link 
                        to="/catalogo" 
                        className="text-xs font-semibold text-amber-400 hover:underline"
                    >
                        Ver Catálogo de Productos →
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <BookOpen size={14} /> Centro de Conocimiento & Fabricación 3D
                    </div>
                    <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        Guías Profesionales de <span className="text-amber-400">Impresión 3D</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Información técnica, comparativas de filamentos y mejores prácticas para que tus proyectos de fabricación digital alcancen la máxima calidad.
                    </p>
                </div>

                {/* Article 1: Comparativa de Filamentos */}
                <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Materiales & Polímeros</span>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            Guía Completa de Filamentos 3D: PLA vs. PETG vs. ABS vs. TPU
                        </h2>
                    </div>

                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        Elegir el material correcto es el factor determinante entre una pieza decorativa impecable y una pieza funcional duradera. En el taller de <strong>Tuna's Craft</strong> trabajamos con diferentes termoplásticos adaptados a cada necesidad:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                            <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                PLA (Ácido Poliláctico)
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <strong>Mejor para:</strong> Figuras, miniaturas, coleccionables, prototipos visuales y piezas decorativas.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong>Ventajas:</strong> Biodegradable de origen vegetal, excelente resolución de detalle, nula deformación térmica (warping) y gran gama de colores vivos.
                            </p>
                            <p className="text-xs text-slate-500">
                                <strong>Limitación:</strong> No tolera temperaturas superiores a 55°C (no exponer directamente al sol dentro de automóviles).
                            </p>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                            <h3 className="font-bold text-emerald-400 text-base flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                PETG (Polietileno Tereftalato Glicol)
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <strong>Mejor para:</strong> Soportes mecánicos, carcasas electrónicas, macetas y organizadores de uso rudo.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong>Ventajas:</strong> Alta resistencia al impacto, tolerancia química y resistencia térmica hasta 75°C. Excelente adherencia entre capas.
                            </p>
                            <p className="text-xs text-slate-500">
                                <strong>Limitación:</strong> Ligeramente más propenso a hilos (stringing) si no se calibra minuciosamente la retracción.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                            <h3 className="font-bold text-blue-400 text-base flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                                ABS / ASA (Acrilonitrilo Butadieno Estireno)
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <strong>Mejor para:</strong> Refacciones automotrices, carcasas para intemperie y piezas de alta fricción.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong>Ventajas:</strong> Soporta hasta 95°C, permite postprocesado con vapor de acetona para acabado pulido brillante tipo inyección.
                            </p>
                            <p className="text-xs text-slate-500">
                                <strong>Limitación:</strong> Requiere cámara cerrada caliente para evitar contracción.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                            <h3 className="font-bold text-purple-400 text-base flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                                TPU (Poliuretano Termoplástico Flexible)
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                <strong>Mejor para:</strong> Fundas de celular, empaques, llantas para robótica, sellos y amortiguadores.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong>Ventajas:</strong> Flexibilidad tipo goma (dureza típica 95A), absorción de vibraciones y extrema durabilidad frente al desgaste.
                            </p>
                            <p className="text-xs text-slate-500">
                                <strong>Limitación:</strong> Velocidad de impresión reducida y requiere extrusión directa.
                            </p>
                        </div>
                    </div>
                </article>

                {/* Article 2: Preparación de STL */}
                <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Modelado & Slicing</span>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            Cómo preparar y optimizar tus archivos STL o 3MF
                        </h2>
                    </div>

                    <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                        <p>
                            Antes de enviar un archivo a impresión en nuestro cotizador digital, seguir estas 4 recomendaciones técnicas garantizará una pieza de máxima resistencia con el menor tiempo y costo:
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">1. Verifica que la malla sea "Watertight" (Manifold)</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        El modelo no debe tener caras invertidas, vértices duplicados ni orificios en la geometría. Herramientas como Blender, Meshmixer o el reparador automático de Windows 3D Builder corrigen mallas no cerradas en segundos.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">2. Grosor mínimo de pared (Wall Thickness)</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Para boquillas estándar de 0.4 mm, las paredes no deben ser inferiores a 1.2 mm (3 perímetros) si se busca rigidez estructural. En figuras o detalles decorativos, nunca diseñar con espesores menores a 0.8 mm.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">3. Orientación en la cama y reducción de soportes</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Coloca la base más plana sobre el plano de construcción. Recuerda que las líneas de capa resisten más a la compresión que a la tracción transversal: orienta los ejes de carga en paralelo a las líneas del plano XY.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">4. Tolerancias para ensambles</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Para piezas que deben encajar (tapas, roscas, uniones tipo machihembrado), deja una holgura de diseño de 0.2 mm a 0.3 mm entre ambas piezas para compensar la ligera expansión térmica del filamento.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Article 3: Postprocesado */}
                <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                    <div className="border-b border-slate-800 pb-4">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Acabados Artísticos</span>
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                            Técnicas de Postprocesado: De la cama de impresión a pieza final
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                        <p>
                            Una impresión 3D cruda puede transformarse en una pieza de exposición con unos sencillos pasos de acabado:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm pl-2">
                            <li><strong>Retirada de soportes:</strong> Utiliza pinzas de corte al ras trabajando siempre en el sentido de la fibra para no astillar la superficie.</li>
                            <li><strong>Lijado al agua:</strong> Comienza con lija de grano 240, pasa a grano 400 y finaliza con grano 800 humedecido para eliminar líneas de capa sin calentar el plástico.</li>
                            <li><strong>Imprimación (Primer):</strong> Aplica dos capas finas de imprimación en aerosol gris neutro para rellenar micro-porosidades y preparar la superficie para la pintura.</li>
                            <li><strong>Pintura acrílica:</strong> Utiliza pinturas acrílicas al agua aplicadas con pincel fino o aerógrafo para esquemas de color detallados.</li>
                            <li><strong>Barniz protector:</strong> Sella con barniz transparente mate o satinado para proteger la pintura de rayaduras y humedad.</li>
                        </ol>
                    </div>
                </article>

                {/* CTA Section */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4">
                    <h3 className="text-2xl font-display font-bold text-white">
                        ¿Tienes un modelo listo para imprimir?
                    </h3>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        Sube tu archivo a nuestro cotizador o envíanos un mensaje por WhatsApp para recibir atención personalizada en Ciudad de México.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link 
                            to="/cotizador" 
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-amber-500/20 text-sm"
                        >
                            Ir al Cotizador 3D Online
                        </Link>
                        <Link 
                            to="/quote" 
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-700 transition-colors text-sm"
                        >
                            Solicitar Cotización Manual
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guides;
