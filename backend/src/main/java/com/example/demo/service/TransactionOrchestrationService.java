package com.example.demo.service;

import com.example.demo.dto.TransactionResultDto;
import com.example.demo.entity.ArtTransaction;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.entity.ArtworkListing;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ArtTransactionRepository;
import com.example.demo.repository.ArtistPortfolioRepository;
import com.example.demo.repository.ArtworkListingRepository;
import com.example.demo.repository.PlatformAccountRepository;
import com.example.demo.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TransactionOrchestrationService {

        private final ArtTransactionRepository transactionRepository;
        private final ArtworkListingRepository artworkRepository;
        private final PlatformAccountRepository accountRepository;
        private final ArtistPortfolioRepository portfolioRepository;
        private final WishlistRepository wishlistRepository;
        private final NotificationService notificationService;
        private final JdbcTemplate jdbcTemplate;

        @Transactional(propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
        public TransactionResultDto processCheckout(
                        Long collectorId,
                        Long artworkId) {

                PlatformAccount collector = accountRepository.findById(collectorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Collector not found"));

                ArtworkListing artwork = artworkRepository.findByIdForUpdate(artworkId)
                                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));

                if (!"AVAILABLE".equalsIgnoreCase(artwork.getAvailabilityStatus())) {
                        throw new BusinessValidationException(
                                        "Artwork is no longer available");
                }

                if (artwork.getPortfolio()
                                .getAccount()
                                .getId()
                                .equals(collectorId)) {

                        throw new BusinessValidationException(
                                        "You cannot buy your own artwork");
                }

                artwork.setAvailabilityStatus("SOLD");
                artworkRepository.save(artwork);

                ArtTransaction transaction = ArtTransaction.builder()
                                .collector(collector)
                                .artwork(artwork)
                                .transactionAmount(artwork.getPrice())
                                .status("COMPLETED")
                                .build();

                transaction = transactionRepository.save(transaction);
                wishlistRepository.deleteByAccountIdAndArtworkId(collectorId, artworkId);

                ArtistPortfolio portfolio = artwork.getPortfolio();

                portfolio.setTotalSalesVolume(
                                portfolio.getTotalSalesVolume().add(artwork.getPrice()));

                portfolioRepository.save(portfolio);
                notificationService.create(
                                portfolio.getAccount().getId(),
                                "ARTWORK_SOLD",
                                "Your artwork \"" + artwork.getTitle() + "\" was purchased.");

                return mapToDto(transaction);
        }

        @Transactional(readOnly = true)
        public List<TransactionResultDto> getCollectorHistory(Long collectorId) {

                return transactionRepository
                                .findByCollectorIdOrderByPurchaseDateDesc(collectorId)
                                .stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<TransactionResultDto> getPlatformTransactions() {

                return transactionRepository
                                .findAllByOrderByPurchaseDateDesc()
                                .stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void resetPlatform() {
                // Use direct SQL so stale JPA relationships cannot prevent the
                // transaction rows from being cleared during a full reset.
                jdbcTemplate.update("DELETE FROM art_transaction");
                jdbcTemplate.update("UPDATE artwork_listing SET availability_status = 'AVAILABLE'");
                jdbcTemplate.update("UPDATE artist_portfolio SET total_sales_volume = 0");
        }

        private TransactionResultDto mapToDto(ArtTransaction transaction) {

                ArtworkListing artwork = transaction.getArtwork();

                return TransactionResultDto.builder()
                                .id(transaction.getId())
                                .artworkId(artwork.getId())
                                .artworkTitle(artwork.getTitle())
                                .artworkMediaUrl(artwork.getMediaUrl())
                                .transactionAmount(transaction.getTransactionAmount())
                                .status(transaction.getStatus())
                                .purchaseDate(transaction.getPurchaseDate())
                                .build();
        }
}