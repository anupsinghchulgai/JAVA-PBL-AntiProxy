package com.attendance.server;

import com.attendance.api.*;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Main {
    private static int getPort() {
        String portEnv = System.getenv("PORT");
        if (portEnv == null || portEnv.isBlank()) return 8080;
        try {
            return Integer.parseInt(portEnv.trim());
        } catch (NumberFormatException ignored) {
            return 8080;
        }
    }

    public static void main(String[] args) throws IOException {
        int port = getPort();

        // ✅ Mobile access ke liye
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);

        server.createContext("/api/token/generate",  new TokenGenerateHandler());
        server.createContext("/api/token/validate",  new TokenValidateHandler());
        server.createContext("/api/attendance/mark", new MarkAttendanceHandler());
        server.createContext("/api/attendance/list", new AttendanceListHandler());
        server.createContext("/api/session/create",  new SessionCreateHandler());
        server.createContext("/api/session/active",  new SessionActiveHandler());
        server.createContext("/api/",                new CorsPreflightHandler());

        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();

        // ✅ Clean output (no encoding error)
        System.out.println("===========================================");
        System.out.println(" Anti-Proxy Attendance System v1.0 ");
        System.out.println(" Backend running on port " + port + " ");
        System.out.println("===========================================");
    }

    static class CorsPreflightHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            CorsUtil.addCorsHeaders(exchange);

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
            } else {
                exchange.sendResponseHeaders(404, -1);
            }
        }
    }
}