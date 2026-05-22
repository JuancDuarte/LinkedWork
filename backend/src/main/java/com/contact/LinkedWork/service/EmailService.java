package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.model.Oferta;
import java.math.BigDecimal;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final String fromEmail = "contactsoftwarelinkedwork@gmail.com";

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (mailSender == null) {
            System.err.println("JavaMailSender no está configurado. No se puede enviar correo a: " + to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "LinkedWork Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("Correo enviado exitosamente a: " + to + " con asunto: " + subject);
        } catch (Exception e) {
            System.err.println("Fallo al enviar correo a: " + to + " debido a: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendOfferNotification(String clientEmail, String clientName, String jobTitle, String workerName, BigDecimal offerPrice) {
        String subject = "¡Has recibido una nueva oferta en LinkedWork! - " + jobTitle;
        String htmlBody = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\">"
                + "  <div style=\"background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;\">"
                + "    <h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">LinkedWork</h1>"
                + "    <p style=\"color: #93c5fd; margin: 5px 0 0 0; font-size: 14px;\">¡Tu solicitud tiene un nuevo postulado!</p>"
                + "  </div>"
                + "  <div style=\"padding: 30px 20px; background-color: #ffffff;\">"
                + "    <h2 style=\"color: #1e293b; margin-top: 0; font-size: 18px;\">Hola, " + clientName + "</h2>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Un técnico se ha postulado para realizar el servicio de tu solicitud: <strong>\"" + jobTitle + "\"</strong>.</p>"
                + "    <div style=\"background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #f1f5f9;\">"
                + "      <table style=\"width: 100%; border-collapse: collapse;\">"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Técnico Postulado:</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; font-weight: 600; text-align: right;\">" + workerName + "</td>"
                + "        </tr>"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Precio Ofertado:</td>"
                + "          <td style=\"color: #10b981; padding: 5px 0; font-size: 16px; font-weight: 700; text-align: right;\">COP $" + offerPrice + "</td>"
                + "        </tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Puedes ingresar a la plataforma, revisar los detalles del técnico y proceder con el pago seguro de PayU para activar el trabajo de forma inmediata.</p>"
                + "    <div style=\"text-align: center; margin-top: 30px;\">"
                + "      <a href=\"http://localhost:4200/requests\" style=\"background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; transition: background-color 0.2s;\">Ver Postulaciones</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;\">"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 0;\">Este es un correo automático, por favor no respondas a este mensaje.</p>"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;\">&copy; 2026 LinkedWork S.A.S. Todos los derechos reservados.</p>"
                + "  </div>"
                + "</div>";

        sendHtmlEmail(clientEmail, subject, htmlBody);
    }

    @Async
    public void sendPaymentSuccessNotificationToClient(String clientEmail, String clientName, String jobTitle, String workerName, BigDecimal totalAmount, BigDecimal fee, BigDecimal subtotal, String referenceCode) {
        String subject = "¡Pago Exitoso y Servicio Activado! - " + jobTitle;
        String htmlBody = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\">"
                + "  <div style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;\">"
                + "    <h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">LinkedWork</h1>"
                + "    <p style=\"color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;\">¡Confirmación de Pago Exitoso!</p>"
                + "  </div>"
                + "  <div style=\"padding: 30px 20px; background-color: #ffffff;\">"
                + "    <h2 style=\"color: #1e293b; margin-top: 0; font-size: 18px;\">Hola, " + clientName + "</h2>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Tu pago para el servicio <strong>\"" + jobTitle + "\"</strong> ha sido procesado de manera exitosa a través de PayU. El trabajo ha sido activado y el técnico ha sido notificado.</p>"
                + "    <div style=\"background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #f1f5f9;\">"
                + "      <h3 style=\"color: #1e293b; font-size: 15px; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;\">Detalle del Recibo</h3>"
                + "      <table style=\"width: 100%; border-collapse: collapse;\">"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Referencia LinkedWork:</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; font-weight: 600; text-align: right;\">" + referenceCode + "</td>"
                + "        </tr>"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Técnico:</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; font-weight: 600; text-align: right;\">" + workerName + "</td>"
                + "        </tr>"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Valor del Servicio:</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; text-align: right;\">COP $" + subtotal + "</td>"
                + "        </tr>"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Comisión de Plataforma (5%):</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; text-align: right;\">COP $" + fee + "</td>"
                + "        </tr>"
                + "        <tr style=\"border-top: 1px solid #e2e8f0;\">"
                + "          <td style=\"color: #1e293b; padding: 10px 0 0 0; font-size: 14px; font-weight: bold;\">Total Pagado (IVA Incl.):</td>"
                + "          <td style=\"color: #10b981; padding: 10px 0 0 0; font-size: 16px; font-weight: 700; text-align: right;\">COP $" + totalAmount + "</td>"
                + "        </tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Ya puedes coordinar los detalles de logística, hora de encuentro y dirección exacta con el técnico en la sección de trabajos activos.</p>"
                + "    <div style=\"text-align: center; margin-top: 30px;\">"
                + "      <a href=\"http://localhost:4200/active-jobs\" style=\"background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;\">Ir a Trabajos Activos</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;\">"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 0;\">Este es un correo automático, por favor no respondas a este mensaje.</p>"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;\">&copy; 2026 LinkedWork S.A.S. Todos los derechos reservados.</p>"
                + "  </div>"
                + "</div>";

        sendHtmlEmail(clientEmail, subject, htmlBody);
    }

    @Async
    public void sendPaymentSuccessNotificationToWorker(String workerEmail, String workerName, String jobTitle, String clientName, BigDecimal workerNet, String referenceCode) {
        String subject = "¡Nuevo Trabajo Asignado! Pago Realizado - " + jobTitle;
        String htmlBody = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\">"
                + "  <div style=\"background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center;\">"
                + "    <h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">LinkedWork</h1>"
                + "    <p style=\"color: #93c5fd; margin: 5px 0 0 0; font-size: 14px;\">¡Tienes un nuevo trabajo activo!</p>"
                + "  </div>"
                + "  <div style=\"padding: 30px 20px; background-color: #ffffff;\">"
                + "    <h2 style=\"color: #1e293b; margin-top: 0; font-size: 18px;\">Hola, " + workerName + "</h2>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">El cliente <strong>" + clientName + "</strong> ha aceptado tu oferta y realizado el pago de forma segura para la solicitud: <strong>\"" + jobTitle + "\"</strong>.</p>"
                + "    <div style=\"background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #f1f5f9;\">"
                + "      <h3 style=\"color: #1e293b; font-size: 15px; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;\">Detalles de Ganancias</h3>"
                + "      <table style=\"width: 100%; border-collapse: collapse;\">"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Referencia de Pago:</td>"
                + "          <td style=\"color: #1e293b; padding: 5px 0; font-size: 14px; font-weight: 600; text-align: right;\">" + referenceCode + "</td>"
                + "        </tr>"
                + "        <tr>"
                + "          <td style=\"color: #64748b; padding: 5px 0; font-size: 14px;\">Tu Ganancia Neta (Oferta - 5% fee):</td>"
                + "          <td style=\"color: #10b981; padding: 5px 0; font-size: 16px; font-weight: 700; text-align: right;\">COP $" + workerNet + "</td>"
                + "        </tr>"
                + "      </table>"
                + "    </div>"
                + "    <p style=\"color: #475569; line-height: 1.6;\"><strong>Importante:</strong> El cliente ya puede registrar la dirección exacta de encuentro, hora coordinada y notas adicionales. Por favor revisa los detalles en tu panel de trabajos activos y mantente en comunicación.</p>"
                + "    <div style=\"text-align: center; margin-top: 30px;\">"
                + "      <a href=\"http://localhost:4200/active-jobs\" style=\"background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;\">Ver Panel de Trabajos</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;\">"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 0;\">Este es un correo automático, por favor no respondas a este mensaje.</p>"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;\">&copy; 2026 LinkedWork S.A.S. Todos los derechos reservados.</p>"
                + "  </div>"
                + "</div>";

        sendHtmlEmail(workerEmail, subject, htmlBody);
    }

    @Async
    public void sendJobFinishedNotification(String clientEmail, String clientName, String workerEmail, String workerName, String jobTitle, boolean isClient) {
        String recipientEmail = isClient ? clientEmail : workerEmail;
        String recipientName = isClient ? clientName : workerName;
        String subject = "¡Trabajo Finalizado Exitosamente! - " + jobTitle;
        String htmlBody = "<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\">"
                + "  <div style=\"background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 30px 20px; text-align: center;\">"
                + "    <h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;\">LinkedWork</h1>"
                + "    <p style=\"color: #c7d2fe; margin: 5px 0 0 0; font-size: 14px;\">¡Servicio finalizado con éxito!</p>"
                + "  </div>"
                + "  <div style=\"padding: 30px 20px; background-color: #ffffff;\">"
                + "    <h2 style=\"color: #1e293b; margin-top: 0; font-size: 18px;\">Hola, " + recipientName + "</h2>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Queremos informarte que el trabajo <strong>\"" + jobTitle + "\"</strong> ha sido marcado como <strong>Finalizado</strong>.</p>"
                + "    <p style=\"color: #475569; line-height: 1.6;\">Agradecemos tu preferencia y confianza en LinkedWork. Te invitamos a ingresar a la plataforma para calificar el desempeño del servicio y dejar tus comentarios sobre la experiencia.</p>"
                + "    <div style=\"text-align: center; margin-top: 30px;\">"
                + "      <a href=\"http://localhost:4200/active-jobs\" style=\"background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;\">Dejar Calificación</a>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;\">"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 0;\">Este es un correo automático, por favor no respondas a este mensaje.</p>"
                + "    <p style=\"color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;\">&copy; 2026 LinkedWork S.A.S. Todos los derechos reservados.</p>"
                + "  </div>"
                + "</div>";

        sendHtmlEmail(recipientEmail, subject, htmlBody);
    }
}
