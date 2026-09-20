const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const key = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
  console.log('Testing with key:', key);
  
  // The SDK doesn't expose ListModels directly in a simple way in older versions,
  // Let's just fetch it using native fetch
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.error) {
      console.error('API Error:', data.error);
    } else {
      console.log('Available models:');
      data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    }
  } catch(e) {
    console.error(e);
  }
}

listModels();
