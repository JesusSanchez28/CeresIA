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
    const resendKey = (process.env.RESEND_API_KEY || '').trim();

    // 1. Prioridad en producción (Render): envío vía API HTTPS de Resend (no bloqueado por firewall SMTP)
    if (resendKey) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'CeresIA AgroTech <onboarding@resend.dev>',
                    to: [correoDestino],
                    subject: asunto,
                    html
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error API Resend:', data);
                return false;
            }

            console.log(`✅ Correo enviado vía Resend a ${correoDestino} (ID: ${data.id})`);
            return true;
        } catch (error) {
            console.error('❌ Error de red llamando a Resend:', error.message);
            return false;
        }
    }

    // 2. Respaldo en entorno local: envío vía Gmail SMTP con Nodemailer
    const transporter = crearTransporter();

    if (!transporter) {
        console.warn('⚠️ Falta configurar RESEND_API_KEY o EMAIL_USER/EMAIL_PASS');
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

        console.log(`✅ Correo real enviado vía SMTP a ${correoDestino} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('❌ Error real enviando correo SMTP:', error.message);
        return false;
    }
};

module.exports = { enviarCodigoVerificacion };