import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';

const Terms = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <SEO 
                title="Términos y Condiciones de Servicio | Tuna's Craft"
                description="Términos y condiciones de compra, cotización, fabricación e impresión 3D en Tuna's Craft."
                canonical="https://tunascraft.com/terminos"
            />

            <div className="max-w-4xl mx-auto">
                {/* Back to Home */}
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
                            <Scale size={14} /> Términos Legales
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Términos y Condiciones de Uso
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">
                            Vigente desde el 14 de Noviembre de 2026 · Tuna's Craft México
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">1. Objeto y Alcance</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Los presentes Términos y Condiciones regulan el uso del sitio web <a href="https://tunascraft.com" className="text-amber-400 underline">https://tunascraft.com</a> y los servicios de fabricación aditiva (impresión 3D FDM/Resina), modelado digital y venta de piezas personalizadas ofrecidos por <strong>Tuna's Craft</strong>.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">2. Cotizaciones y Precios</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Los cálculos proporcionados por nuestros cotizadores en línea (escáner STL/3MF y calculadora de filamento) constituyen estimados preliminares basados en las geometrías y parámetros declarados. El precio final y tiempo de entrega se confirman previo a la fabricación una vez revisada la viabilidad técnica del modelo. Todos los precios están expresados en pesos mexicanos (MXN).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">3. Propiedad Intelectual de los Modelos 3D</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            El cliente declara y garantiza que posee los derechos, licencias o autorizaciones correspondientes para la impresión de los archivos digitales 3D suministrados. Tuna's Craft no asume responsabilidad alguna por infracciones de derechos de autor, patentes o marcas derivadas de archivos proporcionados por terceros. Los archivos recibidos son utilizados exclusivamente para la ejecución del pedido solicitado.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">4. Proceso de Fabricación y Tolerancias</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            La impresión 3D es una tecnología aditiva que construye objetos capa por capa. Las piezas pueden presentar líneas de capa inherentes a la tecnología FDM. En Tuna's Craft calibramos rigurosamente nuestros equipos para ofrecer la máxima precisión dimensional (tolerancias típicas de ±0.2 mm a ±0.4 mm según la geometría y material seleccionado).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">5. Pagos y Cancelaciones</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Aceptamos pagos a través de transferencia bancaria SPEI, Mercado Pago, PayPal y efectivo para entregas presenciales acordadas en CDMX. Al tratarse de productos fabricados bajo pedido y a la medida, una vez iniciada la impresión no es posible cancelar el pedido ni realizar devoluciones salvo defecto técnico atribuible a la fabricación.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default Terms;
