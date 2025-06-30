package com.example.fallen.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing a recorded fall event.
 */
@Entity
@Table(name = "fall_events")
public class FallEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación bidireccional: Un evento de caída pertenece a un usuario
    @JsonBackReference("user-falls")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Date and time of the fall event
    private LocalDateTime timestamp;

    // Approximate location where the fall occurred (could be address or coordinates)
    private String location;

    // Link or identifier of a screenshot related to the fall (optional)
    private String screenshotUri;

    public FallEvent() {
    }

    public FallEvent(User user, LocalDateTime timestamp, String location, String screenshotUri) {
        this.user = user;
        this.timestamp = timestamp;
        this.location = location;
        this.screenshotUri = screenshotUri;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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
}
