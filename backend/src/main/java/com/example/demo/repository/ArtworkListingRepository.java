package com.example.demo.repository;

import com.example.demo.entity.ArtworkListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.util.List;

public interface ArtworkListingRepository extends JpaRepository<ArtworkListing, Long> {

        List<ArtworkListing> findByPortfolioIdAndAvailabilityStatus(
                        Long portfolioId,
                        String status);

        List<ArtworkListing> findByAvailabilityStatusOrderByCreatedAtDesc(
                        String status);

        List<ArtworkListing> findByAvailabilityStatusAndCategoryOrderByCreatedAtDesc(
                        String status,
                        String category);

        List<ArtworkListing> findAllByOrderByCreatedAtDesc();

        long countByPortfolioId(Long portfolioId);

        long countByAvailabilityStatus(String status);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT a FROM ArtworkListing a WHERE a.id = :id")
        java.util.Optional<ArtworkListing> findByIdForUpdate(@Param("id") Long id);

        @Query("""
                        SELECT a
                        FROM ArtworkListing a
                        WHERE a.availabilityStatus <> 'HIDDEN'
                        AND (
                                LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                             OR LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                             OR LOWER(a.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        )
                        AND (:category IS NULL OR a.category = :category)
                        AND (:minPrice IS NULL OR a.price >= :minPrice)
                        AND (:maxPrice IS NULL OR a.price <= :maxPrice)
                        ORDER BY a.createdAt DESC
                        """)
        List<ArtworkListing> searchArtworks(
                        @Param("keyword") String keyword,
                        @Param("category") String category,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice);

        @Query("""
                        SELECT a
                        FROM ArtworkListing a
                        WHERE a.availabilityStatus <> 'HIDDEN'
                        ORDER BY a.likeCount DESC
                        """)
        List<ArtworkListing> findTopByLikes();

        @Query("""
                        SELECT a
                        FROM ArtworkListing a
                        WHERE a.availabilityStatus <> 'HIDDEN'
                        ORDER BY a.viewCount DESC
                        """)
        List<ArtworkListing> findTrending();

}