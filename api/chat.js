// Vercel Serverless Function: /api/chat
// OpenRouter integration — API key stays server-side only

const PROFILE = `You are an AI assistant on Kishore S's portfolio website. Keep answers to 2-3 sentences.

About Kishore:
- Full Stack Developer + ML Engineer + UI/UX Designer, Chennai India
- Skills: Python, JavaScript, React, Django, Flask, TensorFlow, Keras, OpenCV, Figma, Power BI
- Star project: Sign Language Detection System — 90% accuracy using MobileNet transfer learning
- Projects: Netflix Analytics Dashboard (Power BI/DAX), Django Chat App (REST API), To-Do App, DOCX-PDF Converter, CGPA Calculator
- Experience: UI/UX Intern @ BLS 360, Dev Intern @ J.AI, Junior Accountant @ Raven & Co
- Education: M.Sc IT @ D.G. Vaishnav College (CGPA 8.5, 2026), B.Sc CS (CGPA 7.8, 2023)
- Open to: Full Stack, ML, or hybrid roles — internships, full-time, freelance. Available immediately.
- Contact: Use the contact form on this page, or LinkedIn: linkedin.com/in/kishore-sakthi`;

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message = '' } = req.body || {};
  if (!message.trim()) return res.status(400).json({ success: false, error: 'Message required.' });
  if (message.length > 500) return res.status(400).json({ success: false, error: 'Message too long.' });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.json({ success: true, reply: fallback(message) });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://portfolio-xi-ten-23.vercel.app',
        'X-Title': 'Kishore S Portfolio'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        max_tokens: 150,
        messages: [
          { role: 'system', content: PROFILE },
          { role: 'user', content: message.trim() }
        ]
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || fallback(message);
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('OpenRouter error:', err.message);
    return res.json({ success: true, reply: fallback(message) });
  }
}

function fallback(q) {
  const m = q.toLowerCase();
  // Keyword-based responses
  const rules = [
    [['python','java','javascript','sql','coding','language'], "Yes! Kishore works with Python, JavaScript, Java, and SQL. Python is his strongest — used for ML, Flask backends, and automation scripts."],
    [['react','frontend','html','css','bootstrap','ui'], "Kishore builds frontends with React, HTML5, CSS3, and Bootstrap. He focuses on clean, responsive design with great UX."],
    [['django','flask','backend','api','rest','server'], "Kishore builds backends with Django and Flask, creating REST APIs with proper serialization, authentication, and SQLite/MySQL databases."],
    [['tensorflow','keras','ml','machine learning','ai','deep learning','model','accuracy','sign language','mobilenet','opencv'], "Kishore's ML star project achieved 90% accuracy on real-time sign language detection using MobileNet transfer learning with TensorFlow and OpenCV."],
    [['figma','design','uiux','ui/ux','wireframe','prototype'], "Kishore does UI/UX design in Figma — wireframes, high-fidelity mockups, and prototypes. He redesigned 5+ web pages during his BLS 360 internship."],
    [['power bi','data','dashboard','dax','analytics','sql'], "Kishore built a Netflix Analytics Dashboard in Power BI with 10+ interactive visualizations, using DAX measures and Power Query for ETL."],
    [['project','built','work','portfolio'], "Kishore's projects include: Sign Language Detection (ML), Netflix Dashboard (Power BI), Django Chat App, To-Do App, DOCX→PDF Converter, and a Java CGPA Calculator."],
    [['intern','experience','work','job','bls','jai','raven'], "Kishore has 3 internships: UI/UX Design at BLS 360, Developer & Testing at J.AI, and 8 months as Junior Accountant at Raven & Co."],
    [['education','degree','college','cgpa','msc','bsc','study'], "Kishore is pursuing M.Sc IT at D.G. Vaishnav College (CGPA 8.5, expected 2026) and holds a B.Sc CS (CGPA 7.8, 2023)."],
    [['hire','contact','available','job','work','open','freelance','full-time'], "Yes! Kishore is actively looking for Full Stack, ML, or hybrid roles — open to internships, full-time, and freelance. Use the contact form or LinkedIn to reach him."],
    [['location','where','city','chennai','india'], "Kishore is based in Chennai, Tamil Nadu, India. He's open to remote work globally."],
    [['achievement','award','prize','won'], "Kishore won 1st Prize in a Technical Seminar on Cloud & DeepFake technology, and 2nd Prize in a Graphical Design competition — both in 2025."]
  ];
  for (const [keywords, reply] of rules) {
    if (keywords.some(k => m.includes(k))) return reply;
  }
  return "I'm Kishore's portfolio assistant. Ask me about his skills (Python, React, Django, ML), projects, experience, or how to hire him!";
}
