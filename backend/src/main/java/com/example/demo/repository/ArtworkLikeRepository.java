package com.example.demo.repository;

import com.example.demo.entity.ArtworkLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArtworkLikeRepository extends JpaRepository<ArtworkLike, Long> {

        Optional<ArtworkLike> findByAccountIdAndArtworkId(
                        Long accountId,
                        Long artworkId);

        boolean existsByAccountIdAndArtworkId(
                        Long accountId,
                        Long artworkId);

        List<ArtworkLike> findByAccountId(
                        Long accountId);

        long countByArtworkId(
                        Long artworkId);

}