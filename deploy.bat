@echo off
REM GreenMate Frontend 배포 스크립트 (Windows)
REM 사용법: deploy.bat

setlocal enabledelayedexpansion

REM 서버 정보
set SERVER_IP=103.244.108.70
set SERVER_USER=root
set SERVER_PASSWORD=hlihli1!
set GITHUB_REPO=https://github.com/mhsssshin/GreenMate_FE.git
set PROJECT_NAME=GreenMate_FE
set DEPLOY_DIR=/var/www/greenmate

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
    git commit -m "Deploy: %date% %time%"
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
echo.
echo # 서버 배포 스크립트
echo set -e
echo.
echo # 설정
echo GITHUB_REPO="https://github.com/mhsssshin/GreenMate_FE.git"
echo PROJECT_NAME="GreenMate_FE"
echo DEPLOY_DIR="/var/www/greenmate"
echo BACKUP_DIR="/var/backups/greenmate"
echo NODE_VERSION="18"
echo.
echo # 색상 코드
echo RED='\033[0;31m'
echo GREEN='\033[0;32m'
echo YELLOW='\033[1;33m'
echo BLUE='\033[0;34m'
echo NC='\033[0m'
echo.
echo log_info^(^) {
echo     echo -e "${BLUE}[INFO]${NC} $1"
echo }
echo.
echo log_success^(^) {
echo     echo -e "${GREEN}[SUCCESS]${NC} $1"
echo }
echo.
echo log_warning^(^) {
echo     echo -e "${YELLOW}[WARNING]${NC} $1"
echo }
echo.
echo log_error^(^) {
echo     echo -e "${RED}[ERROR]${NC} $1"
echo }
echo.
echo # Node.js 설치 확인 및 설치
echo install_nodejs^(^) {
echo     if ! command -v node ^&^> /dev/null; then
echo         log_info "Node.js 설치 중..."
echo         curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x ^| sudo -E bash -
echo         apt-get install -y nodejs
echo         log_success "Node.js 설치 완료"
echo     else
echo         log_info "Node.js가 이미 설치되어 있습니다: $(node --version^)"
echo     fi
echo }
echo.
echo # PM2 설치 확인 및 설치
echo install_pm2^(^) {
echo     if ! command -v pm2 ^&^> /dev/null; then
echo         log_info "PM2 설치 중..."
echo         npm install -g pm2
echo         log_success "PM2 설치 완료"
echo     else
echo         log_info "PM2가 이미 설치되어 있습니다: $(pm2 --version^)"
echo     fi
echo }
echo.
echo # 백업 생성
echo create_backup^(^) {
echo     if [ -d "$DEPLOY_DIR" ]; then
echo         log_info "기존 배포 디렉토리 백업 중..."
echo         mkdir -p "$BACKUP_DIR"
echo         cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$(date +%%Y%%m%%d_%%H%%M%%S^)"
echo         log_success "백업 완료"
echo     fi
echo }
echo.
echo # 소스 다운로드
echo download_source^(^) {
echo     log_info "GitHub에서 소스 다운로드 중..."
echo     rm -rf "$DEPLOY_DIR"
echo     git clone "$GITHUB_REPO" "$DEPLOY_DIR"
echo     log_success "소스 다운로드 완료"
echo }
echo.
echo # 의존성 설치 및 빌드
echo build_project^(^) {
echo     log_info "프로젝트 빌드 중..."
echo     cd "$DEPLOY_DIR"
echo     npm install
echo     npm run build
echo     log_success "빌드 완료"
echo }
echo.
echo # 웹서비스 재기동
echo restart_service^(^) {
echo     log_info "웹서비스 재기동 중..."
echo     cd "$DEPLOY_DIR"
echo     pm2 stop greenmate ^|^| true
echo     pm2 delete greenmate ^|^| true
echo     pm2 start npm --name "greenmate" -- start
echo     pm2 save
echo     pm2 startup
echo     log_success "웹서비스 재기동 완료"
echo }
echo.
echo # Nginx 설정
echo setup_nginx^(^) {
echo     if ! command -v nginx ^&^> /dev/null; then
echo         log_info "Nginx 설치 중..."
echo         apt-get update
echo         apt-get install -y nginx
echo.
echo         cat ^> /etc/nginx/sites-available/greenmate ^<^< EOF
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
echo         ln -sf /etc/nginx/sites-available/greenmate /etc/nginx/sites-enabled/
echo         rm -f /etc/nginx/sites-enabled/default
echo         systemctl restart nginx
echo         systemctl enable nginx
echo         log_success "Nginx 설정 완료"
echo     fi
echo }
echo.
echo # 메인 배포 함수
echo main^(^) {
echo     log_info "GreenMate 배포 시작..."
echo     apt-get update
echo     install_nodejs
echo     install_pm2
echo     create_backup
echo     download_source
echo     build_project
echo     setup_nginx
echo     restart_service
echo     log_success "배포 완료! 서비스가 http://103.244.108.70 에서 실행 중입니다."
echo     pm2 status
echo }
echo.
echo main "$@"
) > server_deploy.sh

REM 서버에 배포 스크립트 업로드 및 실행
echo 서버에 배포 스크립트 업로드 중...
pscp -pw %SERVER_PASSWORD% server_deploy.sh %SERVER_USER%@%SERVER_IP%:/tmp/server_deploy.sh

echo 서버에서 배포 스크립트 실행 중...
plink -pw %SERVER_PASSWORD% %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/server_deploy.sh && /tmp/server_deploy.sh"

REM 임시 파일 정리
del server_deploy.sh

echo.
echo [SUCCESS] 전체 배포 프로세스 완료!
echo 서비스 URL: http://103.244.108.70
echo.
pause
