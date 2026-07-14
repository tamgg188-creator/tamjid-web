export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], pageContent = '' } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const safePageContent =
    typeof pageContent === 'string' ? pageContent.slice(0, 12000) : '';

  const systemPrompt = `তুমি তামজিদুল ইসলাম অভি (Ovi)-এর পোর্টফোলিও ওয়েবসাইটের একটি AI অ্যাসিস্ট্যান্ট। ভিজিটরদের প্রশ্নের উত্তর দাও, শুধুমাত্র নিচে দেওয়া "ওয়েবসাইটের বর্তমান কনটেন্ট" এর ভিত্তিতে — এর বাইরে নিজে থেকে কিছু বানিয়ে বলবে না।

=== ওয়েবসাইটের বর্তমান কনটেন্ট ===
${safePageContent || '(কোনো কনটেন্ট পাওয়া যায়নি)'}
=== কনটেন্ট শেষ ===

কঠোর নিয়ম:
1. ব্যবহারকারী যে ভাষায় (বাংলা/ইংরেজি) প্রশ্ন করেছে সেই ভাষাতেই সংক্ষিপ্ত, বন্ধুত্বপূর্ণ উত্তর দাও (২-৪ বাক্য)।
2. উপরের কনটেন্টে সরাসরি বা যৌক্তিকভাবে উত্তর না থাকলে, বানিয়ে বলবে না — সততার সাথে বলো, বাংলা প্রশ্নে: "দুঃখিত, এই বিষয়ে আমার কাছে সঠিক তথ্য নেই। বিস্তারিত জানতে সরাসরি ইমেইল করুন: inbox@tamjidulislam.online" — ইংরেজি প্রশ্নে একই মানে ইংরেজিতে, একই ইমেইল ঠিকানাসহ।
3. দাম/প্রাইসিং নিয়ে নিজে থেকে কোনো সংখ্যা বা কমিটমেন্ট দিবে না — জানতে চাইলে ইমেইলে যোগাযোগ করতে বলবে।
4. তুমি Ovi নিজে নও, তার ওয়েবসাইট অ্যাসিস্ট্যান্ট — এই পরিচয় স্পষ্ট রাখবে, নিজেকে Ovi বলে দাবি করবে না।
5. কনটেন্টে নেই এমন কোনো তথ্য অনুমান করে বলবে না, ধারণা দিয়ে গ্যাপ পূরণ করবে না।`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-6) : []),
    { role: 'user', content: message }
  ];

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        max_tokens: 400,
        temperature: 0.3
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      // সাধারণ কারণ: 429 = rate limit, 400 model_decommissioned = মডেল
      // পরিবর্তন দরকার (console.groq.com/docs/deprecations দেখুন),
      // 401 = API key ভুল বা Vercel env variable ঠিকমতো সেট হয়নি।
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await groqRes.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'দুঃখিত, এই মুহূর্তে উত্তর তৈরি করা যায়নি। বিস্তারিত জানতে ইমেইল করুন: inbox@tamjidulislam.online';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
