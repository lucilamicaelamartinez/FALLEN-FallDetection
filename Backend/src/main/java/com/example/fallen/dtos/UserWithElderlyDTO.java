package com.example.fallen.dtos;

import com.example.fallen.models.User;

import java.util.List;

public class UserWithElderlyDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phoneNumber;
    private List<SimpleUserDTO> elderlyPersons;

    public UserWithElderlyDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.phoneNumber = user.getPhoneNumber();
        this.elderlyPersons = user.getElderlyPersons().stream()
                .map(u -> new SimpleUserDTO(u.getId(), u.getName(), u.getEmail(), u.getPhoneNumber()))
                .toList();
    }

    // Getters
    public Long getId()               { return id; }
    public String getName()           { return name; }
    public String getEmail()          { return email; }
    public String getRole()           { return role; }
    public String getPhoneNumber()    { return phoneNumber; }
    public List<SimpleUserDTO> getElderlyPersons() { return elderlyPersons; }
}



