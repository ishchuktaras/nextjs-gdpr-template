// pages/api/gdpr/export.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Simulace databáze - nahraďte skutečnou databázovou logikou
const getUserData = async (email) => {
  // Zde by byl dotaz do vaší databáze
  // Pro demo účely vracíme statická data
  return {
    email: email,
    name: "Demo User",
    phone: "+420 xxx xxx xxx",
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2024-12-20T14:22:00Z",
    preferences: {
      newsletter: true,
      marketing: false
    },
    activityLog: [
      { action: "login", timestamp: "2024-12-20T14:22:00Z", ip: "127.0.0.1" },
      { action: "page_view", timestamp: "2024-12-20T14:23:00Z", page: "/services" },
      { action: "form_submit", timestamp: "2024-12-19T16:45:00Z", form: "contact" }
    ]
  };
};

// Generování ověřovacího tokenu
const generateVerificationToken = (email) => {
  const secret = process.env.GDPR_JWT_SECRET || 'fallback-secret-key';
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex') + ':' + timestamp;
};

// Ověření tokenu
const verifyToken = (token, email) => {
  try {
    const [hash, timestamp] = token.split(':');
    const secret = process.env.GDPR_JWT_SECRET || 'fallback-secret-key';
    const data = `${email}:${timestamp}`;
    
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
    
    // Token je platný 24 hodin
    const isValid = hash === expectedHash && 
                   (Date.now() - parseInt(timestamp)) < 24 * 60 * 60 * 1000;
    
    return isValid;
  } catch (error) {
    return false;
  }
};

// Vytvoření CSV exportu
const generateCSVExport = (userData) => {
  const csvData = [
    ['Kategorie', 'Pole', 'Hodnota', 'Datum vytvoření'],
    ['Základní údaje', 'Email', userData.email, userData.createdAt],
    ['Základní údaje', 'Jméno', userData.name || 'Neuvedeno', userData.createdAt],
    ['Základní údaje', 'Telefon', userData.phone || 'Neuvedeno', userData.createdAt],
    ['Aktivita', 'Registrace', userData.createdAt, userData.createdAt],
    ['Aktivita', 'Poslední přihlášení', userData.lastLogin || 'Nikdy', userData.lastLogin || userData.createdAt],
    ['Předvolby', 'Newsletter', userData.preferences?.newsletter ? 'Ano' : 'Ne', userData.createdAt],
    ['Předvolby', 'Marketing', userData.preferences?.marketing ? 'Ano' : 'Ne', userData.createdAt],
  ];
  
  // Přidání aktivity logu
  if (userData.activityLog) {
    userData.activityLog.forEach(activity => {
      csvData.push([
        'Log aktivity',
        activity.action,
        activity.page || activity.form || 'N/A',
        activity.timestamp
      ]);
    });
  }
  
  return csvData.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

// Nastavení emailu
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.brevo.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Odeslání ověřovacího emailu
const sendVerificationEmail = async (email, token) => {
  const transporter = createEmailTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WEB NA MÍRU';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://webnamiru.site';
  
  const verificationUrl = `${siteUrl}/api/gdpr/export/confirm?token=${token}&email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Ověření žádosti o export dat - ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Ověření žádosti o export osobních údajů</h2>
        
        <p>Dobrý den,</p>
        
        <p>obdrželi jsme žádost o export vašich osobních údajů ze stránek <strong>${siteName}</strong>.</p>
        
        <p>Pro dokončení žádosti klikněte na následující odkaz:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Potvrdit export dat
          </a>
        </div>
        
        <p><strong>Bezpečnostní informace:</strong></p>
        <ul>
          <li>Tento odkaz je platný 24 hodin</li>
          <li>Pokud jste o export nepožádali, tento email ignorujte</li>
          <li>Data budou zaslána na tento email po ověření</li>
        </ul>
        
        <p>S pozdravem,<br>
        Tým ${siteName}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Tento email byl odeslán v souladu s GDPR. 
          Kontakt: ${process.env.GDPR_CONTROLLER_EMAIL || 'gdpr@webnamiru.site'}
        </p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// Odeslání dat emailem
const sendDataExport = async (email, csvData, userData) => {
  const transporter = createEmailTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WEB NA MÍRU';
  
  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Export vašich osobních údajů - ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Export vašich osobních údajů</h2>
        
        <p>Dobrý den,</p>
        
        <p>v příloze najdete kompletní export všech osobních údajů, které o vás zpracováváme.</p>
        
        <h3>Souhrn exportovaných dat:</h3>
        <ul>
          <li><strong>Základní údaje:</strong> Email, jméno, telefon</li>
          <li><strong>Aktivita:</strong> Registrace, přihlášení, aktivity na webu</li>
          <li><strong>Předvolby:</strong> Nastavení komunikace a souhlasy</li>
          <li><strong>Log aktivity:</strong> Historie vašich akcí na webu</li>
        </ul>
        
        <p><strong>Formát dat:</strong> CSV soubor kompatibilní s Excel</p>
        
        <p>Pokud máte jakékoliv dotazy ohledně zpracování vašich údajů, 
           kontaktujte nás na ${process.env.GDPR_CONTROLLER_EMAIL || 'gdpr@webnamiru.site'}.</p>
        
        <p>S pozdravem,<br>
        Tým ${siteName}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Export vygenerován: ${new Date().toLocaleString('cs-CZ')}<br>
          Správce údajů: ${process.env.GDPR_CONTROLLER_NAME || 'Taras Ishchuk'}<br>
          IČO: ${process.env.GDPR_CONTROLLER_ICO || '19632831'}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `osobni-udaje-export-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvData,
        contentType: 'text/csv; charset=utf-8'
      }
    ]
  };
  
  await transporter.sendMail(mailOptions);
};

// Hlavní handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda není povolena' });
  }

  try {
    const { email, name } = req.body;

    // Validace vstupu
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Platný email je povinný' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Jméno je povinné' });
    }

    // Generování a odeslání ověřovacího emailu
    const verificationToken = generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken);

    // Log žádosti (v produkci ukládejte do databáze)
    console.log(`GDPR Export request: ${email} at ${new Date().toISOString()}`);

    return res.status(200).json({
      message: 'Na váš email byl zaslán ověřovací odkaz. Klikněte na něj pro dokončení exportu dat.',
      requestId: crypto.randomUUID()
    });

  } catch (error) {
    console.error('Error processing GDPR export request:', error);
    return res.status(500).json({ 
      error: 'Nastala chyba při zpracování požadavku. Zkuste to prosím později.' 
    });
  }
}

// Export konfirmačního handleru
export const confirmHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metoda není povolena' });
  }

  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ error: 'Neplatné parametry' });
    }

    // Ověření tokenu
    if (!verifyToken(token, email)) {
      return res.status(400).json({ error: 'Neplatný nebo vypršelý token' });
    }

    // Získání dat uživatele
    const userData = await getUserData(email);
    
    if (!userData) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    // Generování CSV
    const csvData = generateCSVExport(userData);

    // Odeslání dat emailem
    await sendDataExport(email, csvData, userData);

    // Log úspěšného exportu
    console.log(`GDPR Export completed: ${email} at ${new Date().toISOString()}`);

    // Odpověď uživateli
    return res.status(200).json({
      message: 'Export dat byl úspěšně dokončen a odeslán na váš email.',
      exportedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error confirming GDPR export:', error);
    return res.status(500).json({ 
      error: 'Nastala chyba při zpracování exportu. Kontaktujte nás prosím přímo.' 
    });
  }
};