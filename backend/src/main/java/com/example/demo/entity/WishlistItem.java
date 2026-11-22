package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "wishlist_item",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "artwork_id"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private PlatformAccount account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id", nullable = false)
    private ArtworkListing artwork;

}