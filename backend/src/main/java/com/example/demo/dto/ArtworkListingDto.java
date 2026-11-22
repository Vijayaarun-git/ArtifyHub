package com.example.demo.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkListingDto {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String mediaUrl;
    private String availabilityStatus;
    private String category;
    private String tags;
    private Integer likeCount;
    private Integer viewCount;
    private Boolean isFeatured;
    private LocalDateTime createdAt;

    private Long artistId;
    private Long artistPortfolioId;
    private String artistName;
    private String artistEmail;

}