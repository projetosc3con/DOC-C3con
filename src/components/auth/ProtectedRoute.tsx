import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Rota protegida: só renderiza os filhos se o usuário estiver autenticado.
 * Enquanto a sessão está sendo verificada, exibe um loader.
 * Se não autenticado, redireciona para /login preservando o destino original.
 */
export const ProtectedRoute: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Verificando sessão...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
