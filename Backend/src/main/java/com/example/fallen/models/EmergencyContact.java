package com.example.fallen.models;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entidad que maneja la relación entre una persona mayor y sus contactos de emergencia.
 */
@Entity
@Table(name = "emergency_contacts", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"elderly_person_id", "contact_id"}))
public class EmergencyContact {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference("elderly-person")
    @ManyToOne
    @JoinColumn(name = "elderly_person_id", nullable = false)
    private User elderlyPerson;

    @JsonBackReference("contact")
    @ManyToOne
    @JoinColumn(name = "contact_id", nullable = false)
    private User contact;

    // Constructor por defecto
    public EmergencyContact() {
    }

    // Constructor útil para establecer relación directa
    public EmergencyContact(User elderlyPerson, User contact) {
        this.elderlyPerson = elderlyPerson;
        this.contact = contact;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public User getElderlyPerson() {
        return elderlyPerson;
    }

    public void setElderlyPerson(User elderlyPerson) {
        this.elderlyPerson = elderlyPerson;
    }

    public User getContact() {
        return contact;
    }

    public void setContact(User contact) {
        this.contact = contact;
    }
}

