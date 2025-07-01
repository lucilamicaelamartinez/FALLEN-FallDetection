package com.example.fallen.controllers;

import com.example.fallen.dtos.FallDTO;
import com.example.fallen.dtos.FallEventDTO;
import com.example.fallen.models.FallEvent;
import com.example.fallen.models.User;
import com.example.fallen.models.UserRole;
import com.example.fallen.services.FallEventService;
import com.example.fallen.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FallEventController {

    private final FallEventService fallEvents;
    private final UserService users;

    @Autowired
    public FallEventController(FallEventService fallEvents, UserService users) {
        this.fallEvents = fallEvents;
        this.users = users;
    }

    // ═══════════════ 1. POST /falls (sin JWT) ═══════════════
    @PostMapping("/falls")
    public ResponseEntity<?> registerFall(@RequestBody FallDTO dto) {
        User elderly = users.getUserById(dto.getElderlyId());
        if (elderly == null)
            return ResponseEntity.badRequest().body("Elderly user not found");

        LocalDateTime ts = dto.getTimestamp() != null
                ? dto.getTimestamp().toLocalDateTime()
                : LocalDateTime.now();

        FallEvent ev = fallEvents.registerFallEvent(
                elderly,
                ts,
                dto.getLocation(),
                dto.getScreenshotUri()
        );

        return ResponseEntity.ok(new FallEventDTO(ev));
    }

    // ═══════════════ 2. POST /events (con JWT) ═══════════════
    @PostMapping("/events")
    public ResponseEntity<?> registerFallEvent(
            @RequestHeader("Authorization") String auth,
            @RequestBody FallEventRequest body) {

        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("JWT required");

        User me = users.getUserByToken(auth.substring(7));
        if (me == null)
            return ResponseEntity.status(401).body("Invalid JWT");

        if (me.getRole() != UserRole.ELDERLY_PERSON)
            return ResponseEntity.status(403).body("Only elderly person can register events");

        LocalDateTime ts = body.timestamp() != null ? body.timestamp() : LocalDateTime.now();

        FallEvent saved = fallEvents.registerFallEvent(
                me,
                ts,
                body.location(),
                body.screenshotUri()
        );

        return ResponseEntity.ok(new FallEventDTO(saved));
    }

    // ═══════════════ 3. PATCH /events/{id}/screenshot ═══════════════
    @PatchMapping("/events/{id}/screenshot")
    public ResponseEntity<?> addScreenshot(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth,
            @RequestBody ScreenshotDTO body) {

        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("JWT required");

        User me = users.getUserByToken(auth.substring(7));
        if (me == null)
            return ResponseEntity.status(401).body("Invalid JWT");

        FallEvent ev = fallEvents.getEventById(id);
        if (ev == null)
            return ResponseEntity.status(404).body("Event not found with ID: " + id);

        boolean isOwner = me.equals(ev.getUser());
        boolean isContact = me.getRole() == UserRole.EMERGENCY_CONTACT &&
                            me.getElderlyPersons().contains(ev.getUser());

        if (!isOwner && !isContact)
            return ResponseEntity.status(403).body("Not authorized to modify this event");

        try {
            fallEvents.updateScreenshot(ev, body.screenshotUri());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating screenshot: " + e.getMessage());
        }
    }

    // ═══════════════ 4. GET /events (con JWT) ═══════════════
    @GetMapping("/events")
    public ResponseEntity<?> listEvents(@RequestHeader("Authorization") String auth) {

        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("JWT required");

        User me = users.getUserByToken(auth.substring(7));
        if (me == null)
            return ResponseEntity.status(401).body("Invalid JWT");

        List<FallEvent> rawEvents;

        if (me.getRole() == UserRole.ELDERLY_PERSON) {
            rawEvents = fallEvents.getEventsByUser(me);
        } else if (me.getRole() == UserRole.EMERGENCY_CONTACT) {
            List<User> elders = me.getElderlyPersons();
            if (elders.isEmpty())
                return ResponseEntity.status(403).body("No linked elderly person");

            rawEvents = fallEvents.getEventsByUsers(elders);
        } else {
            return ResponseEntity.status(403).body("Unsupported role");
        }

        List<FallEventDTO> output = rawEvents.stream()
                .map(FallEventDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(output);
    }

    // ═══════════════ 5. DELETE /events/clear (con JWT) ═══════════════
    @DeleteMapping("/events/clear")
    public ResponseEntity<?> clearMyEvents(@RequestHeader("Authorization") String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("JWT required");

        User me = users.getUserByToken(auth.substring(7));
        if (me == null)
            return ResponseEntity.status(401).body("Invalid JWT");

        if (me.getRole() != UserRole.ELDERLY_PERSON)
            return ResponseEntity.status(403).body("Only elderly person can delete their logs");

        fallEvents.deleteEventsByUser(me);
        return ResponseEntity.ok().build();
    }

    // ═══════════════ Records DTO internos ═══════════════
    public record FallEventRequest(
            Long userId,
            LocalDateTime timestamp,
            String location,
            String screenshotUri) {}

    public record ScreenshotDTO(String screenshotUri) {}
}














