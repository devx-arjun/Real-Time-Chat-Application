import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import ActivityPage from "./pages/ActivityPage";
import AppLayout from "./components/AppLayout";
import WelcomePage from "./pages/WelcomePage";
import SpacePage from "./pages/SpacePage";
import { useAuth } from "./context/useAuth";
import ChatPage from "./pages/ChatPage";

function App() {
  const { guest, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            guest ? <Navigate to="/home" replace /> : <WelcomePage />
          }
        />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/space/:spaceId" element={<SpacePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/activity" element={<ActivityPage />} />
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