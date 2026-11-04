import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import HeaderUserMenu from "./HeaderUserMenu";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const authContext = useUser() || {};
  const {
    user = null,
    login = async () => null,
    logout = async () => {},
    loading: authLoading = false
  } = authContext;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外をクリックした場合に閉じる
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error('[Header] logout error:', error);
    }
  };

  return (
    <header className="main-header shadow-sm">
      <div className="container py-2 d-flex justify-content-between align-items-center">
        <div className="header-left">
          {user && (
            <Link to="/invite/manage" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
              <Users size={16} />
              <span className="d-none d-sm-inline">家族を招待</span>
            </Link>
          )}
        </div>

        <div className="header-center">
          <Link to="/" className="text-decoration-none">
            <h1 className="h4 m-0 fw-bold text-primary">うちストック</h1>
          </Link>
        </div>

        <div className="header-right">
          <HeaderUserMenu
            user={user}
            authLoading={authLoading}
            login={login}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
