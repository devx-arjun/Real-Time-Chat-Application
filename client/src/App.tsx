import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import AppLayout from "./components/AppLayout";
import WelcomePage from "./pages/WelcomePage";
import SpacePage from "./pages/SpacePage";
import { useAuth } from "./context/useAuth";
import ChatPage from "./pages/ChatPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { guest, loading } = useAuth();
  if (loading) {
    return (
      <main className="relative flex h-dvh items-center justify-center overflow-hidden bg-[#f7f8fc] text-slate-950">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/[0.08] blur-3xl" />

          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-300/[0.05] blur-3xl" />
        </div>

        {/* Subtle grid */}
        <div
          className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.35]
          [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]
          [background-size:48px_48px]
          mask-[radial-gradient(ellipse_at_center,black_20%,transparent_75%)]
        "
        />

        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Brand */}
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            LinkUp
          </h1>

          {/* Loading indicator */}
          <div className="mt-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
          </div>

          <p className="mt-3 text-xs text-slate-400">Getting things ready...</p>
        </div>

        {/* Bottom accent */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
      </main>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={guest ? <Navigate to="/home" replace /> : <WelcomePage />}
        />

        <Route element={guest ? <AppLayout /> : <Navigate to="/" replace />}>
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/space/:spaceId" element={<SpacePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={guest ? "/home" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
