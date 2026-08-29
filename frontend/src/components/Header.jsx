import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, User as UserIcon, LogOut } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import ShareButton from "./ShareButton";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const authContext = useUser() || {};
  const {
    user = null,
    login = () => {},
    logout = () => {},
    loading: authLoading = false
  } = authContext;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // メニュー外をクリックした場合に閉じる
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
          {authLoading ? (
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          ) : user ? (
            <div className="user-menu position-relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                aria-expanded={menuOpen}
                aria-label="ユーザーメニュー"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="rounded-circle"
                    style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                  />
                ) : (
                  <UserIcon size={16} />
                )}
                <span className="small d-none d-md-inline">{user.displayName || user.email || user.uid}</span>
              </button>

              {menuOpen && (
                <div className="user-menu-dropdown position-absolute end-0 mt-2 bg-white rounded shadow border py-1">
                  <div className="px-3 py-2 border-bottom small text-muted text-truncate">
                    {user.displayName || user.email || user.uid}
                  </div>
                  <ShareButton
                    label="アプリを共有"
                    className="dropdown-item-btn"
                    getUrl={() => window.location.origin + import.meta.env.BASE_URL}
                  />
                  <button type="button" onClick={handleLogout} className="dropdown-item-btn text-danger">
                    <LogOut size={16} />
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted d-none d-md-inline">ゲスト利用中</span>
              <button onClick={login} className="btn btn-sm btn-primary">ログイン</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
