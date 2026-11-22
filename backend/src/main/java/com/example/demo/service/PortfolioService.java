package com.example.demo.service;

import com.example.demo.dto.PortfolioStatsDto;
import com.example.demo.dto.PortfolioUpdateDto;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ArtTransactionRepository;
import com.example.demo.repository.ArtistPortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final ArtistPortfolioRepository portfolioRepository;
    private final ArtTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public ArtistPortfolio getMyPortfolio(Long accountId) {

        return portfolioRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist portfolio not found"));
    }

    @Transactional
    public ArtistPortfolio updatePortfolio(Long accountId,
            PortfolioUpdateDto dto) {

        ArtistPortfolio portfolio = getMyPortfolio(accountId);

        if (dto.getBiography() != null) {
            portfolio.setBiography(dto.getBiography());
        }

        if (dto.getSkills() != null) {
            portfolio.setSkills(dto.getSkills());
        }

        if (dto.getPortfolioUrl() != null) {
            portfolio.setPortfolioUrl(dto.getPortfolioUrl());
        }

        if (dto.getWebsiteUrl() != null) {
            portfolio.setWebsiteUrl(dto.getWebsiteUrl());
        }

        if (dto.getInstagramUrl() != null) {
            portfolio.setInstagramUrl(dto.getInstagramUrl());
        }

        if (dto.getTwitterUrl() != null) {
            portfolio.setTwitterUrl(dto.getTwitterUrl());
        }

        if (dto.getSpecializations() != null) {
            portfolio.setSpecializations(dto.getSpecializations());
        }

        return portfolioRepository.save(portfolio);
    }

    @Transactional(readOnly = true)
    public PortfolioStatsDto getPortfolioStats(Long portfolioId) {

        ArtistPortfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist portfolio not found"));

        BigDecimal totalSales = transactionRepository.calculateTotalSalesForPortfolio(portfolio.getId());

        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        return PortfolioStatsDto.builder()
                .totalSalesVolume(totalSales)
                .totalArtworks(portfolio.getArtworks().size())
                .build();
    }
}