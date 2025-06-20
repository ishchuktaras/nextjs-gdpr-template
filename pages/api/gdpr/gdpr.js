// pages/api/gdpr/export.js
import { generateSecureToken, validateEmail } from '../../../lib/gdpr/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  // Validace
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  // Generování tokenu a odeslání emailu
  const token = generateSecureToken(email, process.env.GDPR_JWT_SECRET);
  
  // TODO: Implementujte odeslání emailu
  
  return res.status(200).json({
    message: 'Ověřovací email byl odeslán'
  });
}