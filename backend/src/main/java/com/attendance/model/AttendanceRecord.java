package com.attendance.model;

import java.time.Instant;

public class AttendanceRecord {
    private final String sessionId;
    private final String studentId;
    private final String studentName;
    private final double studentLat;
    private final double studentLng;
    private final double distanceMeters;
    private final long   markedAt;

    public AttendanceRecord(String sessionId, String studentId, String studentName,
                            double studentLat, double studentLng, double distanceMeters) {
        this.sessionId      = sessionId;
        this.studentId      = studentId;
        this.studentName    = studentName;
        this.studentLat     = studentLat;
        this.studentLng     = studentLng;
        this.distanceMeters = distanceMeters;
        this.markedAt       = Instant.now().toEpochMilli();
    }

    public String getSessionId()      { return sessionId; }
    public String getStudentId()      { return studentId; }
    public String getStudentName()    { return studentName; }
    public double getStudentLat()     { return studentLat; }
    public double getStudentLng()     { return studentLng; }
    public double getDistanceMeters() { return distanceMeters; }
    public long   getMarkedAt()       { return markedAt; }

    public String toJson() {
        return String.format(
            "{\"sessionId\":\"%s\",\"studentId\":\"%s\",\"studentName\":\"%s\"," +
            "\"studentLat\":%s,\"studentLng\":%s,\"distanceMeters\":%.2f,\"markedAt\":%d}",
            sessionId, studentId, studentName, studentLat, studentLng, distanceMeters, markedAt);
    }
}
