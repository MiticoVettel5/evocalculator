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

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Chiave Gemini mancante nel backend."
    });
  }

  try {
    const prompt = `
Sei Evo AI, un assistente intelligente moderno integrato nella Calcolatrice Evo.
Rispondi sempre in italiano chiaro, preciso e naturale.
Per matematica mostra i calcoli passo passo.
Per programmazione scrivi codice pulito e spiegato.
Per storia usa date precise e cronologia quando serve.
Per studio crea schemi, riassunti, mappe concettuali e consigli pratici.
Non inventare fonti, dati o fatti incerti: se non sei sicuro, dillo chiaramente.

Domanda utente:
${question.trim()}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 1200
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Errore nella risposta di Gemini."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Nessuna risposta ricevuta dall'AI.";

    return res.status(200).json({
      answer,
      model: "gemini-2.0-flash",
      usage: data?.usageMetadata || null
    });

  } catch (error) {
    return res.status(500).json({
      error: "Errore interno nel collegamento con Evo AI."
    });
  }
}
