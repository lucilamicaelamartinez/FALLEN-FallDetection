package com.example.fallen.repositories;

import java.util.Optional;
import java.util.List; 


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fallen.models.User;
import com.example.fallen.models.UserRole;

/**
 * JPA repository for the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);  
}
