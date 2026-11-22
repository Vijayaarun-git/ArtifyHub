package com.example.demo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {

    private String token;
    private String role;
    private Long accountId;
    private String email;
    private String username;
    private String avatarUrl;

}