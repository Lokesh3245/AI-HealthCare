import React, { useState } from 'react';

const SymptomChecker = ({ onAnalysisComplete }) => {
    const [answers, setAnswers] = useState(Array(8).fill(0)); // 8 Questions, score 0-5
    const [submitted, setSubmitted] = useState(false);

    const questions = [
        { label: "Cough", min: "I never cough", max: "I cough all the time" },
        { label: "Phlegm", min: "I have no phlegm (mucus)", max: "My chest is completely full of phlegm" },
        { label: "Tightness", min: "My chest does not feel tight at all", max: "My chest feels very tight" },
        { label: "Breathlessness", min: "When I walk up a hill or one flight of stairs I am not breathless", max: "I am very breathless when walking up a hill or one flight of stairs" },
        { label: "Activity", min: "I am not limited doing any activities at home", max: "I am very limited doing activities at home" },
        { label: "Confidence", min: "I am confident leaving my home despite my lung condition", max: "I am not confident leaving my home because of my lung condition" },
        { label: "Sleep", min: "I sleep soundly", max: "I don't sleep soundly because of my lung condition" },
        { label: "Energy", min: "I have lots of energy", max: "I have no energy at all" }
    ];

    const handleChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = parseInt(value);
        setAnswers(newAnswers);
    };

    const calculateScore = () => {
        const total = answers.reduce((a, b) => a + b, 0); // Max 40

        // Clinical Interpretation of CAT Score
        let impact = "Low Impact";
        let color = "#10b981"; // Green
        let riskFactor = 0; // Normalized 0-100 for fusion

        if (total > 30) {
            impact = "Very High Impact";
            color = "#dc2626"; // Red
            riskFactor = 95;
        } else if (total > 20) {
            impact = "High Impact";
            color = "#ea580c"; // Orange-Red
            riskFactor = 75;
        } else if (total >= 10) {
            impact = "Medium Impact";
            color = "#eab308"; // Yellow
            riskFactor = 45;
        } else {
            impact = "Low Impact";
            color = "#10b981";
            riskFactor = 15;
        }

        const result = {
            totalScore: total,
            impactLevel: impact,
            color: color,
            riskFactor: riskFactor,
            details: "Standardized CAT Model"
        };

        setSubmitted(true);
        if (onAnalysisComplete) {
            onAnalysisComplete(result);
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div className="icon-box" style={{ width: '48px', height: '48px', fontSize: '1.25rem', marginBottom: 0 }}>📋</div>
                <div>
                    <h3>Symptom Assessment</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Assess the impact of respiratory symptoms on your wellbeing.</p>
                </div>
            </div>

            {!submitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {questions.map((q, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{i + 1}. {q.label}</span>
                                <span style={{ fontWeight: 'bold' }}>Score: {answers[i]}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="1"
                                value={answers[i]}
                                onChange={(e) => handleChange(i, e.target.value)}
                                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                <span>{q.min} (0)</span>
                                <span>{q.max} (5)</span>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={calculateScore}
                        style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Calculate Symptom Score
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdfa', borderRadius: '12px', border: '2px solid var(--primary)' }}>
                    <h4>Analysis Complete</h4>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>
                        {answers.reduce((a, b) => a + b, 0)}<span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/40</span>
                    </div>
                    <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.25rem' }}>Symptom Score</p>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'white', borderRadius: '100px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: '600', color: '#0f172a' }}>
                        Impact Level: {answers.reduce((a, b) => a + b, 0) > 30 ? "Very High" : answers.reduce((a, b) => a + b, 0) > 20 ? "High" : answers.reduce((a, b) => a + b, 0) >= 10 ? "Medium" : "Low"}
                    </div>
                    <button
                        onClick={() => setSubmitted(false)}
                        style={{ display: 'block', margin: '1.5rem auto 0', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #94a3b8', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}>
                        Redo Assessment
                    </button>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;
