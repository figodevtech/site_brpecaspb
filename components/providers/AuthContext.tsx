"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ensureCustomerProfile } from "@/lib/customer-profile";
import type { Customer } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: Customer | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useRef<User | null>(null);
  const generation = useRef(0);
  const router = useRouter();

  const loadProfile = useCallback(async (nextUser: User, version: number) => {
    try {
      const initial = await supabase.from("cliente").select("*").eq("user_id", nextUser.id).maybeSingle();
      if (initial.error) throw initial.error;
      let data = initial.data;
      if (!data) {
        await ensureCustomerProfile(nextUser);
        const result = await supabase.from("cliente").select("*").eq("user_id", nextUser.id).maybeSingle();
        if (result.error) throw result.error;
        data = result.data;
      }
      if (generation.current === version) setProfile(data);
    } catch (error) {
      console.error("Não foi possível carregar o perfil do cliente:", error);
      if (generation.current === version) setProfile(null);
    } finally {
      if (generation.current === version) setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (currentUser.current) await loadProfile(currentUser.current, generation.current);
  }, [loadProfile]);

  useEffect(() => {
    let active = true;
    let initialEventReceived = false;
    const applyUser = (nextUser: User | null) => {
      if (!active) return;
      const changed = currentUser.current?.id !== nextUser?.id;
      currentUser.current = nextUser;
      setUser(nextUser);
      if (!nextUser) {
        generation.current++;
        setProfile(null);
        setIsLoading(false);
      } else if (changed) {
        const version = ++generation.current;
        setProfile(null);
        setIsLoading(true);
        // Defer Supabase queries until the auth callback releases its internal lock.
        setTimeout(() => { if (active) void loadProfile(nextUser, version); }, 0);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initialEventReceived = true;
      applyUser(session?.user ?? null);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (!initialEventReceived) applyUser(data.session?.user ?? null);
    }).catch(() => { if (!initialEventReceived) applyUser(null); });
    return () => { active = false; currentUser.current = null; generation.current++; subscription.unsubscribe(); };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace("/");
    router.refresh();
  }, [router]);

  return <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
