import React, { useState } from 'react';
import '../styles/SourceTabs.css';

const SourceTabs = ({ sources }) => {
  console.log("SourceTabs received sources:", sources);
  const [activeTab, setActiveTab] = useState(0);

  if (!sources || sources.length === 0) {
    console.log("No sources available in SourceTabs");
    return <div className="no-sources">No sources available</div>;
  }

  return (
    <div className="source-tabs">
      <div className="tab-headers">
        {sources.map((source, index) => (
          <button
            key={source.id}
            className={`tab-header ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            Source {index + 1}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <h4>ID: {sources[activeTab].id}</h4>
        <p>Score: {sources[activeTab].score}</p>
        <h5>Metadata:</h5>
        <pre>{JSON.stringify(sources[activeTab].metadata, null, 2)}</pre>
        <h5>Document:</h5>
        <p>{sources[activeTab].document}</p>
      </div>
    </div>
  );
};

export default SourceTabs;
