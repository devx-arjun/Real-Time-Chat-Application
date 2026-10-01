import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import AppLayout from "./components/AppLayout";
import WelcomePage from "./pages/WelcomePage";
import SpacePage from "./pages/SpacePage";
import { useAuth } from "./context/useAuth";
import ChatPage from "./pages/ChatPage";

function App() {
  const { guest, loading } = useAuth();

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950`}
      >
        <div className="text-sm opacity-50">Loading...</div>
      </main>
    );
  }

  return (
    <BrowserRouter>
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
