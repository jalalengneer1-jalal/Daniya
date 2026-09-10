import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveAdmin = useCallback(async (nextSession) => {
    setSession(nextSession);
    if (!nextSession?.user || !isSupabaseConfigured) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }
    const { data, error } = await supabase.rpc('is_admin');
    const allowed = !error && data === true;
    setIsAdmin(allowed);
    setLoading(false);
    return allowed;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) resolveAdmin(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) resolveAdmin(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [resolveAdmin]);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) return { ok: false };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return { ok: false };
    const allowed = await resolveAdmin(data.session);
    if (!allowed) await supabase.auth.signOut();
    return { ok: allowed };
  }, [resolveAdmin]);

  const signOut = useCallback(async () => {
    setIsAdmin(false);
    setSession(null);
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const value = useMemo(() => ({ session, user: session?.user ?? null, isAdmin, loading, signIn, signOut }),
    [isAdmin, loading, session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
