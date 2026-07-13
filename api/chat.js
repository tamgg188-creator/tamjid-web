export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `তুমি এই ওয়েবসাইটের একজন পার্সোনাল অ্যাসিস্ট্যান্ট। নিচে দেওয়া ওয়েবসাইটের তথ্য (Context) খুব ভালো করে পড়ো। ভিজিটর যখন কোনো প্রশ্ন করবে, তুমি শুধুমাত্র এবং শুধুমাত্র এই তথ্যের ওপর ভিত্তি করে সংক্ষিপ্ত ও বন্ধুবৎসল ভাষায় উত্তর দেবে। 

যদি ভিজিটরের প্রশ্নের উত্তর নিচের তথ্যের মধ্যে সরাসরি দেওয়া না থাকে, তবে নিজের থেকে কোনো তথ্য বানিয়ে বা বানিয়ে উত্তর দেবে না। প্রশ্নের উত্তর না জানা থাকলে তুমি হুবহু এই কথাটি বলবে: "আমি জানিনা"।

ওয়েবসাইটের তথ্য (Context):
"""
${context}
"""

ভিজিটরের প্রশ্ন: ${message}`
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
