package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
