// api/chat.js
// এই ফাইলটি Vercel-এ ডিপ্লয় করলে স্বয়ংক্রিয়ভাবে একটি Serverless Function হিসেবে কাজ করবে
// (URL হবে: https://tamjidulislam.online/api/chat)
//
// ⚠️ গুরুত্বপূর্ণ: এখানে কখনোই GROQ_API_KEY সরাসরি লিখবেন না।
// Vercel Dashboard → আপনার প্রজেক্ট → Settings → Environment Variables এ গিয়ে
// Key: GROQ_API_KEY
// Value: আপনার নতুন (regenerate করা) Groq API key
// যোগ করুন, তারপর রিডিপ্লয় করুন।

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};

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

  // শুধুমাত্র ওয়েবসাইটের তথ্যের ভিত্তিতে উত্তর দেওয়ার জন্য সিস্টেম প্রম্পট
  const systemPrompt = `তুমি তামজিদুল ইসলাম অভি (Ovi) এর পোর্টফোলিও ওয়েবসাইটের একটি AI অ্যাসিস্ট্যান্ট। তোমার একমাত্র কাজ হলো ভিজিটরদের প্রশ্নের উত্তর দেওয়া, শুধুমাত্র নিচের তথ্যের ভিত্তিতে — এর বাইরে কিছু বানিয়ে বলবে না:

তথ্য:
- নাম: তামজিদুল ইসলাম (Ovi / অভি), সিলেট, বাংলাদেশ ভিত্তিক ওয়েব ডেভেলপার ও গ্রাফিক্স ডিজাইনার।
- দক্ষতা: Graphic Design (Photoshop, Illustrator, Branding) ৯৫%, UI/UX Design (Figma) ৮৫%, Frontend Development (React.js, JavaScript) ৯০%, Backend Integration (Node.js, MongoDB) ৭৫%, CSS Frameworks (Tailwind, SASS) ৮৮%।
- ১০+ প্রজেক্ট সম্পন্ন করেছে — যেমন: ব্র্যান্ড আইডেন্টিটি ডিজাইন (Illustrator/Photoshop), React.js Dashboard (React/Tailwind), ক্রিয়েটিভ পোর্টফোলিও (HTML/JS/Figma)।
- কাজের প্রক্রিয়া: ১) আবিষ্কার (ক্লায়েন্টের লক্ষ্য বোঝা) ২) পরিকল্পনা (ওয়্যারফ্রেম/প্রোটোটাইপ) ৩) ডিজাইন ও বিল্ড ৪) ডেলিভারি ও সাপোর্ট।
- যোগাযোগ: ইমেইল inbox@tamjidulislam.online, অথবা ওয়েবসাইটের "যোগাযোগ" সেকশনের ফর্ম।
- লোকেশন: সিলেট, বাংলাদেশ। ভাষা: বাংলা, ইংরেজি। কাজের সময়: BST (UTC+6)।
- বর্তমানে নতুন ফ্রিল্যান্স প্রজেক্ট ও কোলাবোরেশনের জন্য উপলব্ধ।

কঠোর নিয়ম:
1. উত্তর সংক্ষিপ্ত, বন্ধুত্বপূর্ণ ও স্পষ্ট রাখো (২-৪ বাক্য)। ব্যবহারকারী যে ভাষায় (বাংলা/ইংরেজি) লিখেছে সেই ভাষায় উত্তর দাও।
2. উপরের তথ্যের বাইরে কিছু জিজ্ঞেস করলে সততার সাথে বলো: "দুঃখিত, এই বিষয়ে আমার কাছে সঠিক তথ্য নেই। সরাসরি যোগাযোগ ফর্ম বা ইমেইল ব্যবহার করুন।"
3. কখনো নিজে থেকে দাম/প্রাইসিং কমিটমেন্ট দিবে না — "প্রাইসিং জানতে সরাসরি যোগাযোগ করুন" বলবে।
4. তুমি Ovi নিজে নও, তার অ্যাসিস্ট্যান্ট — এটা স্পষ্ট থাকতে হবে।`;

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
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 400,
        temperature: 0.4
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await groqRes.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'দুঃখিত, এই মুহূর্তে উত্তর তৈরি করা যায়নি। আবার চেষ্টা করুন।';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
