module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, context } = req.body;
    
    // আপনি যেহেতু নাম পাল্টাতে চান না, তাই আগের GEMINI_API_KEY নামেই কাজ করবে
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key missing in Vercel' });
    }
    
    // Groq API Call (GEMINI_API_KEY এর ভ্যালু হিসেবে Groq এর Key থাকতে হবে)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', 
        messages: [
          {
            role: 'system',
            content: `তুমি তামজিদুল ইসলাম (অভি)-এর ওয়েবসাইটের একজন পার্সোনাল অ্যাসিস্ট্যান্ট। নিচে দেওয়া ওয়েবসাইটের তথ্য (Context) খুব ভালো করে পড়ো। ভিজিটর যখন কোনো প্রশ্ন করবে, তুমি শুধুমাত্র এই তথ্যের ওপর ভিত্তি করে সংক্ষিপ্ত, বাংলায় ও বন্ধুবৎসল ভাষায় উত্তর দেবে। তথ্যের বাইরে কিছু বানাবে না। উত্তর না জানা থাকলে বলবে: "আমি জানিনা"।\n\nওয়েবসাইটের তথ্য:\n${context}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2, 
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }
    
    // Groq-এর রেসপন্স ফরম্যাট
    const replyText = data.choices[0].message.content;
    
    res.status(200).json({ reply: replyText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
