package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.model.*;
import com.contact.LinkedWork.repository.*;
import com.contact.LinkedWork.service.PuntuacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/farming")
@CrossOrigin(origins = "*")
public class CertificationController {

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    @Qualifier("PuntuacionService")
    private PuntuacionService puntuacionService;

    @Autowired
    private CertificadoRepository certificadoRepository;

    @GetMapping("/content/{area}")
    public ResponseEntity<?> getCertificationContent(@PathVariable String area) {
        Map<String, Object> response = new HashMap<>();
        
        if ("electricidad".equalsIgnoreCase(area)) {
            response.put("titulo", "Certificación en Electricidad Residencial");
            response.put("documentacion", Arrays.asList(
                createModule("Seguridad Eléctrica", "Uso de EPP y protocolos de seguridad.", "Aprenderás sobre el uso correcto de Guantes Dieléctricos, Cascos de Seguridad y el protocolo LOTO (Bloqueo y Etiquetado) para trabajar sin tensión. La seguridad es lo primero."),
                createModule("Circuitos Básicos", "Diferencia entre serie y paralelo.", "Análisis profundo de la Ley de Ohm, cálculo de caída de tensión y por qué en una vivienda todo debe ir en paralelo para mantener el voltaje constante."),
                createModule("Normativa y Código", "Requisitos técnicos y protecciones.", "Estudio del código eléctrico nacional: uso de interruptores termomagnéticos, protecciones diferenciales y la importancia vital de la puesta a tierra.")
            ));
            response.put("preguntas", Arrays.asList(
                createQuestion("¿Cuál es el color estándar del cable de tierra?", Arrays.asList("Verde o verde/amarillo", "Rojo", "Azul", "Negro"), 0),
                createQuestion("¿Qué dispositivo protege contra sobrecargas?", Arrays.asList("Interruptor termomagnético", "Multímetro", "Interruptor simple", "Tomacorriente"), 0),
                createQuestion("¿En qué unidad se mide la potencia eléctrica?", Arrays.asList("Watts", "Volts", "Amperios", "Ohmios"), 0),
                createQuestion("¿Qué significa GFCI?", Arrays.asList("Interruptor de falla a tierra", "Generador de flujo constante", "Gran fusible de corriente interna", "Garantía de funcionamiento continuo"), 0),
                createQuestion("¿Cuál es el voltaje estándar residencial en la mayoría de Latinoamérica?", Arrays.asList("110V - 120V", "220V - 240V", "50V", "380V"), 0)
            ));
        } else if ("fontaneria".equalsIgnoreCase(area)) {
            response.put("titulo", "Certificación en Fontanería");
            response.put("documentacion", Arrays.asList(
                createModule("Sistemas de Abasto", "Tipos de tuberías y sus aplicaciones.", "Diferencias entre PVC (desagüe), CPVC (agua caliente), Cobre y PEX. Sabrás qué material elegir según la presión y temperatura."),
                createModule("Drenaje y Ventilación", "Sellos hidráulicos y pendientes.", "Técnicas para instalar sifones que eviten malos olores y cálculo de pendientes mínimas (2%) para un drenaje eficiente por gravedad."),
                createModule("Mantenimiento", "Detección y sellado de fugas.", "Uso de cinta teflón, selladores químicos y sustitución de empaques en grifería de última generación.")
            ));
            response.put("preguntas", Arrays.asList(
                createQuestion("¿Qué material se recomienda para agua caliente?", Arrays.asList("CPVC o Cobre", "PVC estándar", "Plomo", "Manguera de jardín"), 0),
                createQuestion("¿Cuál es la función del sifón?", Arrays.asList("Evitar el paso de malos olores", "Aumentar la presión", "Filtrar el agua", "Enfriar el agua"), 0),
                createQuestion("¿Qué herramienta se usa para sellar roscas?", Arrays.asList("Cinta Teflón", "Pegamento instantáneo", "Cinta aislante", "Jabón"), 0),
                createQuestion("¿Qué es la presión estática?", Arrays.asList("La presión del agua cuando no hay flujo", "La presión cuando el grifo está abierto", "La velocidad del agua", "El peso del tubo"), 0),
                createQuestion("¿Cuál es la pendiente mínima recomendada para drenajes?", Arrays.asList("2%", "10%", "0.5%", "5%"), 0)
            ));
        } else if ("carpinteria".equalsIgnoreCase(area)) {
            response.put("titulo", "Certificación en Carpintería");
            response.put("documentacion", Arrays.asList(
                createModule("Madera y Tableros", "MDF, MDP y Madera Maciza.", "Conocerás la resistencia mecánica del MDF frente al MDP y cuándo usar Triplex para áreas con riesgo de humedad moderada."),
                createModule("Herramientas", "Uso seguro de herramientas eléctricas.", "Técnicas de corte con sierra circular, fresado con ruteadora y el arte del lijado progresivo para acabados espejo."),
                createModule("Ensambles", "Uniones y pegamentos.", "Aprenderás el ensamble de cola de milano, caja y espiga, y el uso correcto de prensas y adhesivos estructurales.")
            ));
            response.put("preguntas", Arrays.asList(
                createQuestion("¿Qué significa MDF?", Arrays.asList("Fibras de Densidad Media", "Madera De Fabricación", "Material De Formica", "Mueble De Pino"), 0),
                createQuestion("¿Cuál es el grano de lija más fino?", Arrays.asList("400", "80", "120", "40"), 0),
                createQuestion("¿Qué herramienta se usa para hacer rebajes o molduras?", Arrays.asList("Ruteadora (Fresadora)", "Martillo", "Nivel", "Serrucho"), 0),
                createQuestion("¿Para qué sirve el sellador?", Arrays.asList("Tapar los poros de la madera", "Pegar dos piezas", "Afilar herramientas", "Limpiar el serrín"), 0),
                createQuestion("¿Qué ensamble es más resistente para esquinas de cajones?", Arrays.asList("Cola de milano", "Clavos simples", "Pegamento solo", "Cinta"), 0)
            ));
        } else {
            return ResponseEntity.badRequest().body("Área no válida");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit/{usuarioId}")
    public ResponseEntity<?> submitCertification(@PathVariable Long usuarioId, @RequestBody Map<String, Object> payload) {
        String area = (String) payload.get("area");
        Integer aciertos = (Integer) payload.get("aciertos");

        if (aciertos == null || aciertos < 5) {
            return ResponseEntity.ok(Map.of("success", false, "message", "No has alcanzado el puntaje necesario (5/5)."));
        }

        Optional<Trabajador> trabajadorOpt = trabajadorRepository.findByUsuario_IdUsuario(usuarioId);
        if (trabajadorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No eres un trabajador registrado.");
        }

        Trabajador trabajador = trabajadorOpt.get();
        trabajador.setEsFarming(true);
        trabajadorRepository.save(trabajador);

        // Añadir rol FARMING al usuario
        Usuario usuario = trabajador.getUsuario();
        Optional<Rol> rolFarming = rolRepository.findByNombre("FARMING");
        if (rolFarming.isPresent() && !usuario.getRoles().contains(rolFarming.get())) {
            usuario.getRoles().add(rolFarming.get());
            usuarioRepository.save(usuario);
        }

        // Crear certificado oficial
        Certificado cert = new Certificado();
        cert.setTrabajador(trabajador);
        cert.setNombre("Certificación Farming en " + area.substring(0, 1).toUpperCase() + area.substring(1));
        cert.setEntidad("LinkedWork Official");
        cert.setDescripcion("Certificación otorgada por LinkedWork tras aprobar exitosamente el examen técnico de la plataforma.");
        cert.setEstado("Aprobado");
        cert.setPuntosOtorgados(50);
        cert.setFecha(LocalDateTime.now());
        certificadoRepository.save(cert);

        // Sumar puntos reales al trabajador
        puntuacionService.addPuntosToTrabajador(trabajador.getIdTrabajador(), 50);

        return ResponseEntity.ok(Map.of("success", true, "message", "¡Felicidades! Ahora eres un trabajador FARMING certificado. Has ganado 50 puntos."));
    }

    private Map<String, Object> createModule(String titulo, String resumen, String detalle) {
        Map<String, Object> m = new HashMap<>();
        m.put("titulo", titulo);
        m.put("resumen", resumen);
        m.put("detalle", detalle);
        return m;
    }

    private Map<String, Object> createQuestion(String texto, List<String> opciones, int correcta) {
        Map<String, Object> q = new HashMap<>();
        q.put("texto", texto);
        q.put("opciones", opciones);
        q.put("correcta", correcta);
        return q;
    }
}
