package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "artist_follow",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"follower_id", "artist_portfolio_id"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private PlatformAccount follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_portfolio_id", nullable = false)
    private ArtistPortfolio artistPortfolio;

}