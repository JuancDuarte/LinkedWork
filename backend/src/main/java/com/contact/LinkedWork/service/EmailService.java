package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service("EmailService")
@Transactional
public class EmailService {

    @Value("${linkedwork.mail.webhook-url}")
    private String webhookUrl;

    @Value("${linkedwork.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${linkedwork.mail.from:contactsoftwarelinkedwork@gmail.com}")
    private String fromEmail;

    @Value("${linkedwork.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!mailEnabled) {
            System.out.println("[Email] Deshabilitado. Para: " + to + " | Asunto: " + subject);
            return false;
        }
        if (to == null || to.isBlank()) {
            System.err.println("[Email] Destinatario vacío. Asunto: " + subject);
            return false;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> body = new HashMap<>();
            body.put("to", to.trim());
            body.put("subject", subject);
            body.put("htmlBody", htmlBody);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            String response = restTemplate.postForObject(webhookUrl, request, String.class);
            System.out.println("[Email] Webhook OK -> " + to + " | " + subject);
            return true;
        } catch (Exception e) {
            System.err.println("[Email] FALLO Webhook -> " + to + " | " + subject + " | " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Async("mailExecutor")
    public void sendSolicitudCreada(String clientEmail, String clientName, String jobTitle) {
        String subject = "Tu solicitud fue publicada - " + jobTitle;
        String htmlBody = buildWrapper(clientName,
                "Tu solicitud <strong>\"" + jobTitle + "\"</strong> ha sido publicada. Los técnicos de tu área pueden postularse.",
                frontendUrl + "/requests", "Ver mis solicitudes");
        sendHtmlEmail(clientEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendOfferNotification(String clientEmail, String clientName, String jobTitle, String workerName, BigDecimal offerPrice) {
        String subject = "Nueva oferta en tu solicitud - " + jobTitle;
        String htmlBody = buildWrapper(clientName,
                "El técnico <strong>" + workerName + "</strong> se postuló a \"" + jobTitle + "\" por <strong>COP $" + offerPrice + "</strong>.",
                frontendUrl + "/requests", "Ver postulaciones");
        sendHtmlEmail(clientEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendPaymentSuccessNotificationToClient(String clientEmail, String clientName, String jobTitle, String workerName,
            BigDecimal totalAmount, BigDecimal fee, BigDecimal subtotal, String referenceCode) {
        String subject = "Pago exitoso - " + jobTitle;
        String htmlBody = buildWrapper(clientName,
                "Pago confirmado (ref. " + referenceCode + "). Técnico: <strong>" + workerName + "</strong>. Total: <strong>COP $" + totalAmount + "</strong> (servicio $" + subtotal + " + comisión $" + fee + ").",
                frontendUrl + "/active-jobs", "Ir a trabajos activos");
        sendHtmlEmail(clientEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendPaymentSuccessNotificationToWorker(String workerEmail, String workerName, String jobTitle, String clientName,
            BigDecimal workerNet, String referenceCode) {
        String subject = "Nuevo trabajo asignado - " + jobTitle;
        String htmlBody = buildWrapper(workerName,
                "El cliente <strong>" + clientName + "</strong> pagó el servicio \"" + jobTitle + "\" (ref. " + referenceCode + "). Tu ganancia: <strong>COP $" + workerNet + "</strong>.",
                "http://localhost:4200/active-jobs", "Ver trabajos activos");
        sendHtmlEmail(workerEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendWorkerApplicationConfirmation(String workerEmail, String workerName, String jobTitle, String clientName, BigDecimal offerPrice) {
        String subject = "Postulación enviada - " + jobTitle;
        String htmlBody = buildWrapper(workerName,
                "Te postulaste a \"" + jobTitle + "\" del cliente <strong>" + clientName + "</strong> por COP $" + offerPrice + ". Te avisaremos cuando pague.",
                frontendUrl + "/postulations", "Mis postulaciones");
        sendHtmlEmail(workerEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendNewSolicitudInAreaToWorker(String workerEmail, String workerName, String jobTitle, String areaName, String clientName, BigDecimal budget) {
        String budgetText = budget != null ? "COP $" + budget : "A convenir";
        String subject = "Nueva solicitud en " + areaName + " - " + jobTitle;
        String htmlBody = buildWrapper(workerName,
                "Nueva solicitud en tu área: <strong>\"" + jobTitle + "\"</strong> de " + clientName + ". Presupuesto: " + budgetText + ".",
                frontendUrl + "/requests", "Ver y postularme");
        sendHtmlEmail(workerEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendDirectSolicitudToWorker(String workerEmail, String workerName, String jobTitle, String clientName) {
        String subject = "Solicitud directa para ti - " + jobTitle;
        String htmlBody = buildWrapper(workerName,
                "<strong>" + clientName + "</strong> te envió una solicitud directa: \"" + jobTitle + "\".",
                frontendUrl + "/requests", "Ver solicitud");
        sendHtmlEmail(workerEmail, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendJobFinishedNotification(String clientEmail, String clientName, String workerEmail, String workerName, String jobTitle, boolean isClient) {
        String recipientEmail = isClient ? clientEmail : workerEmail;
        String recipientName = isClient ? clientName : workerName;
        String subject = "Trabajo finalizado - " + jobTitle;
        String htmlBody = buildWrapper(recipientName,
                "El trabajo <strong>\"" + jobTitle + "\"</strong> fue marcado como finalizado. Deja tu calificación.",
                frontendUrl + "/active-jobs", "Calificar");
        sendHtmlEmail(recipientEmail, subject, htmlBody);
    }

    public boolean sendTestEmail(String to) {
        return sendHtmlEmail(to, "Prueba LinkedWork", buildWrapper("Usuario",
                "Si recibes este correo, el SMTP de LinkedWork está configurado correctamente.",
                frontendUrl, "Abrir LinkedWork"));
    }

    @Async("mailExecutor")
    public void sendEmailVerification(String email, String name, String token) {
        String verifyUrl = frontendUrl + "/auth?verify=" + token;
        String subject = "Confirma tu correo - LinkedWork";
        String htmlBody = buildWrapper(name != null ? name : "Usuario",
                "Gracias por registrarte. Haz clic en el botón para verificar tu correo y activar tu cuenta.",
                verifyUrl, "Verificar correo electrónico");
        sendHtmlEmail(email, subject, htmlBody);
    }

    @Async("mailExecutor")
    public void sendLoginNotification(String email, String name) {
        String subject = "Inicio de sesión en LinkedWork";
        String htmlBody = buildWrapper(name != null ? name : "Usuario",
                "Se detectó un inicio de sesión en tu cuenta. Si no fuiste tú, cambia tu contraseña de inmediato.",
                frontendUrl + "/auth", "Ir a LinkedWork");
        sendHtmlEmail(email, subject, htmlBody);
    }

    private String buildWrapper(String name, String body, String link, String linkText) {
        return "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden\">"
                + "<div style=\"background:linear-gradient(135deg,#8a1c61,#6c2bd9);padding:24px;text-align:center\">"
                + "<h1 style=\"color:#fff;margin:0\">LinkedWork</h1></div>"
                + "<div style=\"padding:24px\"><h2 style=\"margin-top:0\">Hola, " + name + "</h2>"
                + "<p style=\"color:#475569;line-height:1.6\">" + body + "</p>"
                + "<p style=\"text-align:center;margin-top:24px\"><a href=\"" + link + "\" style=\"background:#8a1c61;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700\">"
                + linkText + "</a></p></div></div>";
    }
}
