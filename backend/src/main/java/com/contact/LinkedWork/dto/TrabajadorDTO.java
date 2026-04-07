package com.contact.LinkedWork.dto;

public class TrabajadorDTO {
    
    private String areaNombre;
    
    public TrabajadorDTO() {
    }
    public TrabajadorDTO( String areaNombre) {
        this.areaNombre = areaNombre;
    }

    public String getAreaNombre() {
        return areaNombre;
    }

    public void setAreaNombre(String areaNombre) {
        this.areaNombre = areaNombre;
    }

}
