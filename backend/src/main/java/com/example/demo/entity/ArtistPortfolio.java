package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "artist_portfolio")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private PlatformAccount account;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(length = 500)
    private String skills;

    @Column(length = 500)
    private String specializations;

    private String portfolioUrl;

    private String websiteUrl;

    private String instagramUrl;

    private String twitterUrl;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal totalSalesVolume = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private Integer followerCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isFeatured = false;

    @OneToMany(mappedBy = "portfolio",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtworkListing> artworks = new ArrayList<>();

    @OneToMany(mappedBy = "artistPortfolio",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtistFollow> followers = new ArrayList<>();

}