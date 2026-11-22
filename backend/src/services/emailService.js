const nodemailer = require('nodemailer');

const crearTransporter = () => {
    const user = (process.env.EMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || '').trim();

    if (!user || !pass) return null;

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass }
    });
};

const generarPlantillaHTML = (nombre, codigo) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #d1e7dd; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #198754; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">🌿 CeresIA</h2>
            <p style="margin: 5px 0 0; font-size: 14px;">Plataforma Agroclimática Inteligente</p>
        </div>
        <div style="padding: 24px; color: #333; background-color: #ffffff;">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Usa el siguiente código de 6 dígitos para confirmar tu cuenta en <strong>CeresIA</strong>:</p>
            <div style="background: #f0fdf4; border: 2px dashed #198754; border-radius: 8px; padding: 16px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #198754; margin: 20px 0;">
                ${codigo}
            </div>
            <p style="font-size: 13px; color: #666;">Si no creaste una cuenta en CeresIA, puedes ignorar este correo de forma segura.</p>
        </div>
    </div>
`;

const enviarCodigoVerificacion = async (correoDestino, nombre, codigo) => {
    const asunto = `${codigo} es tu código de verificación de CeresIA`;
    const html = generarPlantillaHTML(nombre, codigo);
    const brevoKey = (process.env.BREVO_API_KEY || '').trim();
    const brevoSender = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || '').trim();

    // 1. Producción (Render): envío vía API HTTPS de Brevo a CUALQUIER destinatario sin dominio propio
    if (brevoKey && brevoSender) {
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': brevoKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'CeresIA AgroTech', email: brevoSender },
                    to: [{ email: correoDestino, name: nombre }],
                    subject: asunto,
                    htmlContent: html
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error API Brevo:', data);
                return false;
            }

            console.log(`✅ Correo enviado vía Brevo a ${correoDestino} (ID: ${data.messageId})`);
            return true;
        } catch (error) {
            console.error('❌ Error de red llamando a Brevo:', error.message);
            return false;
        }
    }

    // 2. Respaldo local: Gmail SMTP con Nodemailer
    const transporter = crearTransporter();
    if (!transporter) {
        console.warn('⚠️ Falta configurar BREVO_API_KEY o EMAIL_USER/EMAIL_PASS');
        console.log(`📧 [Modo local] Código para ${correoDestino}: ${codigo}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"CeresIA AgroTech 🌱" <${process.env.EMAIL_USER.trim()}>`,
            to: correoDestino,
            subject: asunto,
            html
        });

        console.log(`✅ Correo enviado vía SMTP a ${correoDestino} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo SMTP:', error.message);
        return false;
    }
};

module.exports = { enviarCodigoVerificacion };