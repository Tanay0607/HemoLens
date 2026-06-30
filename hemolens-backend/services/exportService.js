// services/exportService.js
// Generates a beautiful HTML report that users can print/save as PDF
// No extra npm packages needed — pure HTML + CSS

const FLAG_CONFIG = {
  normal:        { label: 'Normal',        color: '#059669', bg: '#f0fdf4', border: '#86efac' },
  low:           { label: 'Low',           color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  high:          { label: 'High',          color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  critical_low:  { label: 'Critical Low',  color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  critical_high: { label: 'Critical High', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  unknown:       { label: 'Unknown',       color: '#94a3b8', bg: '#f8fafc', border: '#cbd5e1' },
}

function getFlagConfig(flag) {
  return FLAG_CONFIG[flag] || FLAG_CONFIG.unknown
}

function biomarkerRows(biomarkers) {
  if (!biomarkers || biomarkers.length === 0) return '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">No biomarkers found</td></tr>'

  return biomarkers.map((b, i) => {
    const cfg = getFlagConfig(b.flag)
    const isFlagged = b.flag !== 'normal' && b.flag !== 'unknown'
    const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
    const leftBorder = isFlagged ? `border-left: 3px solid ${cfg.color};` : ''

    return `
      <tr style="background:${rowBg};${leftBorder}">
        <td style="padding:10px 12px;font-size:13px;color:#1e293b;font-weight:500;">${b.name || '—'}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;color:${isFlagged ? cfg.color : '#1e293b'};">${b.value != null ? b.value : '—'} <span style="font-weight:400;color:#94a3b8;font-size:11px;">${b.unit || ''}</span></td>
        <td style="padding:10px 12px;font-size:12px;color:#64748b;">${b.referenceRange || '—'}</td>
        <td style="padding:10px 12px;">
          <span style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${cfg.label}</span>
        </td>
        <td style="padding:10px 12px;font-size:12px;color:#475569;max-width:220px;">${b.explanation || ''}</td>
      </tr>`
  }).join('')
}

function groupByCategory(biomarkers) {
  const groups = {}
  biomarkers.forEach((b) => {
    const cat = b.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(b)
  })
  return groups
}

/**
 * Generate a complete HTML report for a given report object
 * @param {object} report - The MongoDB report document
 * @returns {string} Full HTML string
 */
function generateReportHTML(report) {
  const date = new Date(report.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const biomarkers = report.biomarkers || []
  const groups = groupByCategory(biomarkers)
  const { normal = 0, abnormal = 0, critical = 0 } = report.flagCounts || {}

  // Build category sections
  const categorySections = Object.entries(groups).map(([category, items]) => `
    <div style="margin-bottom:28px;">
      <div style="background:#1e40af;color:white;padding:8px 16px;border-radius:6px 6px 0 0;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
        ${category}
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Test</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Result</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Reference Range</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Status</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Explanation</th>
          </tr>
        </thead>
        <tbody>${biomarkerRows(items)}</tbody>
      </table>
    </div>
  `).join('')

  // Recommendations
  const recsHTML = report.recommendations?.length > 0 ? `
    <div style="margin-bottom:28px;">
      <h2 style="font-size:16px;font-weight:700;color:#1e293b;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">
        Recommendations
      </h2>
      <ul style="margin:0;padding-left:0;list-style:none;">
        ${report.recommendations.map(r => `
          <li style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;">
            <span style="color:#2563eb;font-weight:700;flex-shrink:0;">→</span> ${r}
          </li>`).join('')}
      </ul>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>HemoLens Report — ${report.originalFileName || 'Blood Report'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; }
    @media print {
      .no-print { display: none !important; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body style="max-width:900px;margin:0 auto;padding:32px 24px;">

  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="text-align:right;margin-bottom:20px;">
    <button onclick="window.print()"
      style="background:#2563eb;color:white;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
      🖨️ Save as PDF / Print
    </button>
  </div>

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e40af,#2563eb);color:white;padding:28px 32px;border-radius:12px;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">👁</div>
          <span style="font-size:22px;font-weight:700;">HemoLens</span>
        </div>
        <p style="opacity:0.8;font-size:13px;">AI-Powered Blood Report Analysis</p>
      </div>
      <div style="text-align:right;font-size:12px;opacity:0.85;">
        <div>${date}</div>
        ${report.patientInfo?.labName ? `<div style="margin-top:4px;">${report.patientInfo.labName}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- Patient info -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;gap:40px;flex-wrap:wrap;">
    <div>
      <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">File</div>
      <div style="font-size:14px;font-weight:600;color:#1e293b;">${report.originalFileName || 'Blood Report'}</div>
    </div>
    ${report.patientInfo?.name ? `<div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Patient</div><div style="font-size:14px;font-weight:600;color:#1e293b;">${report.patientInfo.name}</div></div>` : ''}
    ${report.patientInfo?.age ? `<div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Age</div><div style="font-size:14px;font-weight:600;color:#1e293b;">${report.patientInfo.age}</div></div>` : ''}
    ${report.patientInfo?.gender ? `<div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Gender</div><div style="font-size:14px;font-weight:600;color:#1e293b;">${report.patientInfo.gender}</div></div>` : ''}
    ${report.patientInfo?.reportDate ? `<div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Report Date</div><div style="font-size:14px;font-weight:600;color:#1e293b;">${report.patientInfo.reportDate}</div></div>` : ''}
  </div>

  <!-- Stats -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#059669;">${normal}</div>
      <div style="font-size:12px;color:#16a34a;font-weight:500;margin-top:2px;">Normal Values</div>
    </div>
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#d97706;">${abnormal}</div>
      <div style="font-size:12px;color:#b45309;font-weight:500;margin-top:2px;">Abnormal Values</div>
    </div>
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#dc2626;">${critical}</div>
      <div style="font-size:12px;color:#b91c1c;font-weight:500;margin-top:2px;">Critical Values</div>
    </div>
  </div>

  <!-- AI Summary -->
  ${report.summary ? `
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:28px;">
    <div style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">AI Summary</div>
    <p style="font-size:14px;color:#1e40af;line-height:1.7;">${report.summary}</p>
  </div>` : ''}

  <!-- Biomarker sections by category -->
  ${categorySections}

  <!-- Recommendations -->
  ${recsHTML}

  <!-- Disclaimer -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-top:20px;">
    <p style="font-size:11px;color:#94a3b8;line-height:1.6;text-align:center;">
      ⚠️ This report is generated by HemoLens AI for educational purposes only.
      It does not constitute medical advice, diagnosis, or treatment.
      Always consult a qualified healthcare professional for medical decisions.
    </p>
  </div>

  <div style="text-align:center;margin-top:16px;font-size:11px;color:#cbd5e1;">
    Generated by HemoLens • ${new Date().toLocaleDateString()}
  </div>

</body>
</html>`
}

module.exports = { generateReportHTML }
