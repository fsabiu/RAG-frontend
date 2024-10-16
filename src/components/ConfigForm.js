import React, { useState } from 'react';
import '../styles/ConfigForm.css';

function ConfigForm({ metadata, template }) {
  const [formData, setFormData] = useState(template);

  const handleInputChange = (section, key, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [key]: value
      }
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Print the JSON in the console logs
    console.log('Submitted configuration:', JSON.stringify(formData, null, 2));

    // Send the request to the specified endpoint
    fetch('http://84.235.246.54:8000/setup_rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response from server:', data);
        // Handle the response as needed
      })
      .catch(error => {
        console.error('Error sending configuration:', error);
        // Handle the error as needed
      });
  };

  const getInputType = (value) => {
    if (Number.isInteger(value)) return 'number';
    if (typeof value === 'number') return 'number';
    return 'text';
  };

  const renderField = (section, key, options) => {
    const value = formData[section][key];
    const inputType = getInputType(value);

    if (options.allowed_values && Array.isArray(options.allowed_values)) {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
          className="form-input"
        >
          <option value="">Select an option</option>
          {options.allowed_values.map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={inputType}
        value={value || ''}
        onChange={(e) => handleInputChange(section, key, inputType === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="form-input"
        step={inputType === 'number' && !Number.isInteger(value) ? '0.01' : '1'}
      />
    );
  };

  const renderDependentFields = (section, key, options) => {
    const currentValue = formData[section][key];
    const dependentFields = options.dependencies && options.dependencies[currentValue];
    if (!dependentFields) return null;

    if (Array.isArray(dependentFields)) {
      return dependentFields.map(depField => (
        <div key={depField} className="form-field">
          <label htmlFor={`${section}-${depField}`}>{getLabel(section, depField)}</label>
          {renderField(section, depField, { allowed_values: null })}
        </div>
      ));
    } else if (typeof dependentFields === 'object') {
      return Object.entries(dependentFields).map(([depField, depOptions]) => (
        <div key={depField} className="form-field">
          <label htmlFor={`${section}-${depField}`}>{getLabel(section, depField)}</label>
          {renderField(section, depField, { allowed_values: depOptions })}
        </div>
      ));
    }
    return null;
  };

  const getLabel = (section, key) => {
    const label = key ? metadata.labels.EN[`${section}.${key}`] || metadata.labels.EN[key] || key : metadata.labels.EN[section] || section;
    console.log(`Section: ${section}, Key: ${key}, Label: ${label}`);
    return label;
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      {Object.entries(metadata.config).map(([section, fields]) => (
        <div key={section} className="form-section">
          <h3>{getLabel(section)}</h3>
          {Object.entries(fields).map(([key, options]) => (
            <div key={key} className="form-field">
              <label htmlFor={`${section}-${key}`}>{getLabel(section, key)}</label>
              {renderField(section, key, options)}
              {renderDependentFields(section, key, options)}
            </div>
          ))}
        </div>
      ))}
      <button type="submit" className="submit-button">Submit Configuration</button>
    </form>
  );
}

export default ConfigForm;
