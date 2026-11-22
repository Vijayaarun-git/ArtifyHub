package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.dto.UpdateProfileRequestDto;
import com.example.demo.entity.ArtistPortfolio;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.repository.ArtistPortfolioRepository;
import com.example.demo.repository.PlatformAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String CURATOR_EMAIL = "arun@admin.com";
    private static final String CURATOR_PASSWORD = "admin";
    private static final Set<String> SUPPORTED_ROLES = Set.of(
            "DIGITAL_ARTIST", "ART_COLLECTOR", "PLATFORM_CURATOR");

    private final PlatformAccountRepository accountRepository;
    private final ArtistPortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {

        String normalizedEmail = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (accountRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new BusinessValidationException("Email already exists");
        }

        String role = request.getRole() == null
                ? ""
                : request.getRole().trim().toUpperCase(Locale.ROOT);
        if (!SUPPORTED_ROLES.contains(role)) {
            throw new BusinessValidationException("Unsupported role");
        }
        if ("PLATFORM_CURATOR".equals(role)) {
            throw new BusinessValidationException("Platform curator accounts are managed by the platform");
        }
        if ("ART_COLLECTOR".equals(role)
                && (request.getPassword() == null
                || request.getPassword().length() < 8
                || !request.getPassword().matches(".*[A-Za-z].*")
                || !request.getPassword().matches(".*\\d.*")
                || !request.getPassword().matches(".*[^A-Za-z0-9].*"))) {
            throw new BusinessValidationException(
                    "Collector password must be at least 8 characters and contain a letter, number, and special character");
        }

        String username = request.getUsername();

        if (username == null || username.isBlank()) {
            username = normalizedEmail.substring(0, normalizedEmail.indexOf("@"));
        }

        PlatformAccount account = PlatformAccount.builder()
                .email(normalizedEmail)
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .avatarUrl(null)
                .isActive(true)
                .build();

        PlatformAccount savedAccount = accountRepository.save(account);

        if ("DIGITAL_ARTIST".equalsIgnoreCase(savedAccount.getRole())) {

            ArtistPortfolio portfolio = ArtistPortfolio.builder()
                    .account(savedAccount)
                    .biography(request.getBiography())
                    .skills(request.getSkills())
                    .specializations(null)
                    .portfolioUrl(null)
                    .websiteUrl(null)
                    .instagramUrl(null)
                    .twitterUrl(null)
                    .totalSalesVolume(BigDecimal.ZERO)
                    .followerCount(0)
                    .isFeatured(false)
                    .build();

            portfolioRepository.save(portfolio);
        }

        return buildAuthResponse(savedAccount);
    }

    @Transactional
    public AuthResponseDto login(AuthRequestDto request) {

        String normalizedEmail = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase(Locale.ROOT);

        PlatformAccount account = accountRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createManagedCurator(normalizedEmail, request.getPassword()));

        if (!passwordEncoder.matches(
                request.getPassword(),
                account.getPasswordHash())) {

            throw new BusinessValidationException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(account.getIsActive())) {
            throw new BusinessValidationException("Account is inactive");
        }

        return buildAuthResponse(account);
    }

    @Transactional
    public AuthResponseDto updateProfile(Long accountId, UpdateProfileRequestDto request) {
        PlatformAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessValidationException("Account not found"));
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        accountRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(accountId))
                .ifPresent(existing -> {
                    throw new BusinessValidationException("Email already exists");
                });

        account.setUsername(request.getUsername().trim());
        account.setEmail(email);
        account.setAvatarUrl(request.getAvatarUrl() == null || request.getAvatarUrl().isBlank()
                ? null
                : request.getAvatarUrl().trim());

        return buildAuthResponse(accountRepository.save(account));
    }

    private PlatformAccount createManagedCurator(String email, String password) {
        if (!CURATOR_EMAIL.equals(email) || !CURATOR_PASSWORD.equals(password)) {
            throw new BusinessValidationException("Invalid email or password");
        }

        return accountRepository.save(PlatformAccount.builder()
                .email(CURATOR_EMAIL)
                .username("Arun")
                .passwordHash(passwordEncoder.encode(CURATOR_PASSWORD))
                .role("PLATFORM_CURATOR")
                .avatarUrl(null)
                .isActive(true)
                .build());
    }

    private AuthResponseDto buildAuthResponse(PlatformAccount account) {

        Map<String, Object> extraClaims = new HashMap<>();

        extraClaims.put("role", account.getRole());
        extraClaims.put("accountId", account.getId());

        String token = jwtService.generateToken(
                extraClaims,
                account.getEmail());

        return AuthResponseDto.builder()
                .token(token)
                .accountId(account.getId())
                .email(account.getEmail())
                .username(account.getUsername())
                .role(account.getRole())
                .avatarUrl(account.getAvatarUrl())
                .build();
    }
}