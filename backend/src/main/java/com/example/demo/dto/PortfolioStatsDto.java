package com.example.demo.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioStatsDto {

    private BigDecimal totalSalesVolume;
    private int totalArtworks;

}