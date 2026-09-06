package com.kh.workflow.config.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {
        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiration = expiration;
    }

    // JWT 생성
    public String generateToken(
            String empId,
            String authCode,
            Integer empNo
    ) {

        Date now = new Date();
        Date expiry = new Date(
                now.getTime() + expiration
        );

        return Jwts.builder()
                .subject(empId)
                .claim("empNo", empNo)
                .claim("authCode", authCode)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    // JWT에서 empId 추출
    public String getEmpId(String token) {

        return getClaims(token)
                .getSubject();
    }

    // JWT에서 권한 추출
    public String getAuthCode(String token) {

        return getClaims(token)
                .get("authCode", String.class);
    }

    // JWT 검증
    public boolean validateToken(String token) {

        try {

            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            System.out.println(
                    "JWT 검증 예외 : "
                    + e.getClass().getName()
            );

            System.out.println(
                    "JWT 검증 메시지 : "
                    + e.getMessage()
            );

            return false;
        }
    }

    // Claims 추출
    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}