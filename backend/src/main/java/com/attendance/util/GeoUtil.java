package com.attendance.util;

public class GeoUtil {
    private static final double EARTH_RADIUS_METERS    = 6_371_000.0;
    // DEMO: loosen radius so students can be marked even if GPS accuracy differs.
    public  static final double GEOFENCE_RADIUS_METERS = 5000.0; // 5km demo tolerance

    private GeoUtil() {}

    public static double haversineDistance(double lat1, double lng1,
                                           double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public static boolean isWithinGeofence(double teacherLat, double teacherLng,
                                           double studentLat, double studentLng) {
        return haversineDistance(teacherLat, teacherLng, studentLat, studentLng)
               <= GEOFENCE_RADIUS_METERS;
    }
}
