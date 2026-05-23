export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metodo non consentito. Usa POST."
    });
  }

  const { question } = req.body || {};

  if (!question || question.trim().length < 2) {
    return res.status(400).json({
      error: "Domanda mancante o troppo corta."
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: "Chiave OpenRouter mancante nel backend."
    });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://evocalculator.vercel.app",
          "X-OpenRouter-Title": "Calcolatrice Evo AI"
        },
        body: JSON.stringify({
          model:"mistralai/mistral-7b-instruct:free",
          temperature: 0.35,
          top_p: 0.9,
          max_tokens: 1200,
          messages: [
            {
              role: "system",
              content:
                "Sei Evo AI, un assistente intelligente moderno integrato nella Calcolatrice Evo. Rispondi sempre in italiano chiaro, preciso e naturale. Adatta la risposta alla domanda. Per domande semplici sii diretto. Per domande complesse usa spiegazioni ordinate, passaggi numerati, esempi e dettagli utili. Per matematica mostra i calcoli passo passo. Per programmazione scrivi codice pulito e spiegato. Per storia usa date precise e cronologia quando serve. Per studio crea schemi, riassunti, mappe concettuali e consigli pratici. Se la domanda richiede fonti, aggiungi una sezione finale chiamata 'Fonti consigliate' con siti o riferimenti autorevoli da consultare. Non inventare fonti, dati o fatti incerti: se non sei sicuro, dillo chiaramente."
            },
            {
              role: "user",
              content: question.trim()
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Errore nella risposta di OpenRouter."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Nessuna risposta ricevuta dall'AI.";

    return res.status(200).json({
      answer,
      model: data?.model || "openai/gpt-4o-mini",
      usage: data?.usage || null
    });

  } catch (error) {
    return res.status(500).json({
      error: "Errore interno nel collegamento con Evo AI."
    });
  }
}
