package com.contact.LinkedWork.service;

import com.contact.LinkedWork.model.Pago;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.repository.PagoRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.OfertaRepository;
import com.contact.LinkedWork.dto.PaymentInitiateDTO;
import com.contact.LinkedWork.dto.PayUPayloadDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    @Autowired
    @Qualifier("CrudPagoRepository")
    private PagoRepository pagoRepository;

    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudOfertaRepository")
    private OfertaRepository ofertaRepository;

    @Autowired
    @Qualifier("OfertaService")
    private OfertaService ofertaService;

    @Autowired
    private EmailService emailService;

    @Value("${payu.merchantId}")
    private String merchantId;

    @Value("${payu.accountId}")
    private String accountId;

    @Value("${payu.apiKey}")
    private String apiKey;

    @Value("${payu.checkoutUrl}")
    private String checkoutUrl;

    @Value("${payu.currency:COP}")
    private String currency;

    @Value("${payu.commission.percentage:5.0}")
    private double commissionPercentage;

    @Value("${payu.responseUrl}")
    private String responseUrl;

    @Value("${payu.confirmationUrl}")
    private String confirmationUrl;

    public PayUPayloadDTO initiatePayment(PaymentInitiateDTO initiateDTO) {
        Solicitud solicitud = solicitudRepository.findById(initiateDTO.getIdSolicitud())
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + initiateDTO.getIdSolicitud()));
        
        Oferta oferta = ofertaRepository.findById(initiateDTO.getIdOferta())
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + initiateDTO.getIdOferta()));

        if (!"Pendiente".equalsIgnoreCase(solicitud.getEstado())) {
            throw new RuntimeException("La solicitud ya no se encuentra pendiente o ya fue pagada.");
        }

        BigDecimal precioOferta = oferta.getPrecio();
        BigDecimal comision = precioOferta.multiply(BigDecimal.valueOf(commissionPercentage / 100.0)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = precioOferta.add(comision).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montoNeto = precioOferta;

        String referenceCode = "LW-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();

        // Calculate PayU MD5 Signature
        // Format: ApiKey~MerchantId~Reference~Amount~Currency
        String formattedAmount = String.format(java.util.Locale.US, "%.1f", totalAmount);
        String signatureSource = apiKey + "~" + merchantId + "~" + referenceCode + "~" + formattedAmount + "~" + currency;
        String signature = calculateMD5(signatureSource);

        // Save Pago Record
        Pago pago = new Pago();
        pago.setSolicitud(solicitud);
        pago.setUsuario(solicitud.getUsuario());
        pago.setOferta(oferta);
        pago.setMonto(totalAmount);
        pago.setComision(comision);
        pago.setMontoNeto(montoNeto);
        pago.setReferenciaPago(referenceCode);
        pago.setEstadoPago("Pendiente");
        pagoRepository.save(pago);

        // Build Payload DTO
        PayUPayloadDTO payload = new PayUPayloadDTO();
        payload.setMerchantId(merchantId);
        payload.setAccountId(accountId);
        payload.setDescription("Servicio tecnico LinkedWork: " + solicitud.getTitulo());
        payload.setReferenceCode(referenceCode);
        payload.setAmount(totalAmount);
        payload.setCurrency(currency);
        payload.setSignature(signature);
        payload.setTest(1); // 1 for sandbox testing
        payload.setBuyerEmail(solicitud.getUsuario().getEmail() != null ? solicitud.getUsuario().getEmail() : "contactsoftwarelinkedwork@gmail.com");
        payload.setResponseUrl(responseUrl);
        payload.setConfirmationUrl(confirmationUrl);
        payload.setCheckoutUrl(checkoutUrl);

        // Breakdown details
        payload.setComision(comision);
        payload.setMontoNeto(montoNeto);
        payload.setPrecioOferta(precioOferta);

        return payload;
    }

    public void processConfirmation(Map<String, String> payuParams) {
        String referenceCode = payuParams.get("reference_sale");
        String state = payuParams.get("state_pol"); // 4 = APPROVED
        String responseCode = payuParams.get("response_code_pol");
        String paymentMethod = payuParams.get("payment_method_type");

        Pago pago = pagoRepository.findByReferenciaPago(referenceCode)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para la referencia: " + referenceCode));

        if (!"Pendiente".equalsIgnoreCase(pago.getEstadoPago())) {
            // Already processed
            return;
        }

        if ("4".equals(state)) {
            approvePaymentAndActivateJob(pago, paymentMethod);
        } else {
            pago.setEstadoPago("Rechazado");
            pagoRepository.save(pago);
        }
    }

    public void simulatePaymentSuccess(String referenceCode) {
        Pago pago = pagoRepository.findByReferenciaPago(referenceCode)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para la referencia: " + referenceCode));

        if (!"Pendiente".equalsIgnoreCase(pago.getEstadoPago())) {
            throw new RuntimeException("El pago con la referencia " + referenceCode + " ya ha sido procesado (" + pago.getEstadoPago() + ").");
        }

        approvePaymentAndActivateJob(pago, "Simulacion Local (PayU Sandbox)");
    }

    private void approvePaymentAndActivateJob(Pago pago, String paymentMethod) {
        pago.setEstadoPago("Aprobado");
        pago.setMetodoPago(paymentMethod);
        pagoRepository.save(pago);

        Solicitud solicitud = pago.getSolicitud();
        Oferta oferta = pago.getOferta();
        
        // Accept the offer, update the Solicitud, and reject other offers
        ofertaService.aceptarOferta(solicitud.getIdSolicitud(), oferta.getIdOferta(), solicitud.getUsuario().getIdUsuario());

        // Notify client and worker asynchronously
        try {
            if (solicitud.getUsuario() != null && solicitud.getUsuario().getEmail() != null) {
                String clientEmail = solicitud.getUsuario().getEmail();
                String clientName = solicitud.getUsuario().getNombreCompleto() != null
                        ? solicitud.getUsuario().getNombreCompleto()
                        : solicitud.getUsuario().getNombreUsuario();
                String workerEmail = oferta.getTrabajador().getUsuario().getEmail();
                String workerName = oferta.getTrabajador().getUsuario().getNombreCompleto() != null
                        ? oferta.getTrabajador().getUsuario().getNombreCompleto()
                        : oferta.getTrabajador().getUsuario().getNombreUsuario();

                BigDecimal subtotal = oferta.getPrecio();
                BigDecimal comision = pago.getComision();
                BigDecimal totalAmount = pago.getMonto();
                BigDecimal workerNet = subtotal; // Worker gets full offer amount, comision was added on top

                // Send to client
                emailService.sendPaymentSuccessNotificationToClient(
                    clientEmail, clientName, solicitud.getTitulo(), workerName, totalAmount, comision, subtotal, pago.getReferenciaPago()
                );

                // Send to worker
                emailService.sendPaymentSuccessNotificationToWorker(
                    workerEmail, workerName, solicitud.getTitulo(), clientName, workerNet, pago.getReferenciaPago()
                );
            }
        } catch (Exception e) {
            System.err.println("Error al enviar correos de confirmacion de pago: " + e.getMessage());
        }
    }

    private String calculateMD5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashInBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashInBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al calcular firma MD5", e);
        }
    }
}
