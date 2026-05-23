package com.contact.LinkedWork.dto;

public class PlacePredictionDTO {
    private String placeId;
    private String mainText;
    private String secondaryText;
    private String description;
    private Double latitud;
    private Double longitud;

    public PlacePredictionDTO() {
    }

    public PlacePredictionDTO(String placeId, String mainText, String secondaryText, String description) {
        this.placeId = placeId;
        this.mainText = mainText;
        this.secondaryText = secondaryText;
        this.description = description;
    }

    public String getPlaceId() {
        return placeId;
    }

    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }

    public String getMainText() {
        return mainText;
    }

    public void setMainText(String mainText) {
        this.mainText = mainText;
    }

    public String getSecondaryText() {
        return secondaryText;
    }

    public void setSecondaryText(String secondaryText) {
        this.secondaryText = secondaryText;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }
}
