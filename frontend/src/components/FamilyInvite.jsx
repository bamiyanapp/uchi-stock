import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const FamilyInvite = () => {
  const { userId, getIdToken } = useUser();
  const [invitationToken, setInvitationToken] = useState("");
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://u8ix9o2m78.execute-api.ap-northeast-1.amazonaws.com/dev";

  useEffect(() => {
    fetchFamilies();
  }, [userId]);

  const fetchFamilies = async () => {
    if (!userId || userId === 'pending') return;
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/families`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      }
    } catch (err) {
      console.error("Failed to fetch families", err);
    }
  };

  const createInvitation = async () => {
    setLoading(true);
    setError("");
    setCopySuccess("");
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/invitations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("招待URLの発行に失敗しました");
      }

      const data = await response.json();
      setInvitationToken(data.invitationToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const invitationUrl = invitationToken 
    ? `${window.location.origin}${import.meta.env.BASE_URL}invite/${invitationToken}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationUrl);
    setCopySuccess("コピーしました！");
    setTimeout(() => setCopySuccess(""), 3000);
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="btn btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h3 mb-0">家族を招待・管理</h1>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title mb-3">家族を招待する</h2>
          <p className="card-text text-muted small">
            招待URLを発行して家族に送ってください。相手がURLを開いてログインすると、お互いの在庫が共有されます。
          </p>
          
          {!invitationToken ? (
            <button 
              className="btn btn-primary" 
              onClick={createInvitation}
              disabled={loading}
            >
              {loading ? "発行中..." : "招待URLを発行する"}
            </button>
          ) : (
            <div>
              <div className="input-group mb-2">
                <input 
                  type="text" 
                  className="form-control" 
                  value={invitationUrl} 
                  readOnly 
                />
                <button 
                  className="btn btn-outline-primary" 
                  onClick={copyToClipboard}
                >
                  コピー
                </button>
              </div>
              {copySuccess && <div className="text-success small mb-3">{copySuccess}</div>}
              <button 
                className="btn btn-link btn-sm p-0" 
                onClick={() => setInvitationToken("")}
              >
                新しく発行する
              </button>
            </div>
          )}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h5 card-title mb-3">登録済みの家族</h2>
          {families.length === 0 ? (
            <p className="text-muted small mb-0">まだ家族は登録されていません。</p>
          ) : (
            <ul className="list-group list-group-flush">
              {families.map(member => (
                <li key={member.userId} className="list-group-item d-flex align-items-center px-0">
                  {member.photoURL ? (
                    <img 
                      src={member.photoURL} 
                      alt={member.displayName} 
                      className="rounded-circle me-3"
                      style={{ width: "40px", height: "40px" }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3 text-white"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {member.displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="fw-bold">{member.displayName}</div>
                    <div className="text-muted small">{member.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyInvite;
