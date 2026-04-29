package com.attendance.api;

import com.attendance.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.List;

public class AttendanceListHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.addCorsHeaders(ex); ex.sendResponseHeaders(204, -1); return;
        }
        try {
            String query     = ex.getRequestURI().getQuery();
            String sessionId = parseParam(query, "sessionId");
            if (sessionId == null) { CorsUtil.sendError(ex, 400, "sessionId required"); return; }

            Session session = DataStore.getInstance().getSession(sessionId);
            if (session == null) { CorsUtil.sendError(ex, 404, "Session not found"); return; }

            List<AttendanceRecord> records = DataStore.getInstance().getAttendance(sessionId);
            StringBuilder sb = new StringBuilder();
            sb.append("{\"sessionId\":\"").append(sessionId).append("\",");
            sb.append("\"subject\":\"").append(CorsUtil.escapeJson(session.getSubject())).append("\",");
            sb.append("\"count\":").append(records.size()).append(",\"records\":[");
            for (int i = 0; i < records.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(records.get(i).toJson());
            }
            sb.append("]}");
            CorsUtil.sendOk(ex, sb.toString());
        } catch (Exception e) {
            CorsUtil.sendError(ex, 500, e.getMessage());
        }
    }

    private String parseParam(String query, String key) {
        if (query == null) return null;
        for (String part : query.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key)) return kv[1];
        }
        return null;
    }
}
