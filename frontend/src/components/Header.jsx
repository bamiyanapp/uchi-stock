import React from "react";
import { Link } from "react-router-dom";
import { Users, User as UserIcon } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const authContext = useUser() || {};
  const { 
    user = null, 
    login = () => {}, 
    logout = () => {}, 
    loading: authLoading = false 
  } = authContext;

  const handleLogout = async () => {
    try {
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
            <div className="d-flex align-items-center gap-2">
              <div className="user-info d-flex align-items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="rounded-circle border"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '28px', height: '28px' }}>
                    <UserIcon size={14} className="text-muted" />
                  </div>
                )}
                <span className="small text-muted d-none d-md-inline">{user.displayName || user.email || user.uid}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-secondary">ログアウト</button>
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
