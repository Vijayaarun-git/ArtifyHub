package com.example.demo.config;

import com.example.demo.repository.PlatformAccountRepository;
import com.example.demo.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final PlatformAccountRepository accountRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getServletPath();

        // Skip Swagger/OpenAPI endpoints
        if (requestPath.startsWith("/swagger-ui")
                || requestPath.startsWith("/v3/api-docs")
                || requestPath.startsWith("/swagger-resources")
                || requestPath.startsWith("/webjars")) {

            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {

            String email = jwtService.extractUsername(jwt);

            if (email != null
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.isTokenValid(jwt, email)) {

                Claims claims = jwtService.extractClaim(jwt, c -> c);

                String role = claims.get("role", String.class);
                Object accountIdClaim = claims.get("accountId");
                Long accountId = accountIdClaim instanceof Number
                        ? ((Number) accountIdClaim).longValue()
                        : accountIdClaim == null ? null : Long.valueOf(accountIdClaim.toString());

                if (accountId == null
                        || (!"DIGITAL_ARTIST".equals(role)
                                && !"ART_COLLECTOR".equals(role)
                                && !"PLATFORM_CURATOR".equals(role))) {
                    filterChain.doFilter(request, response);
                    return;
                }
                if (accountRepository.findById(accountId)
                        .filter(account -> Boolean.TRUE.equals(account.getIsActive()))
                        .isEmpty()) {
                    filterChain.doFilter(request, response);
                    return;
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        accountId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (RuntimeException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}