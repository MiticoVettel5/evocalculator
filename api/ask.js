export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Domanda mancante" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Rispondi in italiano in modo chiaro."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json({
      answer:
        data.choices?.[0]?.message?.content ||
        "Nessuna risposta ricevuta"
    });

  } catch (e) {
    res.status(500).json({
      error: "Errore AI"
    });
  }
}
