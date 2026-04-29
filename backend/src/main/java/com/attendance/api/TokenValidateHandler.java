package com.attendance.api;

import com.attendance.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class TokenValidateHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.addCorsHeaders(ex); ex.sendResponseHeaders(204, -1); return;
        }
        if (!"POST".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.sendError(ex, 405, "Method not allowed"); return;
        }
        try {
            String body  = CorsUtil.readBody(ex);
            String token = CorsUtil.extractString(body, "token");
            if (token == null) { CorsUtil.sendError(ex, 400, "token required"); return; }

            TokenRecord record = DataStore.getInstance().getToken(token);
            if (record == null) { CorsUtil.sendError(ex, 404, "Token not found"); return; }
            if (record.isExpired()) {
                DataStore.getInstance().removeToken(token);
                CorsUtil.sendError(ex, 410, "Token expired"); return;
            }
            Session session = DataStore.getInstance().getSession(record.getSessionId());
            if (session == null || !session.isActive()) {
                CorsUtil.sendError(ex, 404, "Session no longer active"); return;
            }
            CorsUtil.sendOk(ex, record.toJson());
        } catch (Exception e) {
            CorsUtil.sendError(ex, 500, e.getMessage());
        }
    }
}
