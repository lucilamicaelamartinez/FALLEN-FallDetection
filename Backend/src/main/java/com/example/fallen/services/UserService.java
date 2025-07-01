package com.example.fallen.services;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fallen.models.EmergencyContact;
import com.example.fallen.models.User;
import com.example.fallen.models.UserRole;
import com.example.fallen.repositories.EmergencyContactRepository;
import com.example.fallen.repositories.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private EmergencyContactRepository emergencyContactRepository;

    @Value("${jwt.secret}")
    private String secret;
    private Key jwtKey;

    @PostConstruct
    public void init() {
        this.jwtKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /* ══════════════════════ REGISTRO CORREGIDO ══════════════════════ */
    @Transactional
    public User registerUser(String name,
                             String email,
                             String password,
                             UserRole role,
                             Long elderlyPersonId,
                             String phoneNumber) {

        if (userRepository.findByEmail(email).isPresent())
            throw new IllegalArgumentException("Email is already registered.");

        User newUser = new User(name, email, encryptPassword(password), role);
        newUser.setPhoneNumber(phoneNumber);

        // 🔹 Si es contacto de emergencia, crear relación al mismo tiempo
        if (role == UserRole.EMERGENCY_CONTACT) {
            if (elderlyPersonId == null)
                throw new IllegalArgumentException("Must provide associated elderly person ID.");

            User elder = userRepository.findById(elderlyPersonId)
                    .filter(u -> u.getRole() == UserRole.ELDERLY_PERSON)
                    .orElseThrow(() -> new IllegalArgumentException("Associated elderly person not found."));

            // Guardar usuario primero para generar ID
            newUser = userRepository.save(newUser);

            // Crear y asignar la relación
            EmergencyContact relation = new EmergencyContact(elder, newUser);
            emergencyContactRepository.save(relation);

        } else {
            // Guardar usuario directamente si no es contacto
            newUser = userRepository.save(newUser);
        }

        return newUser;
    }

    /* ══════════════════════ LOGIN ══════════════════════ */
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        if (!user.getPassword().equals(encryptPassword(password)))
            throw new IllegalArgumentException("Invalid credentials.");

        return Jwts.builder()
                   .setSubject(user.getId().toString())
                   .claim("role", user.getRole().name())
                   .setIssuedAt(new Date())
                   .setExpiration(new Date(System.currentTimeMillis() + 86_400_000))
                   .signWith(jwtKey, SignatureAlgorithm.HS256)
                   .compact();
    }

    /* ══════════════════════ JWT → USER ══════════════════════ */
    public User getUserByToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                                .setSigningKey(jwtKey)
                                .build()
                                .parseClaimsJws(token)
                                .getBody();
            Long userId = Long.parseLong(claims.getSubject());
            return userRepository.findById(userId).orElse(null);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    /* ══════════════════════ CONTACTOS DE EMERGENCIA ══════════════════════ */
    @Transactional
    public void addEmergencyContact(Long elderlyPersonId, Long contactId) {
        User elder   = userRepository.findById(elderlyPersonId)
                             .orElseThrow(() -> new IllegalArgumentException("Elderly person not found"));
        User contact = userRepository.findById(contactId)
                             .orElseThrow(() -> new IllegalArgumentException("Contact not found"));

        if (elder.getRole() != UserRole.ELDERLY_PERSON)
            throw new IllegalArgumentException("User must be an elderly person");
        if (contact.getRole() != UserRole.EMERGENCY_CONTACT)
            throw new IllegalArgumentException("Contact must have emergency-contact role");

        elder.addEmergencyContact(contact);
        userRepository.save(elder);
    }

    @Transactional
    public void removeEmergencyContact(Long elderlyPersonId, Long contactId) {
        User elder   = userRepository.findById(elderlyPersonId)
                             .orElseThrow(() -> new IllegalArgumentException("Elderly person not found"));
        User contact = userRepository.findById(contactId)
                             .orElseThrow(() -> new IllegalArgumentException("Contact not found"));
        elder.removeEmergencyContact(contact);
        userRepository.save(elder);
    }

    public List<User> getEmergencyContacts(Long elderlyPersonId) {
        User elder = userRepository.findById(elderlyPersonId)
                       .orElseThrow(() -> new IllegalArgumentException("Elderly person not found"));
        return elder.getEmergencyContacts();
    }

    /* ══════════════════════ EXPOSURE DE PUSH-TOKENS ══════════════════════ */
    public List<String> getContactExpoTokens(Long elderlyId) {
        User elderly = userRepository.findById(elderlyId)
            .orElseThrow(() -> new IllegalArgumentException("Elderly person not found"));

        return emergencyContactRepository.findByElderlyPerson(elderly).stream()
                .map(rel -> rel.getContact().getExpoPushToken())
                .filter(t -> t != null && !t.isBlank())
                .collect(Collectors.toList());
    }

    public String getContactExpoToken(Long elderlyId) {
        return getContactExpoTokens(elderlyId).stream().findFirst().orElse(null);
    }

    /* ══════════════════════ ACTUALIZAR TOKEN DEL USUARIO ══════════════════════ */
    public void updateExpoPushToken(Long userId, String pushToken) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setExpoPushToken(pushToken);
            userRepository.save(u);
        });
    }

    /* ══════════════════════ UTILIDADES ══════════════════════ */
    public List<User> getAllElderlyUsers() {
        return userRepository.findByRole(UserRole.ELDERLY_PERSON);
    }

    private String encryptPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash      = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error encrypting password", e);
        }
    }
}





