package com.example.demo.repository;

import com.example.demo.entity.PlatformAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlatformAccountRepository extends JpaRepository<PlatformAccount, Long> {

    Optional<PlatformAccount> findByEmail(String email);

}