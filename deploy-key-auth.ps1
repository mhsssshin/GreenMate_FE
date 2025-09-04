# GreenMate Frontend 배포 스크립트 (SSH 키 인증 사용)
# 사용법: .\deploy-key-auth.ps1

param(
    [switch]$SkipPush = $false
)

# 서버 정보
$SERVER_IP = "103.244.108.70"
$SERVER_USER = "root"
$SSH_KEY = "$env:USERPROFILE\.ssh\greenmate_key"
$GITHUB_REPO = "https://github.com/mhsssshin/GreenMate_FE.git"

# 색상 함수
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

# SSH 명령 실행 함수
function Invoke-SSHCommand {
    param($Command)
    
    Write-Info "서버에서 명령 실행: $Command"
    
    $sshCommand = "ssh -i `"$SSH_KEY`" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP `"$Command`""
    Invoke-Expression $sshCommand
}

# SCP 파일 업로드 함수
function Invoke-SCPUpload {
    param($LocalFile, $RemotePath)
    
    Write-Info "파일 업로드: $LocalFile -> $RemotePath"
    
    $scpCommand = "scp -i `"$SSH_KEY`" -o StrictHostKeyChecking=no `"$LocalFile`" $SERVER_USER@$SERVER_IP`:$RemotePath"
    Invoke-Expression $scpCommand
}

# 1단계: GitHub에 푸시
function Push-ToGitHub {
    Write-Info "1단계: GitHub에 코드 푸시 중..."
    
    # Git 상태 확인
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Info "변경사항을 커밋합니다..."
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Deploy: $timestamp"
    }
    
    # GitHub에 푸시
    git push origin master
    if ($LASTEXITCODE -ne 0) {
        Write-Error "GitHub 푸시 실패"
        exit 1
    }
    
    Write-Success "GitHub 푸시 완료"
}

# 2단계: 서버에서 배포
function Deploy-OnServer {
    Write-Info "2단계: 서버에서 배포 시작..."
    
    # 서버 배포 스크립트 생성
    $serverScript = @"
#!/bin/bash
set -e

# 설정
GITHUB_REPO="https://github.com/mhsssshin/GreenMate_FE.git"
PROJECT_NAME="GreenMate_FE"
DEPLOY_DIR="/var/www/greenmate"
BACKUP_DIR="/var/backups/greenmate"
NODE_VERSION="18"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "`${BLUE}[INFO]`${NC} `$1"
}

log_success() {
    echo -e "`${GREEN}[SUCCESS]`${NC} `$1"
}

log_warning() {
    echo -e "`${YELLOW}[WARNING]`${NC} `$1"
}

log_error() {
    echo -e "`${RED}[ERROR]`${NC} `$1"
}

# Node.js 설치 확인 및 설치
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log_info "Node.js 설치 중..."
        curl -fsSL https://rpm.nodesource.com/setup_`${NODE_VERSION}.x | sudo bash -
        dnf install -y nodejs
        log_success "Node.js 설치 완료"
    else
        log_info "Node.js가 이미 설치되어 있습니다: `$(node --version)"
    fi
}

# PM2 설치 확인 및 설치
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 설치 중..."
        npm install -g pm2
        log_success "PM2 설치 완료"
    else
        log_info "PM2가 이미 설치되어 있습니다: `$(pm2 --version)"
    fi
}

# 백업 생성
create_backup() {
    if [ -d "`$DEPLOY_DIR" ]; then
        log_info "기존 배포 디렉토리 백업 중..."
        mkdir -p "`$BACKUP_DIR"
        cp -r "`$DEPLOY_DIR" "`$BACKUP_DIR/backup_`$(date +%Y%m%d_%H%M%S)"
        log_success "백업 완료"
    fi
}

# 소스 다운로드
download_source() {
    log_info "GitHub에서 소스 다운로드 중..."
    rm -rf "`$DEPLOY_DIR"
    git clone "`$GITHUB_REPO" "`$DEPLOY_DIR"
    log_success "소스 다운로드 완료"
}

# 의존성 설치 및 빌드
build_project() {
    log_info "프로젝트 빌드 중..."
    cd "`$DEPLOY_DIR"
    npm install
    npm run build
    log_success "빌드 완료"
}

# 웹서비스 재기동
restart_service() {
    log_info "웹서비스 재기동 중..."
    cd "`$DEPLOY_DIR"
    pm2 stop greenmate || true
    pm2 delete greenmate || true
    pm2 start npm --name "greenmate" -- start
    pm2 save
    pm2 startup
    log_success "웹서비스 재기동 완료"
}

# Nginx 설정
setup_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_info "Nginx 설치 중..."
        dnf update -y
        dnf install -y nginx
        
        cat > /etc/nginx/sites-available/greenmate << EOF
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `\$host;
        proxy_set_header X-Real-IP `\$remote_addr;
        proxy_set_header X-Forwarded-For `\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `\$scheme;
        proxy_cache_bypass `\$http_upgrade;
    }
}
EOF
        
        ln -sf /etc/nginx/sites-available/greenmate /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        systemctl restart nginx
        systemctl enable nginx
        log_success "Nginx 설정 완료"
    fi
}

# 메인 배포 함수
main() {
    log_info "GreenMate 배포 시작..."
    dnf update -y
    install_nodejs
    install_pm2
    create_backup
    download_source
    build_project
    setup_nginx
    restart_service
    log_success "배포 완료! 서비스가 http://103.244.108.70 에서 실행 중입니다."
    pm2 status
}

main "`$@"
"@

    # 서버에 배포 스크립트 업로드 (Unix 형식으로 저장)
    $serverScript | Out-File -FilePath "server_deploy.sh" -Encoding UTF8 -NoNewline
    $serverScript = $serverScript -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText("server_deploy.sh", $serverScript, [System.Text.Encoding]::UTF8)
    
    Write-Info "서버에 배포 스크립트 업로드 중..."
    Invoke-SCPUpload "server_deploy.sh" "/tmp/server_deploy.sh"
    
    # 서버에서 배포 스크립트 실행
    Write-Info "서버에서 배포 스크립트 실행 중..."
    Invoke-SSHCommand "chmod +x /tmp/server_deploy.sh && /tmp/server_deploy.sh"
    
    # 임시 파일 정리
    Remove-Item "server_deploy.sh" -Force -ErrorAction SilentlyContinue
    
    Write-Success "서버 배포 완료"
}

# 메인 함수
function Main {
    Write-Info "GreenMate Frontend 배포 시작 (SSH 키 인증 사용)..."
    
    # SSH 키 파일 존재 확인
    if (-not (Test-Path $SSH_KEY)) {
        Write-Error "SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
        Write-Error "먼저 SSH 키를 생성하고 서버에 등록하세요."
        exit 1
    }
    
    if (-not $SkipPush) {
        # 1단계: GitHub 푸시
        Push-ToGitHub
    } else {
        Write-Warning "GitHub 푸시를 건너뜁니다."
    }
    
    # 2단계: 서버 배포
    Deploy-OnServer
    
    Write-Success "전체 배포 프로세스 완료!"
    Write-Info "서비스 URL: http://103.244.108.70"
}

# 스크립트 실행
Main
