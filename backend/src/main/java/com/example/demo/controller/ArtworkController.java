package com.example.demo.controller;

import com.example.demo.dto.ArtworkCreateDto;
import com.example.demo.dto.ArtworkListingDto;
import com.example.demo.dto.ArtworkUpdateDto;
import com.example.demo.service.ArtworkMarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/artworks")
@RequiredArgsConstructor
public class ArtworkController {
        private final ArtworkMarketplaceService artworkService;

        @PostMapping
        @PreAuthorize("hasRole('DIGITAL_ARTIST')")
        public ResponseEntity<ArtworkListingDto> createListing(
                        Authentication authentication,
                        @Valid @RequestBody ArtworkCreateDto dto) {

                Long accountId = (Long) authentication.getPrincipal();

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(artworkService.createListing(accountId, dto));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('DIGITAL_ARTIST')")
        public ResponseEntity<ArtworkListingDto> updateListing(
                        Authentication authentication,
                        @PathVariable Long id,
                        @Valid @RequestBody ArtworkUpdateDto dto) {

                Long accountId = (Long) authentication.getPrincipal();
                return ResponseEntity.ok(artworkService.updateListing(accountId, id, dto));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('DIGITAL_ARTIST')")
        public ResponseEntity<Void> deleteListing(
                        Authentication authentication,
                        @PathVariable Long id) {

                Long accountId = (Long) authentication.getPrincipal();
                artworkService.deleteListing(accountId, id);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/explore")
        public ResponseEntity<List<ArtworkListingDto>> exploreMarketplace(
                        @RequestParam(required = false) String status) {

                return ResponseEntity.ok(
                                artworkService.exploreMarketplace(status));
        }

        @GetMapping("/moderation")
        @PreAuthorize("hasRole('PLATFORM_CURATOR')")
        public ResponseEntity<List<ArtworkListingDto>> moderationListings() {
                return ResponseEntity.ok(artworkService.getModerationListings());
        }

        @GetMapping("/search")
        public ResponseEntity<List<ArtworkListingDto>> search(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice) {

                return ResponseEntity.ok(
                                artworkService.searchArtworks(
                                                keyword,
                                                category,
                                                minPrice,
                                                maxPrice));
        }

        @GetMapping("/trending")
        public ResponseEntity<List<ArtworkListingDto>> getTrending() {

                return ResponseEntity.ok(
                                artworkService.getTrending());
        }

        @GetMapping("/most-liked")
        public ResponseEntity<List<ArtworkListingDto>> getMostLiked() {

                return ResponseEntity.ok(
                                artworkService.getMostLiked());
        }

        @PostMapping("/{id}/view")
        public ResponseEntity<ArtworkListingDto> recordView(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                artworkService.recordView(id));
        }

        @PostMapping("/{id}/like")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<ArtworkListingDto> toggleLike(
                        Authentication authentication,
                        @PathVariable Long id) {

                Long accountId = (Long) authentication.getPrincipal();

                return ResponseEntity.ok(
                                artworkService.toggleLike(accountId, id));
        }

        @PutMapping("/{id}/status")
        @PreAuthorize("hasRole('DIGITAL_ARTIST') or hasRole('PLATFORM_CURATOR')")
        public ResponseEntity<ArtworkListingDto> updateStatus(
                        Authentication authentication,
                        @PathVariable Long id,
                        @RequestParam String newStatus) {

                Long accountId = (Long) authentication.getPrincipal();

                String role = authentication.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                                .replace("ROLE_", "");

                return ResponseEntity.ok(
                                artworkService.updateStatus(
                                                accountId,
                                                id,
                                                newStatus,
                                                role));
        }
}