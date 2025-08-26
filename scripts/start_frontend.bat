@echo off
echo Starting MariThon Frontend Server...
cd /d "F:\CODING\MariThon\marithon_frontend"
echo Starting HTTP server on http://localhost:8080
python -m http.server 8080
pause
