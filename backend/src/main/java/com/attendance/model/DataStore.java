package com.attendance.model;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class DataStore {
    private static final DataStore INSTANCE = new DataStore();
    public static DataStore getInstance() { return INSTANCE; }
    private DataStore() {}

    private final Map<String, Session>                sessions    = new ConcurrentHashMap<>();
    private final Map<String, TokenRecord>            tokens      = new ConcurrentHashMap<>();
    private final Map<String, List<AttendanceRecord>> attendance  = new ConcurrentHashMap<>();
    private final Set<String>                         markedPairs = Collections.synchronizedSet(new HashSet<>());

    public void putSession(Session s) {
        sessions.put(s.getSessionId(), s);
        attendance.put(s.getSessionId(), Collections.synchronizedList(new ArrayList<>()));
    }
    public Session getSession(String id)        { return sessions.get(id); }
    public Optional<Session> getActiveSession() {
        return sessions.values().stream().filter(Session::isActive).findFirst();
    }

    public void putToken(String token, TokenRecord r) { tokens.put(token, r); }
    public TokenRecord getToken(String token)          { return tokens.get(token); }
    public void removeToken(String token)              { tokens.remove(token); }
    public void purgeSessionTokens(String sessionId) {
        tokens.entrySet().removeIf(e -> sessionId.equals(e.getValue().getSessionId()));
    }

    public boolean hasMarked(String sessionId, String studentId) {
        return markedPairs.contains(sessionId + ":" + studentId);
    }
    public void recordAttendance(AttendanceRecord r) {
        markedPairs.add(r.getSessionId() + ":" + r.getStudentId());
        attendance.computeIfAbsent(r.getSessionId(),
            id -> Collections.synchronizedList(new ArrayList<>())).add(r);
    }
    public List<AttendanceRecord> getAttendance(String sessionId) {
        return attendance.getOrDefault(sessionId, Collections.emptyList());
    }
}
