
export const generateReportHTML = (data) => {
    // Destructure data with fallbacks to prevent errors if some data is missing
    const {
        reportId = 'N/A',
        date = new Date().toLocaleString(),
        doctorName = 'Unknown Doctor',
        results = {}
    } = data;

    // Ensure results has necessary sub-objects
    const cough = results.cough || {};
    const eye = results.eye || {};
    const vitals = results.manualVitals || {};
    const vitalsReport = results.manualVitalsReport || null;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>BreathCare AI - Diagnostic Report</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                .title { font-size: 32px; font-weight: 800; margin: 10px 0; color: #0f172a; }
                .meta { color: #64748b; font-size: 14px; }
                
                .section { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
                .section-title { font-size: 18px; font-weight: bold; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                
                .result-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .label { font-weight: 600; color: #475569; }
                .value { font-weight: bold; }
                .high-risk { color: #dc2626; }
                .low-risk { color: #16a34a; }
                
                .image-box { text-align: center; margin-top: 15px; }
                img { max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #cbd5e1; }
                
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">BreathCare AI</div>
                <div class="title">Preliminary Diagnostic Report</div>
                <div class="meta">Generated: ${date} | Report ID: ${reportId}</div>
                <div class="meta" style="margin-top:5px;">Attending Physician: ${doctorName}</div>
            </div>

            <div class="section">
                <div class="section-title">1. Respiratory Analysis (Cough Audio)</div>
                ${cough.label ? `
                    <div class="result-row">
                        <span class="label">Pattern Classification:</span>
                        <span class="value">${cough.label}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">Detected Symptom:</span>
                        <span class="value">${cough.symptom || 'N/A'}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">Risk Score:</span>
                        <span class="value ${cough.score > 50 ? 'high-risk' : 'low-risk'}">${cough.score}/100</span>
                    </div>
                ` : '<p>No cough analysis data available.</p>'}
            </div>

            <div class="section">
                <div class="section-title">2. Systemic Analysis (Anemia Eye Scan)</div>
                ${eye.label ? `
                    <div class="result-row">
                        <span class="label">Target Region:</span>
                        <span class="value">Lower Eyelid (Inferior Palpebral Conjunctiva)</span>
                    </div>
                    <div class="result-row">
                        <span class="label">Clinical Assessment:</span>
                        <span class="value">${eye.label}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">Est. Hemoglobin:</span>
                        <span class="value">${eye.hb ? eye.hb.toFixed(1) : 'N/A'} g/dL</span>
                    </div>
                        <div class="result-row">
                        <span class="label">Anemia Risk:</span>
                        <span class="value ${eye.score > 50 ? 'high-risk' : 'low-risk'}">${Math.round(eye.score)}%</span>
                    </div>
                    ${eye.image ? `
                        <div class="image-box">
                            <p style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Analyzed Region: Inferior Conjunctiva</p>
                            <img src="${eye.image}" alt="Analyzed Eye" style="max-height: 200px;" loading="lazy">
                        </div>
                    ` : ''}
                ` : '<p>No eye scan data available.</p>'}
            </div>

            <div class="section">
                <div class="section-title">3. Manual Clinical Vitals</div>
                ${vitalsReport ? `
                    <div class="result-row">
                        <span class="label">Overall Status:</span>
                        <span class="value" style="color: ${vitalsReport.color}">${vitalsReport.status}</span>
                    </div>
                    ${vitalsReport.details ? vitalsReport.details.map(detail => `
                        <div class="result-row">
                            <span class="label">${detail.label}:</span>
                            <span class="value">${detail.msg}</span>
                        </div>
                    `).join('') : ''}
                        <div class="result-row" style="margin-top: 10px; font-size: 0.9em; color: #64748b;">
                        <span class="label">Raw Data:</span>
                        <span class="value">SpO2: ${vitals.spo2}%, HR: ${vitals.heartRate} bpm, RR: ${vitals.respRate} bpm</span>
                    </div>
                ` : '<p>No manual vitals recorded.</p>'}
            </div>
            
            <div class="section">
                    <div class="section-title">Overall Assessment</div>
                    <div class="result-row">
                    <span class="label">Composite Infection Probability:</span>
                    <span class="value" style="font-size: 1.2em;">${results.infectionProbability || 'N/A'}%</span>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    <strong>Disclaimer:</strong> This report is generated by an AI preliminary screening tool and does not constitute a definitive medical diagnosis. 
                    Results should be verified by clinical examination and standard laboratory tests.
                    </p>
            </div>

            <div class="no-print" style="margin-top: 40px; text-align: center;">
                <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">🖨️ Print / Save as PDF</button>
            </div>
        </body>
        </html>
    `;
};
