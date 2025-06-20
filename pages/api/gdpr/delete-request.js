// pages/api/gdpr/delete-request.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Simulace databáze - nahraďte skutečnou databázovou logikou
const findUserByEmail = async (email) => {
  // Zde by byl dotaz do vaší databáze
  // Vracíme true pokud uživatel existuje
  return email && email.includes('@');
};

// Anonymizace/smazání dat uživatele
const deleteUserData = async (email, verifiedRequest) => {
  try {
    // V produkční aplikaci zde implementujte:
    
    // 1. Smazání z hlavní databáze
    // await db.users.delete({ where: { email } });
    
    // 2. Smazání z analytics
    // await analytics.deleteUser(userId);
    
    // 3. Smazání z email marketingu  
    // await emailService.deleteContact(email);
    
    // 4. Smazání z logovacích systémů
    // await logs.anonymizeUser(userId);
    
    // 5. Smazání z external služeb
    // await externalServices.deleteUser(userId);
    
    // Pro demo účely pouze logujeme
    console.log(`User data deletion completed for: ${email}`);
    console.log(`Verification details:`, verifiedRequest);
    
    return {
      success: true,
      deletedAt: new Date().toISOString(),
      deletedData: [
        'Základní údaje (email, jméno, telefon)',
        'History aktivit a logů',
        'Předvolby a nastavení',
        'Cookies a session data',
        'Analytická data',
        'Email marketing data'
      ]
    };
    
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

// Generování ověřovacího tokenu
const generateDeletionToken = (email, name) => {
  const secret = process.env.GDPR_JWT_SECRET || 'fallback-secret-key';
  const timestamp = Date.now();
  const data = `${email}:${name}:${timestamp}:delete`;
  
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex') + ':' + timestamp;
};

// Ověření tokenu
const verifyDeletionToken = (token, email, name) => {
  try {
    const [hash, timestamp] = token.split(':');
    const secret = process.env.GDPR_JWT_SECRET || 'fallback-secret-key';
    const data = `${email}:${name}:${timestamp}:delete`;
    
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
    
    // Token je platný 48 hodin (delší doba kvůli závažnosti akce)
    const isValid = hash === expectedHash && 
                   (Date.now() - parseInt(timestamp)) < 48 * 60 * 60 * 1000;
    
    return isValid;
  } catch (error) {
    return false;
  }
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

// Odeslání ověřovacího emailu pro smazání
const sendDeletionVerificationEmail = async (email, name, token) => {
  const transporter = createEmailTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WEB NA MÍRU';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://webnamiru.site';
  
  const verificationUrl = `${siteUrl}/api/gdpr/delete-request/confirm?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
  
  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `⚠️ DŮLEŽITÉ: Potvrzení smazání účtu - ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h2 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ Potvrzení smazání osobních údajů</h2>
          <p style="color: #991b1b; margin: 0;"><strong>Tato akce je nevratná!</strong></p>
        </div>
        
        <p>Dobrý den <strong>${name}</strong>,</p>
        
        <p>obdrželi jsme žádost o <strong>úplné smazání</strong> vašich osobních údajů ze stránek <strong>${siteName}</strong>.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 12px 0;">Co bude smazáno:</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Všechny osobní údaje (email, jméno, telefon)</li>
            <li>Historie aktivit a komunikace</li>
            <li>Předvolby a nastavení</li>
            <li>Analytická data</li>
            <li>Veškerý obsah přiřazený k vašemu účtu</li>
          </ul>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0;">⚠️ Důležité upozornění:</h3>
          <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
            <li><strong>Smazání je nevratné</strong> - data nelze obnovit</li>
            <li>Ztratíte přístup ke všem našim službám</li>
            <li>Budoucí komunikace nebude možná</li>
            <li>Tento proces může trvat až 30 dní</li>
          </ul>
        </div>
        
        <p><strong>Pokud si jste jisti, že chcete pokračovat:</strong></p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: bold;">
            ⚠️ POTVRDIT SMAZÁNÍ ÚDAJŮ
          </a>
        </div>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0;">Bezpečnostní informace:</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li>Tento odkaz je platný <strong>48 hodin</strong></li>
            <li>Pokud jste o smazání nepožádali, tento email <strong>ignorujte</strong></li>
            <li>Alternativně nás kontaktujte přímo</li>
          </ul>
        </div>
        
        <p><strong>Změnili jste si to?</strong><br>
        Pokud nechcete své údaje mazat, jednoduše tento email ignorujte. 
        Vaš účet zůstane aktivní a žádná data nebudou smazána.</p>
        
        <p>Pro jakékoliv dotazy nás kontaktujte na:<br>
        📧 ${process.env.GDPR_CONTROLLER_EMAIL || 'gdpr@webnamiru.site'}<br>
        📞 ${process.env.GDPR_CONTROLLER_PHONE || '+420 777596216'}</p>
        
        <p>S pozdravem,<br>
        Tým ${siteName}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Tento email byl odeslán v souladu s GDPR článek 17 (právo na výmaz).<br>
          Správce: ${process.env.GDPR_CONTROLLER_NAME || 'Taras Ishchuk'}, 
          IČO: ${process.env.GDPR_CONTROLLER_ICO || '19632831'}
        </p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// Odeslání potvrzení o smazání
const sendDeletionConfirmationEmail = async (email, name, deletionResult) => {
  const transporter = createEmailTransporter();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WEB NA MÍRU';
  
  const mailOptions = {
    from: `"${siteName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `✅ Potvrzení smazání údajů - ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h2 style="color: #166534; margin: 0 0 8px 0;">✅ Údaje byly úspěšně smazány</h2>
        </div>
        
        <p>Dobrý den <strong>${name}</strong>,</p>
        
        <p>vaše žádost o smazání osobních údajů byla <strong>úspěšně zpracována</strong>.</p>
        
        <h3>Smazaná data:</h3>
        <ul>
          ${deletionResult.deletedData.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 12px 0;">📋 Shrnutí procesu:</h3>
          <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
            <li><strong>Datum smazání:</strong> ${new Date(deletionResult.deletedAt).toLocaleString('cs-CZ')}</li>
            <li><strong>Rozsah:</strong> Všechna osobní data</li>
            <li><strong>Status:</strong> Kompletní</li>
          </ul>
        </div>
        
        <h3>Co se stalo:</h3>
        <ul>
          <li>✅ Osobní údaje smazány z hlavní databáze</li>
          <li>✅ Data anonymizována v analytických systémech</li>
          <li>✅ Odebrání z email marketingu</li>
          <li>✅ Smazání ze záloh (bude dokončeno do 30 dnů)</li>
          <li>✅ Anonymizace v logovacích systémech</li>
        </ul>
        
        <div style="background-color: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #a16207; margin: 0 0 12px 0;">ℹ️ Důležité informace:</h3>
          <ul style="color: #a16207; margin: 0; padding-left: 20px;">
            <li>Některá data mohou být zákonně uchována pro daňové účely (podle § 31 zákona o účetnictví)</li>
            <li>Anonymizované statistiky nejsou považovány za osobní údaje</li>
            <li>V případě budoucí spolupráce budete muset vytvořit nový účet</li>
          </ul>
        </div>
        
        <p><strong>Máte dotazy?</strong><br>
        I přesto, že vaše údaje byly smazány, můžete nás stále kontaktovat ohledně tohoto procesu:</p>
        
        <p>📧 ${process.env.GDPR_CONTROLLER_EMAIL || 'gdpr@webnamiru.site'}<br>
        📞 ${process.env.GDPR_CONTROLLER_PHONE || '+420 777596216'}</p>
        
        <p>Děkujeme za důvěru, kterou jste nám projevili během našeho obchodního vztahu.</p>
        
        <p>S pozdravem,<br>
        Tým ${siteName}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Smazání dokončeno: ${new Date().toLocaleString('cs-CZ')}<br>
          Referenční číslo: ${crypto.randomUUID()}<br>
          Tento email je posledním kontaktem v souladu s GDPR.
        </p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// Hlavní handler pro žádost o smazání
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

    // Kontrola existence uživatele
    const userExists = await findUserByEmail(email);
    if (!userExists) {
      // Z bezpečnostních důvodů neříkáme, že uživatel neexistuje
      return res.status(200).json({
        message: 'Pokud je email registrován v našem systému, byl na něj zaslán ověřovací odkaz.',
        requestId: crypto.randomUUID()
      });
    }

    // Generování a odeslání ověřovacího emailu
    const deletionToken = generateDeletionToken(email, name);
    await sendDeletionVerificationEmail(email, name, deletionToken);

    // Log žádosti (v produkci ukládejte do databáze)
    console.log(`GDPR Deletion request: ${email} (${name}) at ${new Date().toISOString()}`);

    return res.status(200).json({
      message: 'Na váš email byl zaslán ověřovací odkaz. Přečtěte si důležité informace a potvrďte smazání účtu.',
      requestId: crypto.randomUUID(),
      validFor: '48 hodin'
    });

  } catch (error) {
    console.error('Error processing GDPR deletion request:', error);
    return res.status(500).json({ 
      error: 'Nastala chyba při zpracování požadavku. Zkuste to prosím později nebo nás kontaktujte přímo.' 
    });
  }
}

// Export konfirmačního handleru
export const confirmDeletionHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metoda není povolena' });
  }

  try {
    const { token, email, name } = req.query;

    if (!token || !email || !name) {
      return res.status(400).json({ error: 'Neplatné parametry' });
    }

    // Ověření tokenu
    if (!verifyDeletionToken(token, email, name)) {
      return res.status(400).json({ 
        error: 'Neplatný nebo vypršelý token. Žádost o smazání musí být obnovena.' 
      });
    }

    // Kontrola existence uživatele
    const userExists = await findUserByEmail(email);
    if (!userExists) {
      return res.status(404).json({ error: 'Uživatel nenalezen nebo již byl smazán' });
    }

    // Smazání dat
    const deletionResult = await deleteUserData(email, {
      email,
      name,
      requestedAt: new Date().toISOString(),
      verificationMethod: 'email_token'
    });

    // Odeslání potvrzení o smazání
    await sendDeletionConfirmationEmail(email, name, deletionResult);

    // Log úspěšného smazání
    console.log(`GDPR Deletion completed: ${email} (${name}) at ${new Date().toISOString()}`);

    // Odpověď uživateli
    return res.status(200).json({
      message: 'Vaše osobní údaje byly úspěšně smazány. Potvrzení bylo odesláno na váš email.',
      deletedAt: deletionResult.deletedAt,
      referenceId: crypto.randomUUID()
    });

  } catch (error) {
    console.error('Error confirming GDPR deletion:', error);
    return res.status(500).json({ 
      error: 'Nastala chyba při smazání dat. Kontaktujte nás prosím přímo pro dokončení procesu.' 
    });
  }
};