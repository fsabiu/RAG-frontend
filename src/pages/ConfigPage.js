import React, { useState, useEffect } from 'react';
import ConfigForm from '../components/ConfigForm';
import '../styles/ConfigPage.css';

function ConfigPage() {
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    fetchConfigData();
  }, []);

  const fetchConfigData = async () => {
    try {
      const response = await fetch('http://84.235.246.54:8000/setup_rag_template');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration data');
      }
      const data = await response.json();
      setConfigData(data);
    } catch (error) {
      console.error('Error fetching configuration data:', error);
    }
  };

  return (
    <div className="config-page">
      <h2>Configuration</h2>
      {configData ? (
        <ConfigForm metadata={configData.metadata} template={configData.template} />
      ) : (
        <p>Loading configuration...</p>
      )}
    </div>
  );
}

export default ConfigPage;
