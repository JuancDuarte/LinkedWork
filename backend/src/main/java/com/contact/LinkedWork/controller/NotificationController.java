package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/test-email")
    public ResponseEntity<?> sendTestEmail(@RequestParam String to) {
        boolean ok = emailService.sendTestEmail(to);
        if (ok) {
            return ResponseEntity.ok(Map.of("mensaje", "Correo de prueba enviado a " + to));
        }
        return ResponseEntity.status(500).body(Map.of(
                "mensaje", "No se pudo enviar el correo. Revisa la consola del backend y usa contraseña de aplicación de Gmail.",
                "ayuda", "https://myaccount.google.com/apppasswords"
        ));
    }
}
