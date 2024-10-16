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
    console.log('Submitted configuration:', formData);
    // Here you would typically send the formData to your backend
  };

  const renderField = (section, key, options) => {
    const value = formData[section][key];
    if (options.allowed_values && Array.isArray(options.allowed_values)) {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleInputChange(section, key, e.target.value)}
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
        type="text"
        value={value || ''}
        onChange={(e) => handleInputChange(section, key, e.target.value)}
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
          <label htmlFor={`${section}-${depField}`}>{depField}</label>
          {renderField(section, depField, { allowed_values: null })}
        </div>
      ));
    } else if (typeof dependentFields === 'object') {
      return Object.entries(dependentFields).map(([depField, depOptions]) => (
        <div key={depField} className="form-field">
          <label htmlFor={`${section}-${depField}`}>{depField}</label>
          {renderField(section, depField, { allowed_values: depOptions })}
        </div>
      ));
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="config-form">
      {Object.entries(metadata).map(([section, fields]) => (
        <div key={section} className="form-section">
          <h3>{section}</h3>
          {Object.entries(fields).map(([key, options]) => (
            <div key={key} className="form-field">
              <label htmlFor={`${section}-${key}`}>{key}</label>
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
