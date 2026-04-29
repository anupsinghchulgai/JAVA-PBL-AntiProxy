package com.attendance.api;

import com.attendance.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;

public class TokenGenerateHandler implements HttpHandler {
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.addCorsHeaders(ex); ex.sendResponseHeaders(204, -1); return;
        }
        if (!"POST".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.sendError(ex, 405, "Method not allowed"); return;
        }
        try {
            String body      = CorsUtil.readBody(ex);
            String sessionId = CorsUtil.extractString(body, "sessionId");
            if (sessionId == null) { CorsUtil.sendError(ex, 400, "sessionId required"); return; }

            Session session = DataStore.getInstance().getSession(sessionId);
            if (session == null || !session.isActive()) {
                CorsUtil.sendError(ex, 404, "Session not found or inactive"); return;
            }

            DataStore.getInstance().purgeSessionTokens(sessionId);

            byte[] raw   = new byte[32];
            RANDOM.nextBytes(raw);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);

            TokenRecord record = new TokenRecord(token, sessionId);
            DataStore.getInstance().putToken(token, record);
            CorsUtil.sendOk(ex, record.toJson());
        } catch (Exception e) {
            CorsUtil.sendError(ex, 500, e.getMessage());
        }
    }
}
