package com.example.demo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.example.demo.entity.PlatformAccount;
import com.example.demo.repository.PlatformAccountRepository;

/**
 * Development reset: start every backend run with an empty application database.
 * The schema is retained and recreated/updated by Hibernate as configured.
 */
@Component
@RequiredArgsConstructor
public class DatabaseResetRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PlatformAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        try {
            jdbcTemplate.execute("TRUNCATE TABLE notification");
            jdbcTemplate.execute("TRUNCATE TABLE artwork_comment");
            jdbcTemplate.execute("TRUNCATE TABLE artwork_like");
            jdbcTemplate.execute("TRUNCATE TABLE wishlist_item");
            jdbcTemplate.execute("TRUNCATE TABLE artist_follow");
            jdbcTemplate.execute("TRUNCATE TABLE art_transaction");
            jdbcTemplate.execute("TRUNCATE TABLE artwork_listing");
            jdbcTemplate.execute("TRUNCATE TABLE artist_portfolio");
            jdbcTemplate.execute("TRUNCATE TABLE platform_account");
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
        }

        accountRepository.save(PlatformAccount.builder()
                .email("arun@admin.com")
                .username("Arun")
                .passwordHash(passwordEncoder.encode("admin"))
                .role("PLATFORM_CURATOR")
                .isActive(true)
                .build());
    }
}
