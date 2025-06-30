// dto/SimpleUserDTO.java
package com.example.fallen.dtos;

public class SimpleUserDTO {
    public Long id;
    public String name;
    public String email;
    public String phoneNumber;

    public SimpleUserDTO(Long id, String name, String email, String phoneNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }
}
