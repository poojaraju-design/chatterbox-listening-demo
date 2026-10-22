#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p dist/audio
cp index.html styles.css app.js session-data.js dist/
cp audio/*.wav audio/*.mp3 dist/audio/
