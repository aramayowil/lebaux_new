import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
