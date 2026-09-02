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
      parts: [{ text: persona.systemPrompt + "\n\nPENTING: Berikan jawaban singkat bergaya pesan chat santai (WhatsApp). Jika jawaban butuh penjelasan panjang, bagi menjadi beberapa pesan pendek yang dipisahkan persis dengan teks '|||'." }]
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

export const callOpenRouterAPI = async (chatMessages, modelId, apiKey) => {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  const messages = [
    { role: 'system', content: "PENTING: Berikan jawaban singkat bergaya pesan chat santai (WhatsApp). Jika jawaban butuh penjelasan panjang, bagi menjadi beberapa pesan pendek yang dipisahkan persis dengan teks '|||'." },
    ...chatMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  const payload = {
    model: modelId,
    messages: messages,
  };

  let retries = 3;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Waai App'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`OpenRouter HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content;
      if (responseText) return responseText;
      throw new Error('Pesan balasan kosong dari OpenRouter');
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
};
