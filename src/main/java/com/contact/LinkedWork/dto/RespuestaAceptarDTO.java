package com.contact.LinkedWork.dto;

public class RespuestaAceptarDTO {
    public String mensaje;

    public RespuestaAceptarDTO() {
    }
    
    public RespuestaAceptarDTO(String mensaje) {
        this.mensaje = mensaje;
    }
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

}
