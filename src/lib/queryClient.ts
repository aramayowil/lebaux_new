import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 min
      refetchOnWindowFocus: false, // Evita recargar cada vez que cambias de pestaña
    },
  },
});

export default queryClient;
