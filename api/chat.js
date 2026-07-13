export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // ভার্সাল থেকে কী-টি অটোমেটিক চলে আসবে
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `তুমি আমার পার্সোনাল অ্যাসিস্ট্যান্ট। সংক্ষিপ্ত এবং বন্ধুবৎসল ভাষায় উত্তর দাও। আমার ওয়েবসাইট সম্পর্কে দর্শনার্থীকে সাহায্য করো। প্রশ্ন: ${message}`
          }]
        }]
      })
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
