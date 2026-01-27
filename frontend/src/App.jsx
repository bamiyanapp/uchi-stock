import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Top from "./components/Top";
import UserGuide from "./components/UserGuide";
import ItemDetail from "./components/ItemDetail";
import StockUpdate from "./components/StockUpdate";
import FamilyInvite from "./components/FamilyInvite";
import InviteAccept from "./components/InviteAccept";
import DemoHome from "./components/DemoHome";
import NotFound from "./components/NotFound";
import { UserProvider } from "./contexts/UserProvider";
import { useUser } from "./contexts/UserContext";
import "./App.css";

function AppRoutes() {
  const { loading } = useUser();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/guide" element={<UserGuide />} />
      <Route path="/demo" element={<DemoHome />} />
      <Route path="/:userId" element={<Home />} />
      <Route path="/item/:itemId" element={<ItemDetail />} />
      <Route path="/item/:itemId/update" element={<StockUpdate />} />
      <Route path="/invite/manage" element={<FamilyInvite />} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const basename = import.meta.env.MODE === 'test' ? '/' : import.meta.env.BASE_URL;
  return (
    <UserProvider>
      <Router basename={basename}>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
