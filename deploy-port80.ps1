# GreenMate Frontend 배포 스크립트 (포트 80 사용)
# 사용법: .\deploy-port80.ps1

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
    
    # 서버에서 직접 배포 스크립트 생성 및 실행
    $deployCommand = @"
# GreenMate 배포 스크립트 (포트 80)
set -e

GITHUB_REPO="$GITHUB_REPO"
DEPLOY_DIR="/var/www/greenmate"
BACKUP_DIR="/var/backups/greenmate"
NODE_VERSION="18"

echo "GreenMate 배포 시작 (포트 80)..."

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "Node.js 설치 중..."
    curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
    dnf install -y nodejs
    echo "Node.js 설치 완료"
else
    echo "Node.js 버전: $(node --version)"
fi

# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "PM2 설치 중..."
    npm install -g pm2
    echo "PM2 설치 완료"
else
    echo "PM2 버전: $(pm2 --version)"
fi

# 백업 생성
if [ -d "$DEPLOY_DIR" ]; then
    echo "기존 배포 디렉토리 백업 중..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    echo "백업 완료"
fi

# 소스 다운로드
echo "GitHub에서 소스 다운로드 중..."
rm -rf "$DEPLOY_DIR"
git clone "$GITHUB_REPO" "$DEPLOY_DIR"
echo "소스 다운로드 완료"

# 빌드
echo "프로젝트 빌드 중..."
cd "$DEPLOY_DIR"
npm install
npm run build
echo "빌드 완료"

# Nginx 설정
if ! command -v nginx &> /dev/null; then
    echo "Nginx 설치 중..."
    dnf install -y nginx
    echo "Nginx 설치 완료"
fi

# Nginx 설정 파일 생성
cat > /etc/nginx/conf.d/greenmate.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    
    # 정적 파일 (index.html) 서빙
    location = / {
        root /var/www/greenmate/public;
        try_files /index.html =404;
    }
    
    # /m/ 경로는 Next.js 앱으로 프록시
    location /m/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Next.js 정적 파일들
    location /_next/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 기타 정적 파일들
    location /index_files/ {
        root /var/www/greenmate/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Nginx 재시작
systemctl restart nginx
systemctl enable nginx
echo "Nginx 설정 완료"

# 서비스 재기동 (포트 3000에서 실행)
echo "웹서비스 재기동 중..."
cd "$DEPLOY_DIR"
pm2 stop greenmate || true
pm2 delete greenmate || true
pm2 start npm --name "greenmate" -- start
pm2 save
pm2 startup
echo "웹서비스 재기동 완료"

echo "배포 완료!"
echo "소개 페이지: http://103.244.108.70/"
echo "앱 내부 웹뷰: http://103.244.108.70/m/sns"
pm2 status
"@

    # 서버에서 배포 스크립트 실행
    Invoke-SSHCommand $deployCommand
    
    Write-Success "서버 배포 완료"
}

# 메인 함수
function Main {
    Write-Info "GreenMate Frontend 배포 시작 (포트 80 사용)..."
    
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
    Write-Info "소개 페이지: http://103.244.108.70/"
    Write-Info "앱 내부 웹뷰: http://103.244.108.70/m/sns"
}

# 스크립트 실행
Main
