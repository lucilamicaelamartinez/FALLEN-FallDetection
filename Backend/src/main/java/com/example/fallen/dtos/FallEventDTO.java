package com.example.fallen.dtos;

import com.example.fallen.models.FallEvent;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class FallEventDTO {

    private Long id;
    private String timestamp;     // ← en formato ISO 8601 legible
    private String location;
    private String screenshotUri;

    public FallEventDTO(FallEvent event) {
        this.id = event.getId();
        this.location = event.getLocation();
        this.screenshotUri = event.getScreenshotUri();

        // 👇 Ya viene con horario argentino, así que no cambiamos zona
        LocalDateTime local = event.getTimestamp();
        this.timestamp = local.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public Long getId() {
        return id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getLocation() {
        return location;
    }

    public String getScreenshotUri() {
        return screenshotUri;
    }
}






