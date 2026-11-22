package com.example.demo.repository;

import com.example.demo.entity.ArtworkComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtworkCommentRepository extends JpaRepository<ArtworkComment, Long> {

        List<ArtworkComment> findByArtworkIdOrderByCreatedAtDesc(
                        Long artworkId);

        long countByArtworkId(
                        Long artworkId);

}