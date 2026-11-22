package com.example.demo.controller;

import com.example.demo.dto.PortfolioStatsDto;
import com.example.demo.dto.PortfolioUpdateDto;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

        private final PortfolioService portfolioService;

        @GetMapping("/me")
        @PreAuthorize("hasRole('DIGITAL_ARTIST')")
        public ResponseEntity<ArtistPortfolio> getMyPortfolio(
                        @AuthenticationPrincipal Long accountId) {

                ArtistPortfolio portfolio = portfolioService.getMyPortfolio(accountId);

                return ResponseEntity.ok(portfolio);
        }

        @PutMapping("/me")
        @PreAuthorize("hasRole('DIGITAL_ARTIST')")
        public ResponseEntity<ArtistPortfolio> updatePortfolio(
                        @AuthenticationPrincipal Long accountId,
                        @RequestBody PortfolioUpdateDto dto) {

                ArtistPortfolio portfolio = portfolioService.updatePortfolio(accountId, dto);

                return ResponseEntity.ok(portfolio);
        }

        @GetMapping("/{id}/stats")
        @PreAuthorize("hasRole('DIGITAL_ARTIST') or hasRole('PLATFORM_CURATOR')")
        public ResponseEntity<PortfolioStatsDto> getPortfolioStats(
                        @PathVariable Long id) {

                PortfolioStatsDto stats = portfolioService.getPortfolioStats(id);

                return ResponseEntity.ok(stats);
        }

}