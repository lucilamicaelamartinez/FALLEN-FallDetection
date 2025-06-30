package com.example.fallen.dtos;

import java.time.OffsetDateTime;

/**
 * DTO utilizado por la app móvil para enviar datos mínimos de un evento de caída.
 */
public class FallDTO {

    private Long elderlyId;
    private String location;
    private String screenshotUri;
    private OffsetDateTime timestamp;  // ✅ con zona horaria

    public FallDTO() {
    }

    public FallDTO(Long elderlyId, String location, String screenshotUri, OffsetDateTime timestamp) {
        this.elderlyId = elderlyId;
        this.location = location;
        this.screenshotUri = screenshotUri;
        this.timestamp = timestamp;
    }

    public Long getElderlyId() {
        return elderlyId;
    }

    public void setElderlyId(Long elderlyId) {
        this.elderlyId = elderlyId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getScreenshotUri() {
        return screenshotUri;
    }

    public void setScreenshotUri(String screenshotUri) {
        this.screenshotUri = screenshotUri;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
