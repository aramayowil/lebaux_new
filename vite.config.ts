import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Sube el umbral del aviso a 600 KB (los vendors grandes son esperados
    // y quedan en caché; el aviso real importa para tu propio código)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── 1. React core ────────────────────────────────────────────────
          // Casi nunca cambia → máximo beneficio de caché a largo plazo
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router")
          ) {
            return "vendor-react";
          }

          // ── 2. HeroUI + Framer Motion ────────────────────────────────────
          // Framer Motion es peer-dep de HeroUI, van juntos
          if (
            id.includes("/node_modules/@heroui/") ||
            id.includes("/node_modules/framer-motion")
          ) {
            return "vendor-heroui";
          }

          // ── 3. Supabase ──────────────────────────────────────────────────
          if (id.includes("/node_modules/@supabase/")) {
            return "vendor-supabase";
          }

          // ── 4. Canvas / Konva ────────────────────────────────────────────
          // Solo se carga cuando el usuario entra a ObraEditorPage
          if (
            id.includes("/node_modules/konva") ||
            id.includes("/node_modules/react-konva")
          ) {
            return "vendor-canvas";
          }

          // ── 5. PDF renderer ──────────────────────────────────────────────
          // Muy pesado; se carga solo en PresupuestoPage / GeneratorPdf
          if (id.includes("/node_modules/@react-pdf/")) {
            return "vendor-pdf";
          }

          // ── 6. Charts / ECharts ──────────────────────────────────────────
          if (
            id.includes("/node_modules/echarts") ||
            id.includes("/node_modules/echarts-for-react") ||
            id.includes("/node_modules/recharts") ||
            id.includes("/node_modules/zrender")
          ) {
            return "vendor-charts";
          }

          // ── 7. Math / XLSX / PapaParse ──────────────────────────────────
          // Pesados y de uso puntual
          if (
            id.includes("/node_modules/mathjs") ||
            id.includes("/node_modules/xlsx") ||
            id.includes("/node_modules/papaparse")
          ) {
            return "vendor-data";
          }

          // ── 8. TanStack Query ────────────────────────────────────────────
          if (id.includes("/node_modules/@tanstack/")) {
            return "vendor-query";
          }

          // ── 9. Utilidades pequeñas ───────────────────────────────────────
          if (
            id.includes("/node_modules/zustand") ||
            id.includes("/node_modules/clsx") ||
            id.includes("/node_modules/lucide-react") ||
            id.includes("/node_modules/react-toastify")
          ) {
            return "vendor-utils";
          }

          // ── 10. Resto de node_modules ────────────────────────────────────
          if (id.includes("/node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
});
