import React from 'react';
import { useUser } from '../contexts/UserContext';
import { User } from 'lucide-react';

const UserSelector = () => {
  const { userId, setUserId } = useUser();

  const users = [
    { id: 'user-1', name: 'ユーザー1' },
    { id: 'user-2', name: 'ユーザー2' },
    { id: 'user-3', name: 'ユーザー3' },
  ];

  return (
    <div className="d-flex align-items-center gap-2 mb-4 justify-content-center bg-light p-3 rounded shadow-sm">
      <User size={20} className="text-primary" />
      <span className="fw-bold small text-muted">テスト用ユーザー切替:</span>
      <div className="btn-group btn-group-sm" role="group">
        {users.map((user) => (
          <button
            key={user.id}
            type="button"
            className={`btn ${userId === user.id ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setUserId(user.id)}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
