package com.example.fallen.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.fallen.models.User;
import com.example.fallen.models.UserRole;
import com.example.fallen.services.UserService;
import com.example.fallen.dtos.UserWithElderlyDTO;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    /* ───────────────────────────────
     *  AUTH
     * ─────────────────────────────── */

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            UserRole role = UserRole.valueOf(request.getRole());
            User newUser = userService.registerUser(
                    request.getName(),
                    request.getEmail(),
                    request.getPassword(),
                    role,
                    request.getElderlyPersonId(),
                    request.getPhoneNumber()
            );
            newUser.setPassword(null);
            return ResponseEntity.ok(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/users/expo-token")
    public ResponseEntity<?> saveExpoPushToken(
            @RequestBody PushTokenRequest body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Authentication token not provided");

        String tokenHeader = authHeader.substring(7);
        User user = userService.getUserByToken(tokenHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Invalid or expired token");

        userService.updateExpoPushToken(user.getId(), body.getExpoToken());

        System.out.printf("✅ Expo token guardado para %s (id=%d): %s%n",
                user.getName(), user.getId(), body.getExpoToken());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/elders")
    public ResponseEntity<?> getAllElderlyUsers() {
        List<User> elders = userService.getAllElderlyUsers();
        elders.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(elders);
    }

    @GetMapping("/emergency-contacts")
    public ResponseEntity<?> getEmergencyContactsForElderlyUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Authentication token not provided");

        String token = authHeader.substring(7);
        User authenticatedUser = userService.getUserByToken(token);

        if (authenticatedUser == null)
            return ResponseEntity.status(401).body("Invalid or expired token");

        if (authenticatedUser.getRole() != UserRole.ELDERLY_PERSON)
            return ResponseEntity.status(403).body("Only elderly users can view emergency contacts");

        return ResponseEntity.ok(authenticatedUser.getEmergencyContacts());
    }

    @PostMapping("/users/{elderlyId}/emergency-contacts/{contactId}")
    public ResponseEntity<?> addEmergencyContact(
            @PathVariable Long elderlyId,
            @PathVariable Long contactId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Authentication token not provided");

        String token = authHeader.substring(7);
        User authenticatedUser = userService.getUserByToken(token);

        if (authenticatedUser == null)
            return ResponseEntity.status(401).body("Invalid or expired token");

        if (authenticatedUser.getRole() != UserRole.ELDERLY_PERSON
                || !authenticatedUser.getId().equals(elderlyId))
            return ResponseEntity.status(403).body("Only the elderly person can add their own emergency contacts");

        try {
            userService.addEmergencyContact(elderlyId, contactId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/users/{elderlyId}/emergency-contacts/{contactId}")
    public ResponseEntity<?> removeEmergencyContact(
            @PathVariable Long elderlyId,
            @PathVariable Long contactId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Authentication token not provided");

        String token = authHeader.substring(7);
        User authenticatedUser = userService.getUserByToken(token);

        if (authenticatedUser == null)
            return ResponseEntity.status(401).body("Invalid or expired token");

        if (authenticatedUser.getRole() != UserRole.ELDERLY_PERSON
                || !authenticatedUser.getId().equals(elderlyId))
            return ResponseEntity.status(403).body("Only the elderly person can remove their own emergency contacts");

        try {
            userService.removeEmergencyContact(elderlyId, contactId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).body("Authentication token not provided");

        User u = userService.getUserByToken(auth.substring(7));
        if (u == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(new UserWithElderlyDTO(u));
    }

    /* ───────────────────────────────
     *  DTOs para las peticiones
     * ─────────────────────────────── */
    public static class UserRegistrationRequest {
        private String name;
        private String email;
        private String password;
        private String role;
        private Long elderlyPersonId;
        private String phoneNumber;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public Long getElderlyPersonId() { return elderlyPersonId; }
        public void setElderlyPersonId(Long elderlyPersonId) { this.elderlyPersonId = elderlyPersonId; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class PushTokenRequest {
        private String expoToken;

        public String getExpoToken() { return expoToken; }
        public void setExpoToken(String expoToken) { this.expoToken = expoToken; }
    }

    public static class AuthResponse {
        private String token;

        public AuthResponse(String token) { this.token = token; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}




