package com.example.demo.repository;

import com.example.demo.entity.ArtTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ArtTransactionRepository extends JpaRepository<ArtTransaction, Long> {

        List<ArtTransaction> findByCollectorIdOrderByPurchaseDateDesc(
                        Long collectorId);

        List<ArtTransaction> findAllByOrderByPurchaseDateDesc();

        @Query("""
                        SELECT COALESCE(SUM(t.transactionAmount), 0)
                        FROM ArtTransaction t
                        WHERE t.artwork.portfolio.id = :portfolioId
                        AND t.status = 'COMPLETED'
                        """)
        BigDecimal calculateTotalSalesForPortfolio(
                        @Param("portfolioId") Long portfolioId);

}