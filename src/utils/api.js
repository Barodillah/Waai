export const callGeminiAPI = async (chatMessages, persona) => {
  const apiKey = "";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const contents = chatMessages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: persona.systemPrompt }]
    }
  };

  let retries = 5;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) return responseText;
      throw new Error('Pesan balasan kosong');
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
};
