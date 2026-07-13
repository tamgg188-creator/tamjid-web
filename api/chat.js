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

== পরিচিতি ==
- পূর্ণ নাম: তামজিদুল ইসলাম, ডাকনাম Ovi/অভি। সিলেট, বাংলাদেশ ভিত্তিক ওয়েব ডেভেলপার, গ্রাফিক্স ডিজাইনার ও ক্রিয়েটিভ পার্সন।
- জব টাইটেল: Website Developer, Graphic Designer, Frontend Developer, UI/UX Designer, Creative Developer.
- তিনি ভিজ্যুয়াল আর্ট এবং কোডের সমন্বয়ে পিক্সেল-পারফেক্ট ডিজাইন তৈরি করেন।

== স্বীকৃতি / Awards ==
- Recognised by David J. Malan, Harvard University — এর একটি সার্টিফিকেট/প্রমাণপত্র আছে যা ওয়েবসাইটের হিরো সেকশনে "(Click here)" লিংকে ক্লিক করে দেখা যায়।
- Sylnews অনুযায়ী তিনি সিলেটের Best Website Developer, Best Graphic Designer এবং Most Creative Person হিসেবে স্বীকৃত।

== পরিসংখ্যান (About সেকশন) ==
- ১০+ প্রজেক্ট সম্পন্ন
- ৮+ টেকনোলজিতে দক্ষ
- ক্রিয়েটিভ আইডিয়া: ∞ (অসীম)

== দক্ষতা (Skills সেকশন, প্রতিটির দক্ষতার মাত্রা সহ) ==
1. Graphic Design Services — ৯৫% (Photoshop, Illustrator, Branding) — ব্র্যান্ড আইডেন্টিটি থেকে প্রিন্ট মিডিয়া পর্যন্ত পিক্সেল-পারফেক্ট ডিজাইন।
2. UI/UX Design — ৮৫% (Figma, Prototyping)
3. Frontend Development — ৯০% (React.js, JavaScript)
4. Backend Integration — ৭৫% (Node.js, MongoDB)
5. CSS Frameworks — ৮৮% (Tailwind CSS, SASS)
- অন্যান্য টুলস: MongoDB, Figma, Photoshop, Illustrator।

== প্রজেক্টসমূহ (Projects সেকশন) ==
1. ব্র্যান্ড আইডেন্টিটি ডিজাইন (ব্র্যান্ড ডিজাইন ক্যাটাগরি) — একটি স্টার্টআপ কোম্পানির জন্য সম্পূর্ণ লোগো, কালার প্যালেট ও সোশ্যাল মিডিয়া ব্র্যান্ডিং গাইডলাইন। টুলস: Illustrator, Photoshop।
2. React.js Dashboard (ওয়েব ডেভেলপমেন্ট ক্যাটাগরি) — বিক্রেতাদের জন্য রিয়েল-টাইম প্রোডাক্ট ট্র্যাকিং সহ সম্পূর্ণ রেসপনসিভ ওয়েব ড্যাশবোর্ড। টুলস: React, Tailwind CSS।
3. ক্রিয়েটিভ পোর্টফোলিও (ক্রিয়েটিভ ডেভেলপমেন্ট ক্যাটাগরি) — অ্যানিমেশন ও ইন্টারঅ্যাকটিভ ডিজাইনযুক্ত কাস্টম ওয়েব পোর্টফোলিও। টুলস: HTML/JS, Figma।

== কাজের প্রক্রিয়া (Process সেকশন, ৪ ধাপ) ==
1. আবিষ্কার — ক্লায়েন্টের লক্ষ্য, টার্গেট অডিয়েন্স ও প্রজেক্ট স্কোপ বোঝা।
2. পরিকল্পনা — ওয়্যারফ্রেম, প্রোটোটাইপ ও আর্কিটেকচার তৈরি।
3. ডিজাইন ও বিল্ড — ভিজ্যুয়াল ডিজাইন ও ক্লিন, স্কেলেবল কোড একসাথে তৈরি।
4. ডেলিভারি — টেস্টিং ও অপ্টিমাইজেশনের পর ডেলিভারি ও সাপোর্ট।

== যোগাযোগ ==
- ইমেইল: inbox@tamjidulislam.online
- লোকেশন: সিলেট, বাংলাদেশ
- ভাষা: বাংলা, ইংরেজি
- কাজের সময়: BST (UTC+6)
- বর্তমান অবস্থা: ফ্রিল্যান্স প্রজেক্ট ও কোলাবোরেশনের জন্য উপলব্ধ
- সোশ্যাল মিডিয়া: Facebook (facebook.com/tamjidul.islam.ovi), Instagram (instagram.com/tamjidul.islam.ovi), LinkedIn (linkedin.com/in/tamjidul-islam-ovi-008342401)
- সরাসরি মেসেজ করতে চাইলে ওয়েবসাইটের "যোগাযোগ" সেকশনের ফর্ম ব্যবহার করা যায়।

== FAQ (ওয়েবসাইটে থাকা প্রশ্নোত্তর) ==
- Ovi কে? → সিলেট ভিত্তিক প্রফেশনাল ওয়েব ডেভেলপার, গ্রাফিক্স ডিজাইনার ও ক্রিয়েটিভ পার্সন, Harvard-এর David J. Malan দ্বারা স্বীকৃত, Sylnews দ্বারা হাইলাইটেড।
- রেসপনসিভ ওয়েবসাইট বানান কিনা? → হ্যাঁ, সব ওয়েবসাইট ফুল রেসপনসিভ, পারফরম্যান্স অপ্টিমাইজড, মোবাইল/ট্যাবলেট/ডেস্কটপ সব ডিভাইসে ভালো দেখায়।
- গ্রাফিক ডিজাইনার হিসেবে কী কী সার্ভিস দেন? → UI/UX Design, Graphic Design (Branding, Print), Frontend Web Development (React.js, Tailwind), full web integration।

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
