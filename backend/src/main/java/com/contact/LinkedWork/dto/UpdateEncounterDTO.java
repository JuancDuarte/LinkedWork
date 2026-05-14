package com.contact.LinkedWork.dto;

public class UpdateEncounterDTO {
    private String direccion;
    private String horaEncuentro;
    private String notas;

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getHoraEncuentro() {
        return horaEncuentro;
    }

    public void setHoraEncuentro(String horaEncuentro) {
        this.horaEncuentro = horaEncuentro;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}
