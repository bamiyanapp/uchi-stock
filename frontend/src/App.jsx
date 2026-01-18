import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ItemDetail from "./components/ItemDetail";
import StockUpdate from "./components/StockUpdate";
import { UserProvider } from "./contexts/UserContext";
import "./App.css";

function App() {
  const basename = import.meta.env.MODE === 'test' ? '/' : import.meta.env.BASE_URL;
  return (
    <UserProvider>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:itemId" element={<ItemDetail />} />
          <Route path="/item/:itemId/update" element={<StockUpdate />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
