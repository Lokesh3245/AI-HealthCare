import React, { useState } from 'react';

const ManualVitals = ({ onAnalysisComplete }) => {
    const [vitals, setVitals] = useState({
        spo2: '',
        heartRate: '',
        respRate: ''
    });

    const [feedback, setFeedback] = useState(null);

    const handleChange = (e) => {
        setVitals({ ...vitals, [e.target.name]: e.target.value });
    };

    const analyze = () => {
        const spo2 = parseFloat(vitals.spo2);
        const hr = parseFloat(vitals.heartRate);
        const rr = parseFloat(vitals.respRate);

        let report = {
            status: 'Normal', // Normal, Warning, Critical
            color: '#10b981', // Green
            details: []
        };

        // 1. SpO2 Analysis (COPD Specific)
        if (!isNaN(spo2)) {
            if (spo2 <= 84) report.details.push({ label: 'SpO2', msg: 'Emergency: Below 84% - Risk of organ damage. Seek help immediately.', type: 'critical' });
            else if (spo2 <= 87) report.details.push({ label: 'SpO2', msg: 'Warning: 85-87% - Possible flare-up. Monitor closely.', type: 'warning' });
            else if (spo2 >= 88 && spo2 <= 92) report.details.push({ label: 'SpO2', msg: 'Stable: 88-92% is the target range for many COPD patients.', type: 'normal' });
            else if (spo2 > 92) report.details.push({ label: 'SpO2', msg: 'Oxygen levels are good (>92%).', type: 'normal' });
            else report.details.push({ label: 'SpO2', msg: 'Check reading.', type: 'warning' });
        }

        // 2. Heart Rate Analysis
        if (!isNaN(hr)) {
            if (hr > 110) report.details.push({ label: 'Heart Rate', msg: 'Emergency: Over 110 bpm at rest.', type: 'critical' });
            else if (hr >= 100) report.details.push({ label: 'Heart Rate', msg: 'Warning: 100-110 bpm. Tachycardia can be a compensatory mechanism for Anemia.', type: 'warning' });
            else if (hr >= 60) report.details.push({ label: 'Heart Rate', msg: 'Normal: 60-100 bpm.', type: 'normal' });
            else report.details.push({ label: 'Heart Rate', msg: 'Low: Below 60 bpm.', type: 'warning' });
        }

        // 3. Respiratory Rate Analysis
        if (!isNaN(rr)) {
            if (rr > 25) report.details.push({ label: 'Resp Rate', msg: 'Emergency: Over 25 breaths/min at rest.', type: 'critical' });
            else if (rr >= 21) report.details.push({ label: 'Resp Rate', msg: 'Warning: 21-24 breaths/min. Monitor breathing.', type: 'warning' });
            else if (rr >= 12 && rr <= 20) report.details.push({ label: 'Resp Rate', msg: 'Normal: 12-20 breaths/min.', type: 'normal' });
            else report.details.push({ label: 'Resp Rate', msg: 'Abnormal: Check count.', type: 'warning' });
        }



        // Determine Overall Status
        const hasCritical = report.details.some(d => d.type === 'critical');
        const hasWarning = report.details.some(d => d.type === 'warning');

        if (hasCritical) {
            report.status = 'RISK / EMERGENCY (Seek Help)';
            report.color = '#dc2626'; // Red
        } else if (hasWarning) {
            report.status = 'WARNING (Monitor Closely)';
            report.color = '#f97316'; // Orange
        } else {
            report.status = 'NORMAL / STABLE RANGE';
            report.color = '#10b981'; // Green
        }

        setFeedback(report);

        // Pass data back to parent for report generation
        if (onAnalysisComplete) {
            onAnalysisComplete({
                vitals: { ...vitals },
                report: report
            });
        }
    };

    return (
        <div className="card" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="icon-box" style={{ width: '48px', height: '48px', fontSize: '1.25rem', marginBottom: 0 }}>📝</div>
                <div>
                    <div>
                        <h3>Manual Clinical Vitals Check</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Screen for COPD (Hypoxia) and Anemia (Referenced by Heart Rate).</p>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ gap: '2rem' }}>
                {/* Input Form */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                        <label>SpO2 (%)</label>
                        <input type="number" name="spo2" placeholder="e.g. 90" value={vitals.spo2} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label>Heart Rate (bpm)</label>
                        <input type="number" name="heartRate" placeholder="e.g. 72" value={vitals.heartRate} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label>Resp Rate (bpm)</label>
                        <input type="number" name="respRate" placeholder="e.g. 16" value={vitals.respRate} onChange={handleChange} style={{ width: '100%' }} />
                    </div>

                    <button
                        onClick={analyze}
                        style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Run Manual Analysis
                    </button>
                </div>

                {/* Analysis Result */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: feedback ? `2px solid ${feedback.color}` : '2px dashed #e2e8f0', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {!feedback ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                            <p>Enter data and click "Run Manual Analysis" to see COPD-specific report.</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: feedback.color, textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                {feedback.status}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {feedback.details.map((detail, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: '#334155', minWidth: '100px' }}>{detail.label}</span>
                                        <span style={{ fontSize: '0.9rem', color: detail.type === 'critical' ? '#dc2626' : detail.type === 'warning' ? '#d97706' : '#059669', textAlign: 'right', flex: 1 }}>
                                            {detail.msg}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualVitals;
