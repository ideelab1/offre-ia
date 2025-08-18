// Fichier : offre-ia/api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { projectGoals, lang } = req.body;
  if (!projectGoals) {
    return res.status(400).json({ error: 'La description du projet est requise' });
  }

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });
  }

  const promptText = `En tant qu'expert en automatisation et IA pour entreprises, analyse le besoin client suivant: "${projectGoals}". 
  Rédige une section "Solution Proposée" percutante pour une offre de service. 
  Le format de ta réponse doit être exclusivement du code HTML sous la forme d'une liste à puces <ul>. 
  Met en évidence 2 à 4 points clés. Le ton doit être professionnel, confiant et orienté vers la valeur ajoutée pour le client.
  La langue de la réponse doit être: ${lang === 'fr' ? 'Français' : 'English'}.`;

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
            responseMimeType: "text/plain",
        }
      }),
    });

    if (!apiResponse.ok) { throw new Error('La réponse du service IA a échoué'); }

    const data = await apiResponse.json();
    const solutionHtml = data.candidates[0].content.parts[0].text;
    res.status(200).json({ solution: solutionHtml });

  } catch (error) {
    console.error('Erreur interne du serveur:', error);
    res.status(500).json({ error: 'Une erreur interne est survenue.' });
  }
}