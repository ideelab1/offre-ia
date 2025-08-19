// Fichier : api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Lit l'URL secrète depuis les variables de Vercel
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  if (!N8N_WEBHOOK_URL) {
    console.error("Erreur: N8N_WEBHOOK_URL n'est pas configuré sur le serveur.");
    return res.status(500).json({ error: 'Webhook URL non configuré' });
  }

  try {
    // Fait suivre la requête à n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!n8nResponse.ok) {
      throw new Error(`Le workflow n8n a répondu avec le statut: ${n8nResponse.status}`);
    }
    
    // Renvoie la réponse de n8n au client
    const data = await n8nResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Erreur lors de l'appel au workflow n8n:", error);
    res.status(500).json({ error: 'Échec de l\'exécution du workflow n8n' });
  }
}