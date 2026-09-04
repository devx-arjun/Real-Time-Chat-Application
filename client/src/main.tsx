import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthProvider>,
);
