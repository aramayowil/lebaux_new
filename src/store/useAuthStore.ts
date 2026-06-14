import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface LoginArgs {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  setSession: (user: User | null) => void;
  login: (args: LoginArgs) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,

  setSession: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isCheckingAuth: false,
      isLoggingIn: false,
    });
  },

  login: async ({ email, password }) => {
    set({ isLoggingIn: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoggingIn: false });
      return { success: false, error: error.message };
    }

    if (data?.user?.id) {
      supabase
        .schema("seguridad")
        .from("usuarios")
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq("id", data.user.id)
        .then(() => {});
    }

    // isLoggingIn se apaga cuando onAuthStateChange llama a setSession
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },
}));
