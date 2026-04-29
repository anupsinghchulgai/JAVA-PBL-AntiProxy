package com.attendance.api;

import com.attendance.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.UUID;

public class SessionCreateHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.addCorsHeaders(ex); ex.sendResponseHeaders(204, -1); return;
        }
        if (!"POST".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.sendError(ex, 405, "Method not allowed"); return;
        }
        try {
            String body        = CorsUtil.readBody(ex);
            String teacherName = CorsUtil.extractString(body, "teacherName");
            String subject     = CorsUtil.extractString(body, "subject");
            double lat         = CorsUtil.extractDouble(body, "teacherLat");
            double lng         = CorsUtil.extractDouble(body, "teacherLng");

            if (teacherName == null || subject == null) {
                CorsUtil.sendError(ex, 400, "teacherName and subject are required"); return;
            }
            DataStore.getInstance().getActiveSession().ifPresent(s -> s.setActive(false));

            String  sessionId = UUID.randomUUID().toString().replace("-","").substring(0, 12);
            Session session   = new Session(sessionId, teacherName, subject, lat, lng);
            DataStore.getInstance().putSession(session);
            CorsUtil.sendOk(ex, session.toJson());
        } catch (Exception e) {
            CorsUtil.sendError(ex, 500, e.getMessage());
        }
    }
}
