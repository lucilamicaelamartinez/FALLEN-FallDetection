package com.example.fallen.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.fallen.models.FallEvent;
import com.example.fallen.models.User;

import java.util.List;

/**
 * JPA repository for the FallEvent entity.
 */
@Repository
public interface FallEventRepository extends JpaRepository<FallEvent, Long> {

    // Retrieve all fall events for a specific user (elderly person)
    List<FallEvent> findByUser(User user);

    // Retrieve all fall events for a list of users (multiple elderly persons)
    List<FallEvent> findByUserIn(List<User> users);

    // Delete all fall events for a specific user
    void deleteByUser(User user);
}

