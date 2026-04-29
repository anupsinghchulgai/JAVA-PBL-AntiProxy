package com.attendance.model;

import java.time.Instant;

public class Session {
    private final String  sessionId;
    private final String  teacherName;
    private final String  subject;
    private final double  teacherLat;
    private final double  teacherLng;
    private final long    createdAt;
    private volatile boolean active;

    public Session(String sessionId, String teacherName, String subject,
                   double teacherLat, double teacherLng) {
        this.sessionId   = sessionId;
        this.teacherName = teacherName;
        this.subject     = subject;
        this.teacherLat  = teacherLat;
        this.teacherLng  = teacherLng;
        this.createdAt   = Instant.now().toEpochMilli();
        this.active      = true;
    }

    public String  getSessionId()       { return sessionId; }
    public String  getTeacherName()     { return teacherName; }
    public String  getSubject()         { return subject; }
    public double  getTeacherLat()      { return teacherLat; }
    public double  getTeacherLng()      { return teacherLng; }
    public long    getCreatedAt()       { return createdAt; }
    public boolean isActive()           { return active; }
    public void    setActive(boolean a) { this.active = a; }

    public String toJson() {
        return String.format(
            "{\"sessionId\":\"%s\",\"teacherName\":\"%s\",\"subject\":\"%s\"," +
            "\"teacherLat\":%s,\"teacherLng\":%s,\"createdAt\":%d,\"active\":%b}",
            sessionId, teacherName, subject, teacherLat, teacherLng, createdAt, active);
    }
}
