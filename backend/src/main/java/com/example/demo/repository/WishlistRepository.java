package com.example.demo.repository;

import com.example.demo.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

        List<WishlistItem> findByAccountId(
                        Long accountId);

        Optional<WishlistItem> findByAccountIdAndArtworkId(
                        Long accountId,
                        Long artworkId);

        boolean existsByAccountIdAndArtworkId(
                        Long accountId,
                        Long artworkId);

        void deleteByAccountIdAndArtworkId(
                        Long accountId,
                        Long artworkId);

}