// 세션과 프로필을 로드해 컨텍스트로 제공
import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/db";

interface AuthValue {
  session: Session | null; profile: Profile | null; loading: boolean; isSuperAdmin: boolean;
  signIn: (username: string, pw: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data as Profile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s) await loadProfile(s.user.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthValue = {
    session, profile, loading, isSuperAdmin: profile?.role === "super_admin",
    signIn: async (username, pw) => {
      const email = `${username.trim()}@simonguard.local`;
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      return { error: error?.message ?? null };
    },
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
