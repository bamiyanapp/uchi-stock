import type { RefObject } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import ShareButton from "./ShareButton";
import type { UserContextValue } from "../contexts/UserContext";

interface HeaderUserMenuProps {
  user: UserContextValue["user"];
  authLoading: boolean;
  login: UserContextValue["login"];
  menuOpen: boolean;
  setMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  menuRef: RefObject<HTMLDivElement | null>;
  onLogout: () => void;
}

// Header.tsxから分離（issue #633）。元のauthLoading ? ... : user ? ... : ...
// というネストした三項演算子（sonarjs/no-nested-conditional）を解消すると
// 同時に、Header本体のcomplexityを標準スタックの上限（15）以下に抑える
export default function HeaderUserMenu({
  user,
  authLoading,
  login,
  menuOpen,
  setMenuOpen,
  menuRef,
  onLogout,
}: HeaderUserMenuProps) {
  if (authLoading) {
    return <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>;
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center gap-2">
        <span className="small text-muted d-none d-md-inline">ゲスト利用中</span>
        <button onClick={login} className="btn btn-sm btn-primary">ログイン</button>
      </div>
    );
  }

  return (
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
          <button type="button" onClick={onLogout} className="dropdown-item-btn text-danger">
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
