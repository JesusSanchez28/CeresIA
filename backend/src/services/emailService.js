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

const enviarCodigoVerificacion = async (correoDestino, nombre, codigo) => {
    const transporter = crearTransporter();

    if (!transporter) {
        console.warn('⚠️ Falta configurar EMAIL_USER o EMAIL_PASS en backend/.env');
        console.log(`📧 [Modo local] Código para ${correoDestino}: ${codigo}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"CeresIA AgroTech 🌱" <${process.env.EMAIL_USER.trim()}>`,
            to: correoDestino,
            subject: `${codigo} es tu código de verificación de CeresIA`,
            html: `
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
            `
        });

        console.log(`✅ Correo real enviado a ${correoDestino} (ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('❌ Error real enviando correo SMTP:', error.message);
        return false;
    }
};

module.exports = { enviarCodigoVerificacion };