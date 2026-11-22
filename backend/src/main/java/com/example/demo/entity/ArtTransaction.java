package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "art_transaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_id", nullable = false)
    private PlatformAccount collector;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id", nullable = false, unique = true)
    private ArtworkListing artwork;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal transactionAmount;

    @Builder.Default
    @Column(nullable = false)
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime purchaseDate;
}