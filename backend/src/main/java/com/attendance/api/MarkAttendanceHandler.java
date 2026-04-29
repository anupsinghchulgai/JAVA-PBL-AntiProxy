package com.attendance.api;

import com.attendance.model.*;
import com.attendance.util.GeoUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class MarkAttendanceHandler implements HttpHandler {
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
            String token       = CorsUtil.extractString(body, "token");
            String studentId   = CorsUtil.extractString(body, "studentId");
            String studentName = CorsUtil.extractString(body, "studentName");
            double studentLat  = CorsUtil.extractDouble(body, "studentLat");
            double studentLng  = CorsUtil.extractDouble(body, "studentLng");

            if (token == null || studentId == null || studentName == null) {
                CorsUtil.sendError(ex, 400, "token, studentId, studentName are required"); return;
            }

            // 1. Token check
            TokenRecord tokenRecord = DataStore.getInstance().getToken(token);
            if (tokenRecord == null) {
                CorsUtil.sendError(ex, 404, "QR code not recognised. Please re-scan."); return;
            }
            if (tokenRecord.isExpired()) {
                DataStore.getInstance().removeToken(token);
                CorsUtil.sendError(ex, 410, "QR code expired. Scan the latest code from the board."); return;
            }

            String  sessionId = tokenRecord.getSessionId();
            Session session   = DataStore.getInstance().getSession(sessionId);
            if (session == null || !session.isActive()) {
                CorsUtil.sendError(ex, 404, "Attendance session is no longer active."); return;
            }

            // 2. One-time entry guard
            if (DataStore.getInstance().hasMarked(sessionId, studentId)) {
                CorsUtil.sendError(ex, 409, "Attendance already marked for " +
                    CorsUtil.escapeJson(studentId) + " in this session."); return;
            }

            // 3. Haversine geofence (strict 10m)
            double distance = GeoUtil.haversineDistance(
                session.getTeacherLat(), session.getTeacherLng(), studentLat, studentLng);
            if (!GeoUtil.isWithinGeofence(
                    session.getTeacherLat(), session.getTeacherLng(), studentLat, studentLng)) {
                CorsUtil.sendError(ex, 403,
                    String.format("You are %.1fm away. Must be within 10m of the classroom.", distance));
                return;
            }

            // 4. Record
            AttendanceRecord record = new AttendanceRecord(
                sessionId, studentId, studentName, studentLat, studentLng, distance);
            DataStore.getInstance().recordAttendance(record);
            CorsUtil.sendOk(ex, record.toJson());

        } catch (NumberFormatException e) {
            CorsUtil.sendError(ex, 400, "Invalid latitude/longitude format.");
        } catch (IllegalArgumentException e) {
            CorsUtil.sendError(ex, 400, e.getMessage());
        } catch (Exception e) {
            CorsUtil.sendError(ex, 500, "Server error: " + e.getMessage());
        }
    }
}
