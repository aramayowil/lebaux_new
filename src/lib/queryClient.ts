import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min de "frescura"
      refetchOnWindowFocus: false, // No recarga al volver a la pestaña (importante en formularios)
      retry: 1, // Reintenta 1 vez si falla (por si es un micro-corte de wifi)
    },
  },
});

export default queryClient;
