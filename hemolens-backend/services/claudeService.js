// services/aiService.js
// Uses OpenAI GPT-4o-mini — fast, cheap (~$0.01 per report), very accurate
// Get your API key at: https://platform.openai.com/api-keys

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `You are HemoLens, an expert medical AI assistant specializing in blood report analysis.
Your job is to analyze blood test reports and explain them clearly to patients.

Rules:
- Always respond with ONLY valid JSON, no extra text before or after, no markdown backticks
- Be accurate, thorough, and use patient-friendly language in explanations
- Flag values outside the reference range provided in the report
- If no reference range is given, use standard adult reference ranges
- Never diagnose — explain findings and suggest consulting a doctor
- If a value is critical, clearly mark it as critical_low or critical_high`

function buildAnalysisPrompt(extractedText) {
  return `Analyze the following blood test report and return a JSON object with this exact structure:

{
  "patientInfo": {
    "name": "string or null",
    "age": "string or null",
    "gender": "string or null",
    "reportDate": "string or null",
    "labName": "string or null"
  },
  "summary": "2-3 sentence plain-English overview of the report for the patient",
  "biomarkers": [
    {
      "name": "test name",
      "value": numeric_value_or_null,
      "unit": "unit string",
      "referenceRange": "e.g. 12.0 - 17.0",
      "flag": "normal | low | high | critical_low | critical_high | unknown",
      "category": "e.g. Complete Blood Count | Liver Function | Thyroid | etc.",
      "explanation": "1-2 sentence plain-English explanation of what this test measures and what the result means"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}

Blood Report Text:
---
${extractedText}
---

Return ONLY the JSON object. No markdown, no backticks, no explanation outside the JSON.`
}

/**
 * Call OpenAI API
 */
async function callOpenAI(userPrompt) {
  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    if (res.status === 401) throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env')
    if (res.status === 429) throw new Error('OpenAI rate limit reached. Please wait a moment and try again.')
    if (res.status === 402) throw new Error('OpenAI billing issue. Please check your account at platform.openai.com')
    throw new Error(err.error?.message || 'AI service error. Please try again.')
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Analyze extracted blood report text using OpenAI
 */
async function analyzeBloodReport(extractedText) {
  if (!extractedText || extractedText.trim().length < 50) {
    throw new Error('Extracted text is too short — the file may not contain readable content')
  }

  const rawText = await callOpenAI(buildAnalysisPrompt(extractedText))

  let analysis
  try {
    const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim()
    analysis = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.')
  }

  // Compute flag counts
  const flagCounts = { normal: 0, abnormal: 0, critical: 0 }
  if (analysis.biomarkers) {
    analysis.biomarkers.forEach((b) => {
      if (b.flag === 'normal') flagCounts.normal++
      else if (b.flag === 'critical_low' || b.flag === 'critical_high') flagCounts.critical++
      else if (b.flag !== 'unknown') flagCounts.abnormal++
    })
  }

  return { ...analysis, flagCounts }
}

/**
 * Answer a follow-up question about a specific report
 */
async function answerReportQuestion(question, reportAnalysis) {
  const prompt = `Here is a patient's blood report analysis:
${JSON.stringify(reportAnalysis, null, 2)}

Patient's question: ${question}

Answer clearly in plain English in 2-4 sentences. Always remind them to consult a doctor for medical decisions.`

  return await callOpenAI(prompt)
}

module.exports = { analyzeBloodReport, answerReportQuestion }
