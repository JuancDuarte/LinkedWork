package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.dto.PaymentInitiateDTO;
import com.contact.LinkedWork.dto.PayUPayloadDTO;
import com.contact.LinkedWork.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping(path = "/initiate", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentInitiateDTO initiateDTO) {
        try {
            PayUPayloadDTO payload = paymentService.initiatePayment(initiateDTO);
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping(path = "/confirmation", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<?> processConfirmation(@RequestParam Map<String, String> params) {
        System.out.println("====== WEBHOOK CONFIRMACION PAYU RECIBIDO ======");
        params.forEach((key, val) -> System.out.println(key + " : " + val));
        try {
            paymentService.processConfirmation(params);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error procesando confirmacion PayU: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping(path = "/simulate-success", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> simulateSuccess(@RequestBody Map<String, String> payload) {
        String referenceCode = payload.get("referenceCode");
        if (referenceCode == null || referenceCode.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", "La referencia de pago es obligatoria."));
        }
        try {
            paymentService.simulatePaymentSuccess(referenceCode);
            return ResponseEntity.ok(Map.of("mensaje", "Simulacion de pago exitosa procesada. El trabajo esta activo."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensaje", e.getMessage()));
        }
    }
}
