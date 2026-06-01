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

  const prompt = `
Sei Evo AI, l'assistente intelligente ufficiale della Calcolatrice Evo.

Rispondi sempre in italiano chiaro, veloce, preciso e naturale.

REGOLE PRINCIPALI:
- Se la domanda è semplice, rispondi subito e in modo diretto.
- Se la domanda è complessa, usa sezioni ordinate.
- Per matematica, mostra i passaggi.
- Per fisica, indica formule, dati, calcolo e risultato.
- Per storia, usa date precise e cronologia.
- Per scuola superiore, crea schemi, riassunti, mappe concettuali e spiegazioni semplici.
- Per informatica, scrivi codice pulito e spiegato.
- Se l'utente chiede consigli personali, rispondi con equilibrio, senza giudicare.
- Se non sei sicuro di un dato, dillo chiaramente.
- Non inventare fonti.
- Non dire mai che sei solo una calcolatrice. 
- Per ogni domanda , dai risposte precise citando le fonti.
- Sei alimentato da Gemini tramite backend sicuro, ma ti presenti sempre come Evo AI.

FUNZIONI SPECIALI:
Se l'utente chiede di creare un'immagine, rispondi con un prompt immagine dettagliato, pronto per un generatore AI.
Se l'utente chiede di creare un video, rispondi con:
1. titolo
2. stile video
3. durata consigliata
4. scene numerate
5. descrizione visiva
6. movimento camera
7. luci
8. atmosfera
9. prompt finale pronto per generatore video AI.

Se l'utente allega file, foto, PDF o video, spiegagli che può descrivere il contenuto o chiedere cosa vuole analizzare.

STILE:
- moderno
- utile
- preciso
- rapido
- adatto allo studio
- adatto a matematica, storia, lingue, informatica, fisica e vita quotidiana.

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
