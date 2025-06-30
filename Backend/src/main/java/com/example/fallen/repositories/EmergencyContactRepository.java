package com.example.fallen.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fallen.models.EmergencyContact;
import com.example.fallen.models.User;

/**
 * JPA repository for the EmergencyContact entity.
 */
@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    
    // Encuentra todos los contactos de emergencia asociados a una persona mayor
    List<EmergencyContact> findByElderlyPerson(User elderlyPerson);
    
    // Encuentra todas las personas mayores asociadas a un contacto de emergencia
    List<EmergencyContact> findByContact(User contact);
    
    // Encuentra una relación específica entre una persona mayor y un contacto
    EmergencyContact findByElderlyPersonAndContact(User elderlyPerson, User contact);
} 