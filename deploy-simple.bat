@echo off
REM GreenMate Frontend 간단 배포 스크립트
REM 사용법: deploy-simple.bat

setlocal enabledelayedexpansion

echo.
echo ========================================
echo    GreenMate Frontend 배포 시작
echo ========================================
echo.

REM 1단계: GitHub에 푸시
echo [1단계] GitHub에 코드 푸시 중...

REM Git 상태 확인
git status --porcelain > temp_status.txt
set /p has_changes=<temp_status.txt
del temp_status.txt

if not "!has_changes!"=="" (
    echo 변경사항을 커밋합니다...
    git add .
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
    git commit -m "Deploy: !mydate! !mytime!"
)

REM GitHub에 푸시
git push origin master
if errorlevel 1 (
    echo [ERROR] GitHub 푸시 실패
    pause
    exit /b 1
)

echo [SUCCESS] GitHub 푸시 완료
echo.

REM 2단계: 서버에서 배포
echo [2단계] 서버에서 배포 시작...

REM 서버 배포 스크립트 생성
(
echo #!/bin/bash
echo set -e
echo.
echo GITHUB_REPO="https://github.com/mhsssshin/GreenMate_FE.git"
echo DEPLOY_DIR="/var/www/greenmate"
echo BACKUP_DIR="/var/backups/greenmate"
echo.
echo echo "GreenMate 배포 시작..."
echo.
echo # Node.js 설치 확인
echo if ! command -v node ^&^> /dev/null; then
echo     echo "Node.js 설치 중..."
echo     curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo     apt-get install -y nodejs
echo     echo "Node.js 설치 완료"
echo else
echo     echo "Node.js 버전: $(node --version^)"
echo fi
echo.
echo # PM2 설치 확인
echo if ! command -v pm2 ^&^> /dev/null; then
echo     echo "PM2 설치 중..."
echo     npm install -g pm2
echo     echo "PM2 설치 완료"
echo else
echo     echo "PM2 버전: $(pm2 --version^)"
echo fi
echo.
echo # 백업 생성
echo if [ -d "$DEPLOY_DIR" ]; then
echo     echo "기존 배포 디렉토리 백업 중..."
echo     mkdir -p "$BACKUP_DIR"
echo     cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$(date +%%Y%%m%%d_%%H%%M%%S^)"
echo     echo "백업 완료"
echo fi
echo.
echo # 소스 다운로드
echo echo "GitHub에서 소스 다운로드 중..."
echo rm -rf "$DEPLOY_DIR"
echo git clone "$GITHUB_REPO" "$DEPLOY_DIR"
echo echo "소스 다운로드 완료"
echo.
echo # 빌드
echo echo "프로젝트 빌드 중..."
echo cd "$DEPLOY_DIR"
echo npm install
echo npm run build
echo echo "빌드 완료"
echo.
echo # Nginx 설정
echo if ! command -v nginx ^&^> /dev/null; then
echo     echo "Nginx 설치 중..."
echo     apt-get update
echo     apt-get install -y nginx
echo.
echo     cat ^> /etc/nginx/sites-available/greenmate ^<^< EOF
echo server {
echo     listen 80;
echo     server_name _;
echo     location / {
echo         proxy_pass http://localhost:3000;
echo         proxy_http_version 1.1;
echo         proxy_set_header Upgrade \$http_upgrade;
echo         proxy_set_header Connection 'upgrade';
echo         proxy_set_header Host \$host;
echo         proxy_set_header X-Real-IP \$remote_addr;
echo         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto \$scheme;
echo         proxy_cache_bypass \$http_upgrade;
echo     }
echo }
echo EOF
echo.
echo     ln -sf /etc/nginx/sites-available/greenmate /etc/nginx/sites-enabled/
echo     rm -f /etc/nginx/sites-enabled/default
echo     systemctl restart nginx
echo     systemctl enable nginx
echo     echo "Nginx 설정 완료"
echo fi
echo.
echo # 서비스 재기동
echo echo "웹서비스 재기동 중..."
echo cd "$DEPLOY_DIR"
echo pm2 stop greenmate ^|^| true
echo pm2 delete greenmate ^|^| true
echo pm2 start npm --name "greenmate" -- start
echo pm2 save
echo pm2 startup
echo echo "웹서비스 재기동 완료"
echo.
echo echo "배포 완료! 서비스가 http://103.244.108.70 에서 실행 중입니다."
echo pm2 status
) > server_deploy.sh

echo 서버에 배포 스크립트 업로드 중...

REM PuTTY의 pscp 사용 (PuTTY 설치 필요)
if exist "C:\Program Files\PuTTY\pscp.exe" (
    "C:\Program Files\PuTTY\pscp.exe" -pw hlihli1! server_deploy.sh root@103.244.108.70:/tmp/server_deploy.sh
) else (
    echo [ERROR] PuTTY가 설치되어 있지 않습니다.
    echo 다음 링크에서 PuTTY를 다운로드하여 설치하세요:
    echo https://www.putty.org/
    pause
    exit /b 1
)

echo 서버에서 배포 스크립트 실행 중...

REM PuTTY의 plink 사용
if exist "C:\Program Files\PuTTY\plink.exe" (
    "C:\Program Files\PuTTY\plink.exe" -pw hlihli1! root@103.244.108.70 "chmod +x /tmp/server_deploy.sh && /tmp/server_deploy.sh"
) else (
    echo [ERROR] PuTTY plink를 찾을 수 없습니다.
    pause
    exit /b 1
)

REM 임시 파일 정리
del server_deploy.sh

echo.
echo [SUCCESS] 전체 배포 프로세스 완료!
echo 서비스 URL: http://103.244.108.70
echo.
pause
