import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Cookie, FileText, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <SEO 
                title="Política de Privacidad | Tuna's Craft"
                description="Conoce nuestra política de privacidad, el tratamiento de datos personales y el uso de cookies y publicidad de Google en Tuna's Craft."
                canonical="https://tunascraft.com/privacidad"
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

                {/* Main Card */}
                <article className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                    {/* Header */}
                    <div className="border-b border-slate-800 pb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <ShieldCheck size={14} /> Legal & Privacidad
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Política de Privacidad
                        </h1>
                        <p className="text-xs text-slate-400 mt-2">
                            Última actualización: 14 de Noviembre de 2026 · En cumplimiento con la legislación de protección de datos (LFPDPPP) y las políticas del programa Google AdSense.
                        </p>
                    </div>

                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock size={18} className="text-amber-400" />
                            1. Identidad y Responsable del Tratamiento
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            <strong>Tuna's Craft</strong> (en adelante, "el Sitio Web" o "nosotros"), con domicilio y centro de operaciones en la Ciudad de México (CDMX), México, y sitio web oficial en <a href="https://tunascraft.com" className="text-amber-400 underline">https://tunascraft.com</a>, es el responsable del tratamiento y protección de sus datos personales.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye size={18} className="text-amber-400" />
                            2. Información que Recopilamos
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Recopilamos la información indispensable para atender cotizaciones, procesar pedidos y brindar atención personalizada a través de nuestros canales:
                        </p>
                        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1.5 pl-2">
                            <li><strong>Datos de contacto:</strong> Nombre completo, correo electrónico, número de teléfono o WhatsApp.</li>
                            <li><strong>Datos de entrega:</strong> Dirección de envío para entregas en CDMX o mensajería nacional.</li>
                            <li><strong>Archivos de impresión 3D:</strong> Archivos digitales (STL, OBJ, 3MF) subidos a nuestros cotizadores para el cálculo de peso, volumen y tiempo de fabricación. Estos archivos se tratan con estricta confidencialidad y son propiedad de sus respectivos autores.</li>
                            <li><strong>Datos de navegación técnicos:</strong> Dirección IP, tipo de navegador, sistema operativo y páginas visitadas con fines analíticos y de seguridad.</li>
                        </ul>
                    </section>

                    {/* Section 3 - Google AdSense Mandatory Clause */}
                    <section className="space-y-4 bg-slate-950/70 p-6 rounded-2xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Cookie size={18} className="text-amber-400" />
                            3. Cookies, Publicidad de Terceros y Google AdSense
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            En este sitio web utilizamos cookies propias y de terceros, incluyendo los servicios publicitarios de <strong>Google AdSense</strong> (identificador de editor: <code>ca-pub-3965448004898187</code>).
                        </p>
                        <div className="space-y-3 text-slate-300 text-sm leading-relaxed border-l-2 border-amber-500 pl-4">
                            <p>
                                <strong>Proveedores de terceros y cookies de publicidad:</strong> Proveedores terceros, incluido Google, utilizan cookies para publicar anuncios basados en las visitas anteriores de un usuario a este sitio web o a otros sitios de Internet.
                            </p>
                            <p>
                                <strong>Cookies de publicidad de Google:</strong> El uso de cookies publicitarias por parte de Google le permite a él y a sus socios publicar anuncios basados en las visitas realizadas por los usuarios a sus sitios o a otros sitios de Internet.
                            </p>
                            <p>
                                <strong>Inhabilitación de publicidad personalizada:</strong> Los usuarios pueden inhabilitar la publicidad personalizada consultando la sección de <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">Configuración de Anuncios de Google</a>. De forma alternativa, los usuarios pueden optar por no recibir cookies de proveedores externos para publicidad basada en intereses visitando el portal <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">www.aboutads.info</a> o la iniciativa de autorregulación <a href="https://youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">Your Online Choices</a>.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-amber-400" />
                            4. Finalidades del Tratamiento de Datos
                        </h2>
                        <ul className="list-disc list-inside text-slate-300 text-sm space-y-1.5 pl-2">
                            <li>Elaborar cotizaciones y presupuestos de impresión 3D y modelado.</li>
                            <li>Coordinar entregas presenciales en Ciudad de México o envíos por paquetería nacional.</li>
                            <li>Mantener la comunicación sobre el estatus de fabricación del pedido.</li>
                            <li>Garantizar el correcto funcionamiento técnico y la seguridad del sitio web.</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Mail size={18} className="text-amber-400" />
                            5. Derechos ARCO y Contacto
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Para ejercer cualquiera de los derechos ARCO o para cualquier duda respecto a esta política de privacidad, puede contactarnos a través de:
                        </p>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                            <p><strong>Correo electrónico:</strong> kikemura07@gmail.com</p>
                            <p><strong>WhatsApp oficial:</strong> +52 55 4474 4531</p>
                            <p><strong>Ubicación:</strong> Ciudad de México (CDMX), México</p>
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
