package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "artwork_listing")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private ArtistPortfolio portfolio;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 500)
    private String mediaUrl;

    @Builder.Default
    @Column(nullable = false)
    private String availabilityStatus = "AVAILABLE";

    private String category;

    @Column(length = 500)
    private String tags;

    @Builder.Default
    @Column(nullable = false)
    private Integer likeCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer viewCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isFeatured = false;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "artwork", fetch = FetchType.LAZY)
    @JsonIgnore
    private ArtTransaction transaction;

    @OneToMany(mappedBy = "artwork",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtworkLike> likes = new ArrayList<>();

    @OneToMany(mappedBy = "artwork",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    @OneToMany(mappedBy = "artwork",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtworkComment> comments = new ArrayList<>();
}