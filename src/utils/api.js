
export const callOpenRouterAPI = async (chatMessages, modelId, apiKey, customSystemPrompt = null, userName = 'User', isGroup = false, currentMemberName = null, userMemories = []) => {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  const groupContext = isGroup ? `\n\nPENTING: Ini adalah obrolan grup. Pesan dari pengguna lain dan AI lain akan diawali dengan nama mereka (misal '[Nama]: pesan'). Tanggapilah percakapan dengan natural sebagai anggota grup. Jangan pernah menambahkan prefix nama kamu sendiri di awal pesanmu.` : "";
  const userContext = `\n\nKamu sedang berbicara dengan pengguna bernama ${userName}. Jika sesuai, panggillah pengguna dengan nama tersebut.`;
  
  let memoryContext = "";
  if (userMemories && userMemories.length > 0) {
    const memList = userMemories.map(m => `- ${m.parameter}: ${m.value}`).join('\n');
    memoryContext = `\n\nInformasi personal pengguna (Gunakan ini untuk personalisasi jawaban jika relevan, tapi jangan sebutkan bahwa kamu mengingatnya atau membaca informasi ini. Cukup gunakan secara natural):\n${memList}`;
  }

  const defaultSystemPrompt = "PENTING: Berikan jawaban singkat bergaya pesan chat santai (WhatsApp). Jika jawaban butuh penjelasan panjang, bagi menjadi beberapa pesan pendek yang dipisahkan persis dengan teks '|||'.";
  const sysPromptContent = customSystemPrompt ? `${customSystemPrompt}${userContext}${memoryContext}${groupContext}\n\n${defaultSystemPrompt}` : `${userContext}${memoryContext}${groupContext}\n\n${defaultSystemPrompt}`;

  // For group chats: only messages from the current member are 'assistant',
  // all other messages (user + other AI members) are 'user' role.
  // This prevents consecutive assistant messages which many models reject.
  const messages = [
    { role: 'system', content: sysPromptContent },
    ...chatMessages.map((m) => {
      if (isGroup && currentMemberName) {
        // Current member's own past messages → assistant
        if (m.sender === 'ai' && m.senderName === currentMemberName) {
          return { role: 'assistant', content: m.text };
        }
        // Everything else (user messages + other AI members) → user
        return { role: 'user', content: m.text };
      }
      // Non-group: standard mapping
      return {
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      };
    })
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
        const errorBody = await response.text().catch(() => 'No body');
        console.error(`OpenRouter HTTP ${response.status} for model ${modelId}:`, errorBody);
        const error = new Error(`OpenRouter HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content;
      if (responseText) return responseText;
      throw new Error('Pesan balasan kosong dari OpenRouter');
    } catch (err) {
      const is402 = err.status === 402 || (err.message && err.message.includes('HTTP 402'));
      if (is402 || i === retries - 1) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

export const extractMemoryFromMessage = async (messageText, apiKey) => {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const systemPrompt = `Anda adalah sistem ekstraktor informasi. Tugas Anda adalah menganalisis pesan pengguna dan mengekstrak HANYA informasi profil/personal yang BARU (seperti umur, pekerjaan, nama anak, lokasi, kesukaan, dll). 
Keluarkan hasil dalam format JSON Array berisikan objek dengan properti "parameter" dan "value".
Contoh output jika pengguna mengatakan "anakku yang umur 3 tahun, namanya rama":
[
  {"parameter": "punya anak", "value": "ya"},
  {"parameter": "umur anak", "value": "3 tahun"},
  {"parameter": "nama anak", "value": "rama"}
]
Jika tidak ada informasi personal baru, kembalikan array kosong []. Output HANYA JSON tanpa format markdown.`;

  const payload = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: messageText }
    ]
  };

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

    if (response.ok) {
      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "[]";
      // Clean up markdown formatting if any
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const memories = JSON.parse(text);
      if (Array.isArray(memories) && memories.length > 0) {
        return memories;
      }
    }
  } catch (error) {
    console.error("Error extracting memory:", error);
  }
  
  return [];
};
