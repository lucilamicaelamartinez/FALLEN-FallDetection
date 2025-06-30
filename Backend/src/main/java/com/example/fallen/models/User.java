package com.example.fallen.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * System User entity – can represent either an elderly person or an emergency contact.
 */
@Entity
@Table(name = "users")
public class User {

    /* ───────────────────────────
     *  Primary key
     * ─────────────────────────── */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ───────────────────────────
     *  Basic attributes
     * ─────────────────────────── */
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = true)
    private String phoneNumber;

    /* ───────────────────────────
     *  NEW ➜ Expo push-token
     * ─────────────────────────── */
    @Column(name = "expo_push_token")
    private String expoPushToken;   // ← único cambio de esta versión

    /* ───────────────────────────
     *  Relationships
     * ─────────────────────────── */
    // Lista donde este usuario es la persona mayor
    @JsonManagedReference("elderly-person")
    @OneToMany(mappedBy = "elderlyPerson",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<EmergencyContact> emergencyContactRelations = new ArrayList<>();

    // Lista donde este usuario es el contacto de emergencia
    @JsonManagedReference("contact")
    @OneToMany(mappedBy = "contact",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<EmergencyContact> elderlyPersonRelations = new ArrayList<>();

    // Eventos de caída asociados
    @JsonManagedReference("user-falls")
    @OneToMany(mappedBy = "user",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<FallEvent> fallEvents = new ArrayList<>();

    /* ───────────────────────────
     *  Constructors
     * ─────────────────────────── */
    public User() { }

    public User(String name, String email, String password, UserRole role) {
        this.name     = name;
        this.email    = email;
        this.password = password;
        this.role     = role;
    }

    /* ───────────────────────────
     *  Validation hooks
     * ─────────────────────────── */
    @PrePersist
    @PreUpdate
    public void validateRelations() {
        if (role == UserRole.EMERGENCY_CONTACT && elderlyPersonRelations.isEmpty()) {
            throw new IllegalStateException("Un contacto de emergencia debe estar asociado a una persona mayor");
        }
        if (role == UserRole.ELDERLY_PERSON && !elderlyPersonRelations.isEmpty()) {
            throw new IllegalStateException("Una persona mayor no puede ser contacto de emergencia de otra persona");
        }
    }

    /* ───────────────────────────
     *  Helper methods
     * ─────────────────────────── */
    public void addEmergencyContact(User contact) {
        if (this.role != UserRole.ELDERLY_PERSON) {
            throw new IllegalStateException("Solo una persona mayor puede tener contactos de emergencia");
        }
        if (contact.getRole() != UserRole.EMERGENCY_CONTACT) {
            throw new IllegalStateException("El usuario debe tener rol de contacto de emergencia");
        }
        EmergencyContact relation = new EmergencyContact(this, contact);
        emergencyContactRelations.add(relation);
        contact.elderlyPersonRelations.add(relation);
    }

    public void removeEmergencyContact(User contact) {
        emergencyContactRelations.removeIf(relation -> {
            if (relation.getContact().equals(contact)) {
                contact.elderlyPersonRelations.remove(relation);
                return true;
            }
            return false;
        });
    }

    @JsonIgnore
    public List<User> getEmergencyContacts() {
        return emergencyContactRelations.stream()
                                        .map(EmergencyContact::getContact)
                                        .toList();
    }

    @JsonIgnore
    public List<User> getElderlyPersons() {
        return elderlyPersonRelations.stream()
                                     .map(EmergencyContact::getElderlyPerson)
                                     .toList();
    }

    /* ───────────────────────────
     *  Getters & Setters
     * ─────────────────────────── */
    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    /* NEW ➜ expoPushToken */
    public String getExpoPushToken() { return expoPushToken; }
    public void setExpoPushToken(String expoPushToken) { this.expoPushToken = expoPushToken; }

    public List<EmergencyContact> getEmergencyContactRelations() { return emergencyContactRelations; }
    public void setEmergencyContactRelations(List<EmergencyContact> l) { this.emergencyContactRelations = l; }

    public List<EmergencyContact> getElderlyPersonRelations() { return elderlyPersonRelations; }
    public void setElderlyPersonRelations(List<EmergencyContact> l) { this.elderlyPersonRelations = l; }

    public List<FallEvent> getFallEvents() { return fallEvents; }
    public void setFallEvents(List<FallEvent> fallEvents) { this.fallEvents = fallEvents; }
}

