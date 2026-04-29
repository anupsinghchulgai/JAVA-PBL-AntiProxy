package com.attendance.model;

import java.time.Instant;

public class TokenRecord {
    public static final long TOKEN_TTL_MS = 10_000L;

    private final String token;
    private final String sessionId;
    private final long   issuedAt;
    private final long   expiresAt;

    public TokenRecord(String token, String sessionId) {
        this.token     = token;
        this.sessionId = sessionId;
        this.issuedAt  = Instant.now().toEpochMilli();
        this.expiresAt = this.issuedAt + TOKEN_TTL_MS;
    }

    public String  getToken()     { return token; }
    public String  getSessionId() { return sessionId; }
    public long    getIssuedAt()  { return issuedAt; }
    public long    getExpiresAt() { return expiresAt; }
    public boolean isExpired()    { return Instant.now().toEpochMilli() > expiresAt; }
    public long    remainingMs()  { return Math.max(0, expiresAt - Instant.now().toEpochMilli()); }

    public String toJson() {
        return String.format(
            "{\"token\":\"%s\",\"sessionId\":\"%s\",\"issuedAt\":%d,\"expiresAt\":%d,\"remainingMs\":%d}",
            token, sessionId, issuedAt, expiresAt, remainingMs());
    }
}
