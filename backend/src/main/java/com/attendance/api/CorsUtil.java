package com.attendance.api;

import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class CorsUtil {
    private CorsUtil() {}

    public static void addCorsHeaders(HttpExchange ex) {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin",  "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
    }

    public static void sendJson(HttpExchange ex, int status, String json) throws IOException {
        addCorsHeaders(ex);
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }

    public static void sendOk(HttpExchange ex, String data) throws IOException {
        sendJson(ex, 200, "{\"success\":true,\"data\":" + data + "}");
    }

    public static void sendError(HttpExchange ex, int status, String msg) throws IOException {
        sendJson(ex, status, "{\"success\":false,\"error\":\"" + escapeJson(msg) + "\"}");
    }

    public static String readBody(HttpExchange ex) throws IOException {
        try (BufferedReader r = new BufferedReader(
                new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8))) {
            return r.lines().collect(Collectors.joining("\n"));
        }
    }

    public static String extractString(String json, String key) {
        String search = "\"" + key + "\"";
        int ki = json.indexOf(search);
        if (ki < 0) return null;
        int colon = json.indexOf(':', ki + search.length());
        if (colon < 0) return null;
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) start++;
        if (start >= json.length()) return null;
        if (json.charAt(start) == '"') {
            int end = json.indexOf('"', start + 1);
            return end > start ? json.substring(start + 1, end) : null;
        }
        int end = start;
        while (end < json.length() && ",}]".indexOf(json.charAt(end)) < 0) end++;
        return json.substring(start, end).trim();
    }

    public static double extractDouble(String json, String key) {
        String val = extractString(json, key);
        if (val == null) throw new IllegalArgumentException("Missing field: " + key);
        return Double.parseDouble(val);
    }

    public static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\","\\\\").replace("\"","\\\"")
                .replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
    }
}
