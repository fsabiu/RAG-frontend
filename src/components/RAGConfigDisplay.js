import React, { useState, useEffect } from 'react';
import '../styles/RAGConfigDisplay.css';
import { fetchData } from '../utils/api';

function RAGConfigDisplay() {
  const [configData, setConfigData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await fetchData('http://84.235.246.54:8000/rag_config');
        console.log('Fetched RAG Config:', data); // Detailed logging
        setConfigData(data);
      } catch (error) {
        console.error('Error fetching RAG config:', error);
        setError('Failed to fetch RAG configuration.');
      }
    };

    const fetchMetadata = async () => {
      try {
        const data = await fetchData('http://84.235.246.54:8000/setup_rag_template');
        console.log('Fetched RAG Template:', data); // Detailed logging
        // Ensure metadata is correctly extracted
        setMetadata(data.metadata);
      } catch (error) {
        console.error('Error fetching RAG template:', error);
        setError('Failed to fetch RAG metadata.');
      }
    };

    fetchConfig();
    fetchMetadata();
  }, []);

  const getLabel = (section, key) => {
    if (metadata && metadata.labels && metadata.labels.EN) {
      // Try to get the label for section.key, then for the section, then fallback to key
      return (
        metadata.labels.EN[`${section}.${key}`] ||
        metadata.labels.EN[section] ||
        metadata.labels.EN[key] ||
        key
      );
    }
    return key;
  };

  if (error) {
    return <div className="rag-config-error">{error}</div>;
  }

  if (!configData || !metadata) {
    return <div className="rag-config-loading">Loading RAG Configuration...</div>;
  }

  return (
    <div className="rag-config-display">
      <h2>RAG Configuration</h2>
      {Object.entries(configData).map(([section, fields]) => (
        <div key={section} className="config-section">
          <h3>{getLabel(section)}</h3>
          {fields && typeof fields === 'object' && Object.entries(fields).map(([key, value]) => (
            <div key={key} className="config-field">
              <span className="field-label">{getLabel(section, key)}:</span>
              <span className="field-value">
                {value !== null && value !== undefined
                  ? typeof value === 'object'
                    ? JSON.stringify(value)
                    : value.toString()
                  : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default RAGConfigDisplay;
