package com.example.demo.repository;

import com.example.demo.entity.ArtistPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArtistPortfolioRepository extends JpaRepository<ArtistPortfolio, Long> {

    Optional<ArtistPortfolio> findByAccountId(Long accountId);

    List<ArtistPortfolio> findByIsFeaturedTrue();

}