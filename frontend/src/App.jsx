import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Top from "./components/Top";
import ItemDetail from "./components/ItemDetail";
import StockUpdate from "./components/StockUpdate";
import FamilyInvite from "./components/FamilyInvite";
import InviteAccept from "./components/InviteAccept";
import { UserProvider } from "./contexts/UserProvider";
import { useUser } from "./contexts/UserContext";
import "./App.css";

function AppRoutes() {
  const { userId, loading } = useUser();

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
      <Route path="/" element={userId && userId !== 'test-user' && userId !== 'pending' ? <Navigate to={`/uchi-stock/${userId}`} replace /> : <Top />} />
      <Route path="/uchi-stock/test-user" element={<Home />} />
      <Route path="/uchi-stock/:userId" element={<Home />} />
      <Route path="/item/:itemId" element={<ItemDetail />} />
      <Route path="/item/:itemId/update" element={<StockUpdate />} />
      <Route path="/invite/manage" element={<FamilyInvite />} />
      <Route path="/invite/:token" element={<InviteAccept />} />
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
