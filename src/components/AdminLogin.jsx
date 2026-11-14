import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, UserCheck } from 'lucide-react';
import { DEFAULT_ADMIN_USERS } from '../context/DataContext';

const AdminLogin = ({ onLoginWithEmail, onLoginWithGoogle }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUserKey, setSelectedUserKey] = useState(null);

    // Quick selection of pre-configured admins
    const handleSelectAdmin = (adminUser) => {
        setEmail(adminUser.email);
        setPassword(adminUser.password);
        setSelectedUserKey(adminUser.email);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Por favor ingresa tu correo y contraseña.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await onLoginWithEmail(email, password);
            if (!res.success) {
                setError(res.error || 'Credenciales inválidas.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Ocurrió un error inesperado al iniciar sesión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleClick = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const res = await onLoginWithGoogle();
            if (res && !res.success && res.error) {
                setError(res.error);
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError('Error al conectar con Google.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-brand-orange selection:text-white">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
                {/* Brand Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-orange rounded-t-2xl" />

                {/* Header with Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 mb-3 shadow-inner">
                        <img 
                            src="/logo.png" 
                            alt="Tuna's Craft" 
                            className="w-10 h-10 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-white tracking-tight">
                        Tuna's <span className="text-brand-orange">Admin</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Panel de Administración y Control
                    </p>
                </div>

                {/* Quick Select Admin Users */}
                <div className="mb-6 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <UserCheck size={13} className="text-brand-orange" />
                        <span>Acceso Rápido Autorizado</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {DEFAULT_ADMIN_USERS.map((admin) => {
                            const isSelected = selectedUserKey === admin.email;
                            return (
                                <button
                                    key={admin.email}
                                    type="button"
                                    onClick={() => handleSelectAdmin(admin)}
                                    className={`py-2 px-3 rounded-lg text-left transition-all border text-xs flex flex-col ${
                                        isSelected
                                            ? 'bg-slate-800 border-brand-orange text-white ring-1 ring-brand-orange'
                                            : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <span className="font-bold text-white flex items-center justify-between">
                                        {admin.displayName}
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                                        {admin.email}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2.5 animate-fade-in">
                        <AlertCircle size={16} className="text-red-400 shrink-0" />
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={16} />
                            </div>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="kikemura07@gmail.com"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                                Contraseña
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                tabIndex={-1}
                                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-950/30 text-sm"
                    >
                        {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                            <ShieldCheck size={18} />
                        )}
                        <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
                    </button>
                </form>

                {/* Subtle Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                        <span className="bg-slate-900 px-3 text-slate-400">o continuar con</span>
                    </div>
                </div>

                {/* Google Sign-In Backup */}
                <button 
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isSubmitting}
                    className="w-full bg-slate-800 hover:bg-slate-700/90 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2.5 transition-colors text-xs disabled:opacity-50"
                >
                    <img 
                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                        className="w-4 h-4" 
                        alt="Google" 
                    />
                    <span>Acceder con cuenta de Google</span>
                </button>

                {/* Return to Site */}
                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Volver a la tienda</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
