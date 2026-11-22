package com.example.demo.controller;

import com.example.demo.dto.ArtworkListingDto;
import com.example.demo.entity.ArtistFollow;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.entity.ArtworkLike;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.entity.WishlistItem;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ArtistFollowRepository;
import com.example.demo.repository.ArtistPortfolioRepository;
import com.example.demo.repository.ArtworkLikeRepository;
import com.example.demo.repository.ArtworkListingRepository;
import com.example.demo.repository.PlatformAccountRepository;
import com.example.demo.repository.WishlistRepository;
import com.example.demo.service.ArtworkMarketplaceService;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

        private final WishlistRepository wishlistRepository;
        private final ArtworkLikeRepository likeRepository;
        private final ArtworkListingRepository artworkRepository;
        private final PlatformAccountRepository accountRepository;
        private final ArtistPortfolioRepository portfolioRepository;
        private final ArtistFollowRepository followRepository;
        private final ArtworkMarketplaceService artworkService;
        private final NotificationService notificationService;

        @GetMapping("/wishlist")
            @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<List<ArtworkListingDto>> getWishlist(
                        Authentication authentication) {

                Long accountId = (Long) authentication.getPrincipal();

                List<WishlistItem> wishlist = wishlistRepository.findByAccountId(accountId);

                Map<Long, ArtworkListingDto> results = new LinkedHashMap<>();

                wishlist.forEach(item -> results.put(
                                item.getArtwork().getId(),
                                artworkService.mapToDto(item.getArtwork())));

                return ResponseEntity.ok(
                                new ArrayList<>(results.values()));
        }

        @PostMapping("/wishlist/{artworkId}")
        @Transactional
            @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<Map<String, Object>> toggleWishlist(
                        Authentication authentication,
                        @PathVariable Long artworkId) {

                Long accountId = (Long) authentication.getPrincipal();

                Map<String, Object> response = new HashMap<>();
                boolean inWishlist = wishlistRepository.existsByAccountIdAndArtworkId(
                                accountId,
                                artworkId);

                if (inWishlist) {

                        wishlistRepository.deleteByAccountIdAndArtworkId(
                                        accountId,
                                        artworkId);

                        response.put("action", "removed");

                        return ResponseEntity.ok(response);
                }

                PlatformAccount account = accountRepository.findById(accountId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                WishlistItem item = WishlistItem.builder()
                                .account(account)
                                .artwork(
                                                artworkRepository.findById(artworkId)
                                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                                "Artwork not found")))
                                .build();

                wishlistRepository.save(item);

                response.put("action", "added");

                return ResponseEntity.ok(response);
        }

        @PostMapping("/follow/{portfolioId}")
        @Transactional
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<Map<String, Object>> followArtist(
                        Authentication authentication,
                        @PathVariable Long portfolioId) {

                Long followerId = (Long) authentication.getPrincipal();

                Map<String, Object> response = new HashMap<>();
                ArtistPortfolio portfolio = portfolioRepository.findById(portfolioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artist portfolio not found"));

                if (followRepository.existsByFollowerIdAndArtistPortfolioId(
                                followerId,
                                portfolioId)) {

                        ArtistFollow follow = followRepository
                                        .findByFollowerIdAndArtistPortfolioId(
                                                        followerId,
                                                        portfolioId)
                                        .orElseThrow();

                        followRepository.delete(follow);

                        portfolio.setFollowerCount(
                                        (int) followRepository.countByArtistPortfolioId(portfolioId));

                        portfolioRepository.save(portfolio);

                        response.put("action", "unfollowed");
                        response.put("followerCount", portfolio.getFollowerCount());

                        return ResponseEntity.ok(response);
                }

                PlatformAccount follower = accountRepository.findById(followerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                if (portfolio.getAccount().getId().equals(followerId)) {
                        throw new com.example.demo.exception.BusinessValidationException(
                                        "You cannot follow your own portfolio");
                }

                ArtistFollow follow = ArtistFollow.builder()
                                .follower(follower)
                                .artistPortfolio(portfolio)
                                .build();

                followRepository.save(follow);

                portfolio.setFollowerCount(
                                (int) followRepository.countByArtistPortfolioId(portfolioId));

                portfolioRepository.save(portfolio);
                notificationService.create(
                                portfolio.getAccount().getId(),
                                "ARTIST_FOLLOWED",
                                "Someone started following your portfolio.");

                response.put("action", "followed");
                response.put("followerCount", portfolio.getFollowerCount());

                return ResponseEntity.ok(response);
        }

        @GetMapping("/follow/{portfolioId}/status")
        @PreAuthorize("hasRole('ART_COLLECTOR')")
        public ResponseEntity<Map<String, Object>> followStatus(
                        Authentication authentication,
                        @PathVariable Long portfolioId) {

                Long followerId = (Long) authentication.getPrincipal();

                boolean following = followRepository.existsByFollowerIdAndArtistPortfolioId(
                                followerId,
                                portfolioId);

                Map<String, Object> response = new HashMap<>();
                response.put("isFollowing", following);

                return ResponseEntity.ok(response);
        }

}