import React, { useState, useEffect } from 'react';

const RiskCalculator = () => {
  const [values, setValues] = useState({
    age: 62,
    fev1: 70,
    hb: 13.5,
    crp: 2
  });

  const [results, setResults] = useState({
    category: 'Healthy',
    oxygenIndex: 0,
    inflammationImpact: 0,
    color: 'var(--primary)',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  useEffect(() => {
    // Logic from the "High-Fidelity" Python script
    const { fev1, hb, crp } = values;

    // 1. Calculate Advanced Metrics
    // Oxygen Transport Index = FEV1 * Hb
    const oxygenIndex = fev1 * hb;

    // Inflammation Impact = CRP / (Hb + 1)
    const inflammationImpact = crp / (hb + 1);

    // 2. Classification Logic (Ground Truth)
    // Healthy: FEV1 >= 70, Hb >= 12.5
    const isAnemic = hb < 12.5;
    const isCOPD = fev1 < 70;

    let category = '';
    let color = '';
    let description = '';

    if (isAnemic && isCOPD) {
      category = 'Comorbid (Double Hypoxia)';
      color = '#be123c'; // Red
      description = 'CRITICAL: Both lung function and oxygen transport are compromised. Highest risk of hospitalization.';
    } else if (isCOPD) {
      category = 'COPD Only';
      color = '#f97316'; // Orange
      description = 'Lung function is reduced, but hemoglobin levels are currently adequate.';
    } else if (isAnemic) {
      category = 'Anemia Only';
      color = '#eab308'; // Yellow
      description = 'Lung function is preserved, but low hemoglobin reduces oxygen delivery.';
    } else {
      category = 'Healthy / Low Risk';
      color = '#10b981'; // Green
      description = 'Clinical parameters are within normal ranges.';
    }

    setResults({
      category,
      oxygenIndex: oxygenIndex.toFixed(0),
      inflammationImpact: inflammationImpact.toFixed(2),
      color,
      description
    });
  }, [values]);

  return (
    <div className="calculator-panel" style={{ borderTop: `4px solid ${results.color}` }}>
      <h3>🧮 Advanced Risk Model</h3>
      <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Multi-class prediction based on Oxygen Transport & Inflammation.
      </p>

      <div className="grid-2" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label>Lung Function (FEV1 %)</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Severe</span>
            <span>Healthy (80+)</span>
          </div>
          <input
            type="range"
            name="fev1"
            value={values.fev1}
            onChange={handleChange}
            min="20" max="120"
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <input
            type="number"
            name="fev1"
            value={values.fev1}
            onChange={handleChange}
            style={{ width: '80px', padding: '0.25rem' }}
          /> %
        </div>

        <div className="form-group">
          <label>Hemoglobin (Hb g/dL)</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Anemic</span>
            <span>Normal (13-17)</span>
          </div>
          <input
            type="range"
            name="hb"
            value={values.hb}
            onChange={handleChange}
            min="5" max="20"
            step="0.1"
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <input
            type="number"
            name="hb"
            value={values.hb}
            onChange={handleChange}
            step="0.1"
            style={{ width: '80px', padding: '0.25rem' }}
          /> g/dL
        </div>

        <div className="form-group">
          <label>Inflammation (CRP)</label>
          <input
            type="number"
            name="crp"
            value={values.crp}
            onChange={handleChange}
            min="0" max="100"
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={values.age}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="result-box" style={{ background: '#fff', border: `1px solid ${results.color}`, borderLeft: `4px solid ${results.color}` }}>
        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.25rem' }}>
          Predicted Diagnosis
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: results.color, marginBottom: '0.5rem' }}>
          {results.category}
        </div>
        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>
          {results.description}
        </p>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <div className="stat-label">Oxygen Transport Index</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{results.oxygenIndex}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FEV1 × Hb (Target: &gt;1000)</div>
            </div>
            <div>
              <div className="stat-label">Inflammation Impact</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{results.inflammationImpact}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CRP ÷ (Hb + 1)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
