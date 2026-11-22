package com.example.demo.service;

import com.example.demo.dto.NotificationDto;
import com.example.demo.entity.Notification;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.PlatformAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final PlatformAccountRepository accountRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getForAccount(Long accountId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(accountId)
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long accountId) {
        return notificationRepository.countByRecipientIdAndIsRead(accountId, false);
    }

    @Transactional
    public void markRead(Long accountId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(accountId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setIsRead(true);
    }

    @Transactional
    public void markAllRead(Long accountId) {
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(accountId)
                .forEach(notification -> notification.setIsRead(true));
    }

    @Transactional
    public void create(Long recipientId, String type, String message) {
        PlatformAccount recipient = accountRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .isRead(false)
                .build());
    }

    private NotificationDto map(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
