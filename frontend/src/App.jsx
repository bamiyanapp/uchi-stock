import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ItemDetail from "./components/ItemDetail";
import { UserProvider } from "./contexts/UserContext";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:itemId" element={<ItemDetail />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
