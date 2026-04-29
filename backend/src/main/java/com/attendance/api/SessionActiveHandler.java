package com.attendance.api;

import com.attendance.model.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Optional;

public class SessionActiveHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            CorsUtil.addCorsHeaders(ex); ex.sendResponseHeaders(204, -1); return;
        }
        Optional<Session> active = DataStore.getInstance().getActiveSession();
        if (active.isPresent()) CorsUtil.sendOk(ex, active.get().toJson());
        else CorsUtil.sendError(ex, 404, "No active session");
    }
}
