
export const callOpenRouterAPI = async (chatMessages, modelId, apiKey, customSystemPrompt = null, userName = 'Barod', isGroup = false) => {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  const groupContext = isGroup ? "\n\nPENTING: Ini adalah obrolan grup. Pesan dari pengguna lain dan AI lain akan diawali dengan nama mereka (misal '[Nama]: pesan'). Tanggapilah percakapan dengan natural sebagai anggota grup." : "";
  const userContext = `\n\nKamu sedang berbicara dengan pengguna bernama ${userName}. Jika sesuai, panggillah pengguna dengan nama tersebut.`;
  const defaultSystemPrompt = "PENTING: Berikan jawaban singkat bergaya pesan chat santai (WhatsApp). Jika jawaban butuh penjelasan panjang, bagi menjadi beberapa pesan pendek yang dipisahkan persis dengan teks '|||'.";
  const sysPromptContent = customSystemPrompt ? `${customSystemPrompt}${userContext}${groupContext}\n\n${defaultSystemPrompt}` : `${userContext}${groupContext}\n\n${defaultSystemPrompt}`;

  const messages = [
    { role: 'system', content: sysPromptContent },
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
