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
  setSession: (user: User | null) => void;
  login: (args: LoginArgs) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true, // Arranca en true para esperar la primera lectura de Supabase

  // 1. La ÚNICA función que altera el estado de carga y el usuario
  setSession: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isCheckingAuth: false, // Se apaga SIEMPRE que Supabase responda (con usuario o con null)
    });
  },

  // 2. El login SOLO gatilla la petición. No altera el estado de Zustand directamente.
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // No hacemos 'set' acá. Supabase disparará automáticamente 'onAuthStateChange'
    // en tu App.tsx, lo que llamará a setSession() y destrabará la pantalla de forma segura.
    return { success: true };
  },

  // 3. El logout SOLO avisa a Supabase.
  logout: async () => {
    await supabase.auth.signOut();
    // Nuevamente, dejamos que el listener global limpie el estado de Zustand
  },
}));