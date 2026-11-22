package com.example.demo.controller;

import com.example.demo.dto.TransactionResultDto;
import com.example.demo.service.TransactionOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

        private final TransactionOrchestrationService transactionService;

        @PostMapping("/checkout")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<TransactionResultDto> checkout(
                        Authentication authentication,
                        @RequestParam Long artworkId) {

                Long collectorId = (Long) authentication.getPrincipal();

                TransactionResultDto result = transactionService.processCheckout(
                                collectorId,
                                artworkId);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(result);
        }

        @PostMapping("/purchase")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<TransactionResultDto> purchaseArtwork(
                        Authentication authentication,
                        @RequestParam Long artworkId) {

                Long collectorId = (Long) authentication.getPrincipal();

                TransactionResultDto result = transactionService.processCheckout(
                                collectorId,
                                artworkId);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(result);
        }

        @GetMapping("/history")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<List<TransactionResultDto>> getCollectorHistory(
                        Authentication authentication) {

                Long collectorId = (Long) authentication.getPrincipal();

                return ResponseEntity.ok(
                                transactionService.getCollectorHistory(collectorId));
        }

        @GetMapping("/my-vault")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<List<TransactionResultDto>> getMyVault(
                        Authentication authentication) {

                Long collectorId = (Long) authentication.getPrincipal();

                return ResponseEntity.ok(
                                transactionService.getCollectorHistory(collectorId));
        }

        @GetMapping("/platform")
        @PreAuthorize("hasRole('PLATFORM_CURATOR')")
        public ResponseEntity<List<TransactionResultDto>> getPlatformTransactions() {

                return ResponseEntity.ok(
                                transactionService.getPlatformTransactions());
        }

        @PostMapping("/platform/reset")
        @PreAuthorize("hasRole('PLATFORM_CURATOR')")
        public ResponseEntity<Void> resetPlatform() {
                transactionService.resetPlatform();
                return ResponseEntity.noContent().build();
        }

}