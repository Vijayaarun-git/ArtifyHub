package com.example.demo.service;

import com.example.demo.dto.ArtworkCreateDto;
import com.example.demo.dto.ArtworkListingDto;
import com.example.demo.dto.ArtworkUpdateDto;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.entity.ArtworkListing;
import com.example.demo.repository.ArtworkLikeRepository;
import com.example.demo.repository.ArtworkListingRepository;
import com.example.demo.repository.PlatformAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.ArtworkLike;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ArtworkMarketplaceService {

        private final ArtworkListingRepository artworkRepository;
        private final ArtworkLikeRepository likeRepository;
        private final PlatformAccountRepository accountRepository;
        private final PortfolioService portfolioService;
        private final NotificationService notificationService;

        @Transactional
        public ArtworkListingDto createListing(Long accountId,
                        ArtworkCreateDto dto) {

                ArtistPortfolio portfolio = portfolioService.getMyPortfolio(accountId);

                ArtworkListing artwork = ArtworkListing.builder()
                                .portfolio(portfolio)
                                .title(dto.getTitle())
                                .description(dto.getDescription())
                                .price(dto.getPrice())
                                .mediaUrl(dto.getMediaUrl())
                                .category(dto.getCategory())
                                .tags(dto.getTags())
                                .availabilityStatus("AVAILABLE")
                                .likeCount(0)
                                .viewCount(0)
                                .isFeatured(false)
                                .build();

                artwork = artworkRepository.save(artwork);

                return mapToDto(artwork);
        }

        @Transactional
        public ArtworkListingDto updateListing(Long accountId, Long listingId,
                        ArtworkUpdateDto dto) {
                ArtworkListing artwork = artworkRepository.findById(listingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));
                ArtistPortfolio portfolio = portfolioService.getMyPortfolio(accountId);

                if (!artwork.getPortfolio().getId().equals(portfolio.getId())) {
                        throw new BusinessValidationException("You do not own this artwork");
                }
                if ("SOLD".equalsIgnoreCase(artwork.getAvailabilityStatus())) {
                        throw new BusinessValidationException("Sold artwork cannot be edited");
                }

                if (dto.getTitle() != null) {
                        artwork.setTitle(dto.getTitle().trim());
                }
                if (dto.getDescription() != null) {
                        artwork.setDescription(dto.getDescription());
                }
                if (dto.getPrice() != null) {
                        artwork.setPrice(dto.getPrice());
                }
                if (dto.getMediaUrl() != null) {
                        artwork.setMediaUrl(dto.getMediaUrl().trim());
                }
                if (dto.getCategory() != null) {
                        artwork.setCategory(dto.getCategory());
                }
                if (dto.getTags() != null) {
                        artwork.setTags(dto.getTags());
                }

                return mapToDto(artworkRepository.save(artwork));
        }

        @Transactional
        public void deleteListing(Long accountId, Long listingId) {
                ArtworkListing artwork = artworkRepository.findById(listingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));
                ArtistPortfolio portfolio = portfolioService.getMyPortfolio(accountId);

                if (!artwork.getPortfolio().getId().equals(portfolio.getId())) {
                        throw new BusinessValidationException("You do not own this artwork");
                }
                if ("SOLD".equalsIgnoreCase(artwork.getAvailabilityStatus())
                                || artwork.getTransaction() != null) {
                        throw new BusinessValidationException("Sold artwork cannot be deleted");
                }

                artworkRepository.delete(artwork);
        }

        @Transactional(readOnly = true)
        public List<ArtworkListingDto> exploreMarketplace(String status) {

                List<ArtworkListing> artworks;

                if (status != null && !status.isBlank()
                                && !"HIDDEN".equalsIgnoreCase(status)) {

                        artworks = artworkRepository
                                        .findByAvailabilityStatusOrderByCreatedAtDesc(status.toUpperCase(Locale.ROOT));

                } else {

                        artworks = artworkRepository
                                        .findAllByOrderByCreatedAtDesc()
                                        .stream()
                                        .filter(a -> !"HIDDEN".equalsIgnoreCase(a.getAvailabilityStatus()))
                                        .collect(Collectors.toList());
                }

                return artworks.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ArtworkListingDto> getModerationListings() {
                return artworkRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .filter(artwork -> artwork.getPortfolio() != null
                                                && artwork.getPortfolio().getAccount() != null)
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ArtworkListingDto> searchArtworks(
                        String keyword,
                        String category,
                        BigDecimal minPrice,
                        BigDecimal maxPrice) {

                return artworkRepository.searchArtworks(
                                keyword == null ? "" : keyword.trim(),
                                category,
                                minPrice,
                                maxPrice)
                                .stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ArtworkListingDto> getTrending() {

                return artworkRepository.findTrending()
                                .stream()
                                .limit(20)
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ArtworkListingDto> getMostLiked() {

                return artworkRepository.findTopByLikes()
                                .stream()
                                .limit(20)
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public ArtworkListingDto updateStatus(
                        Long accountId,
                        Long listingId,
                        String newStatus,
                        String role) {

                ArtworkListing artwork = artworkRepository.findById(listingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));

                if (!"PLATFORM_CURATOR".equalsIgnoreCase(role)) {

                        ArtistPortfolio portfolio = portfolioService.getMyPortfolio(accountId);

                        if (!artwork.getPortfolio().getId().equals(portfolio.getId())) {
                                throw new BusinessValidationException(
                                                "You do not own this artwork");
                        }
                }
                String normalizedStatus = newStatus == null
                                ? ""
                                : newStatus.trim().toUpperCase(Locale.ROOT);
                if (!List.of("AVAILABLE", "SOLD", "HIDDEN").contains(normalizedStatus)) {
                        throw new BusinessValidationException("Unsupported artwork status");
                }
                if ("SOLD".equalsIgnoreCase(artwork.getAvailabilityStatus())
                                && !"SOLD".equals(normalizedStatus)) {
                        throw new BusinessValidationException("Sold artwork status cannot be changed");
                }
                if ("SOLD".equals(normalizedStatus)
                                && "AVAILABLE".equalsIgnoreCase(artwork.getAvailabilityStatus())
                                && !"PLATFORM_CURATOR".equalsIgnoreCase(role)) {
                        throw new BusinessValidationException("Artists cannot mark artwork as sold");
                }

                artwork.setAvailabilityStatus(normalizedStatus);

                return mapToDto(artworkRepository.save(artwork));
        }

        @Transactional
        public ArtworkListingDto recordView(Long artworkId) {

                ArtworkListing artwork = artworkRepository.findById(artworkId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));

                artwork.setViewCount(artwork.getViewCount() + 1);

                return mapToDto(artworkRepository.save(artwork));
        }

        @Transactional
        public ArtworkListingDto toggleLike(
                        Long accountId,
                        Long artworkId) {

                ArtworkListing artwork = artworkRepository.findById(artworkId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));

                if (likeRepository.existsByAccountIdAndArtworkId(accountId, artworkId)) {

                        ArtworkLike like = likeRepository
                                        .findByAccountIdAndArtworkId(accountId, artworkId)
                                        .orElseThrow();

                        likeRepository.delete(like);

                        artwork.setLikeCount(
                                        Math.max(0, artwork.getLikeCount() - 1));

                } else {

                        PlatformAccount account = accountRepository.findById(accountId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

                        ArtworkLike like = ArtworkLike.builder()
                                        .account(account)
                                        .artwork(artwork)
                                        .build();

                        likeRepository.save(like);

                        artwork.setLikeCount(artwork.getLikeCount() + 1);
                        if (!artwork.getPortfolio().getAccount().getId().equals(accountId)) {
                                notificationService.create(
                                                artwork.getPortfolio().getAccount().getId(),
                                                "ARTWORK_LIKED",
                                                "Someone liked your artwork \"" + artwork.getTitle() + "\".");
                        }
                }

                artworkRepository.save(artwork);

                return mapToDto(artwork);
        }

        public ArtworkListingDto mapToDto(ArtworkListing artwork) {

                PlatformAccount artist = artwork.getPortfolio().getAccount();

                String artistName = (artist.getUsername() != null &&
                                !artist.getUsername().isBlank())
                                                ? artist.getUsername()
                                                : artist.getEmail();

                return ArtworkListingDto.builder()
                                .id(artwork.getId())
                                .title(artwork.getTitle())
                                .description(artwork.getDescription())
                                .price(artwork.getPrice())
                                .mediaUrl(artwork.getMediaUrl())
                                .availabilityStatus(artwork.getAvailabilityStatus())
                                .category(artwork.getCategory())
                                .tags(artwork.getTags())
                                .likeCount(artwork.getLikeCount())
                                .viewCount(artwork.getViewCount())
                                .isFeatured(artwork.getIsFeatured())
                                .createdAt(artwork.getCreatedAt())
                                .artistId(artist.getId())
                                .artistPortfolioId(artwork.getPortfolio().getId())
                                .artistName(artistName)
                                .artistEmail(artist.getEmail())
                                .build();
        }
}