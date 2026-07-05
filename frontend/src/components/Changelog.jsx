import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Changelog.css';

const Changelog = () => {
  const [changelogData, setChangelogData] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // changelog.jsonを読み込む
    fetch('/changelog.json')
      .then(response => response.json())
      .then(data => {
        setChangelogData(data);
        // 最新バージョンをデフォルトで選択
        if (data.length > 0) {
          setSelectedVersion(data[0]);
        }
      })
      .catch(error => {
        console.error('Error loading changelog:', error);
      });
  }, []);

  // 検索機能
  const filteredVersions = changelogData.filter(version =>
    version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVersionClick = (version) => {
    setSelectedVersion(version);
  };

  return (
    <div className="changelog-container">
      <div className="changelog-header">
        <h1>更新履歴</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="バージョン番号または内容で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="changelog-content">
        <div className="version-sidebar">
          <h3>バージョン一覧</h3>
          <div className="version-list">
            {filteredVersions.map((version, index) => (
              <div
                key={index}
                className={`version-item ${
                  selectedVersion?.version === version.version ? 'active' : ''
                }`}
                onClick={() => handleVersionClick(version)}
              >
                <div className="version-header">
                  <span className="version-number">v{version.version}</span>
                  <span className="version-date">{version.date}</span>
                </div>
                <div className="version-preview">
                  {version.body.split('\n').slice(0, 3).join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="version-details">
          {selectedVersion ? (
            <div className="version-content">
              <div className="version-info">
                <h2>v{selectedVersion.version}</h2>
                <span className="version-date">{selectedVersion.date}</span>
              </div>
              <div className="version-body">
                <ReactMarkdown>{selectedVersion.body}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>左側からバージョンを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Changelog;