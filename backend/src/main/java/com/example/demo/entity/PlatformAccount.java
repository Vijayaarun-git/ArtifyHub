package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "platform_account")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role;

    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "account",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @JsonIgnore
    private ArtistPortfolio portfolio;

    @OneToMany(mappedBy = "collector",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtTransaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "account",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtworkLike> artworkLikes = new ArrayList<>();

    @OneToMany(mappedBy = "account",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    @OneToMany(mappedBy = "follower",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtistFollow> followingArtists = new ArrayList<>();

    @OneToMany(mappedBy = "account",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<ArtworkComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "recipient",
            fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

}