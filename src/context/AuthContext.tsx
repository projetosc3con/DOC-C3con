import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recupera a sessão atual ao montar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Escuta mudanças de autenticação (login, logout, refresh de token)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) return { error: authError.message };

        // Verificar se o usuário está ativo na tabela Usuarios
        const { data: userData, error: userError } = await supabase
            .from('Usuarios')
            .select('ativo')
            .eq('uuid', authData.user?.id)
            .single();

        if (userError) {
            console.error('Erro ao verificar status do usuário:', userError);
            // Se houver erro na busca, por segurança deslogamos
            await supabase.auth.signOut();
            return { error: 'Erro ao verificar permissões de acesso.' };
        }

        if (userData && !userData.ativo) {
            await supabase.auth.signOut();
            return { error: 'Esta conta foi desativada. Entre em contato com o administrador.' };
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
