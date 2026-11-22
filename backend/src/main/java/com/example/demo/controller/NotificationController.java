package com.example.demo.controller;

import com.example.demo.dto.NotificationDto;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getForAccount((Long) authentication.getPrincipal()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "count", notificationService.unreadCount((Long) authentication.getPrincipal())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable Long id) {
        notificationService.markRead((Long) authentication.getPrincipal(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead((Long) authentication.getPrincipal());
        return ResponseEntity.noContent().build();
    }
}
