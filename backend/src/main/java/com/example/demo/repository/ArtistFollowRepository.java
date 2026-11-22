package com.example.demo.repository;

import com.example.demo.entity.ArtistFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtistFollowRepository extends JpaRepository<ArtistFollow, Long> {

        Optional<ArtistFollow> findByFollowerIdAndArtistPortfolioId(
                        Long followerId,
                        Long portfolioId);

        boolean existsByFollowerIdAndArtistPortfolioId(
                        Long followerId,
                        Long portfolioId);

        long countByArtistPortfolioId(
                        Long portfolioId);

}