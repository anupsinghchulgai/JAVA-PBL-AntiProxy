#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  build.sh  —  Compile & run backend  (pure javac, NO Maven/Gradle)
#  Usage:  chmod +x build.sh && ./build.sh
# ─────────────────────────────────────────────────────────────────
set -e
SRC="src/main/java"
OUT="out"
MAIN="com.attendance.server.Main"

echo "► Cleaning..."
rm -rf "$OUT" && mkdir -p "$OUT"

echo "► Compiling..."
find "$SRC" -name "*.java" | xargs javac \
  --add-exports java.base/sun.net.httpserver=ALL-UNNAMED \
  -d "$OUT"

echo "✔ Compilation done. Starting server on :8080 ..."
java --add-exports java.base/sun.net.httpserver=ALL-UNNAMED \
     -cp "$OUT" "$MAIN"
