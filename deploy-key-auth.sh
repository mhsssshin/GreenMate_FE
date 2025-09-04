#!/bin/bash

# GreenMate Frontend 배포 스크립트 (SSH 키 인증 사용)
# 사용법: ./deploy-key-auth.sh

set -e  # 에러 발생 시 스크립트 중단

# 서버 정보
SERVER_IP="103.244.108.70"
SERVER_USER="root"
SSH_KEY="$HOME/.ssh/greenmate_key"
GITHUB_REPO="https://github.com/mhsssshin/GreenMate_FE.git"
PROJECT_NAME="GreenMate_FE"
DEPLOY_DIR="/var/www/greenmate"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH 명령 실행 함수
run_ssh_command() {
    local command="$1"
    log_info "서버에서 명령 실행: $command"
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$command"
}

# 파일 전송 함수
upload_file() {
    local local_file="$1"
    local remote_path="$2"
    log_info "파일 업로드: $local_file -> $remote_path"
    
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$local_file" "$SERVER_USER@$SERVER_IP:$remote_path"
}

# 1단계: GitHub에 푸시
push_to_github() {
    log_info "1단계: GitHub에 코드 푸시 중..."
    
    # 현재 변경사항이 있는지 확인
    if [ -n "$(git status --porcelain)" ]; then
        log_info "변경사항을 커밋합니다..."
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # GitHub에 푸시
    git push origin master
    
    log_success "GitHub 푸시 완료"
}

# 2단계: 서버에서 배포 스크립트 실행
deploy_on_server() {
    log_info "2단계: 서버에서 배포 시작..."
    
    # 서버에 배포 스크립트 생성
    cat > server_deploy.sh << 'EOF'
#!/bin/bash

# 서버 배포 스크립트
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
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Node.js 설치 확인 및 설치
install_nodejs() {
    if ! command -v node &> /dev/null; then
        log_info "Node.js 설치 중..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        apt-get install -y nodejs
        log_success "Node.js 설치 완료"
    else
        log_info "Node.js가 이미 설치되어 있습니다: $(node --version)"
    fi
}

# PM2 설치 확인 및 설치
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 설치 중..."
        npm install -g pm2
        log_success "PM2 설치 완료"
    else
        log_info "PM2가 이미 설치되어 있습니다: $(pm2 --version)"
    fi
}

# 백업 생성
create_backup() {
    if [ -d "$DEPLOY_DIR" ]; then
        log_info "기존 배포 디렉토리 백업 중..."
        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"
        log_success "백업 완료"
    fi
}

# 소스 다운로드
download_source() {
    log_info "GitHub에서 소스 다운로드 중..."
    
    # 기존 디렉토리 제거
    rm -rf "$DEPLOY_DIR"
    
    # 새로 클론
    git clone "$GITHUB_REPO" "$DEPLOY_DIR"
    
    log_success "소스 다운로드 완료"
}

# 의존성 설치 및 빌드
build_project() {
    log_info "프로젝트 빌드 중..."
    
    cd "$DEPLOY_DIR"
    
    # 의존성 설치
    npm install
    
    # 프로덕션 빌드
    npm run build
    
    log_success "빌드 완료"
}

# 웹서비스 재기동
restart_service() {
    log_info "웹서비스 재기동 중..."
    
    cd "$DEPLOY_DIR"
    
    # PM2로 앱 관리
    pm2 stop greenmate || true
    pm2 delete greenmate || true
    pm2 start npm --name "greenmate" -- start
    pm2 save
    pm2 startup
    
    log_success "웹서비스 재기동 완료"
}

# Nginx 설정 (선택사항)
setup_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_info "Nginx 설치 중..."
        apt-get update
        apt-get install -y nginx
        
        # Nginx 설정 파일 생성
        cat > /etc/nginx/sites-available/greenmate << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # 사이트 활성화
        ln -sf /etc/nginx/sites-available/greenmate /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Nginx 재시작
        systemctl restart nginx
        systemctl enable nginx
        
        log_success "Nginx 설정 완료"
    fi
}

# 메인 배포 함수
main() {
    log_info "GreenMate 배포 시작..."
    
    # 시스템 업데이트
    apt-get update
    
    # Node.js 및 PM2 설치
    install_nodejs
    install_pm2
    
    # 백업 생성
    create_backup
    
    # 소스 다운로드
    download_source
    
    # 빌드
    build_project
    
    # Nginx 설정
    setup_nginx
    
    # 서비스 재기동
    restart_service
    
    log_success "배포 완료! 서비스가 http://103.244.108.70 에서 실행 중입니다."
    
    # 상태 확인
    pm2 status
}

# 스크립트 실행
main "$@"
EOF

    # 서버에 배포 스크립트 업로드
    upload_file "server_deploy.sh" "/tmp/server_deploy.sh"
    
    # 서버에서 배포 스크립트 실행
    run_ssh_command "chmod +x /tmp/server_deploy.sh && /tmp/server_deploy.sh"
    
    # 임시 파일 정리
    rm -f server_deploy.sh
    
    log_success "서버 배포 완료"
}

# 메인 함수
main() {
    log_info "GreenMate Frontend 배포 시작 (SSH 키 인증 사용)..."
    
    # SSH 키 파일 존재 확인
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
        log_error "먼저 SSH 키를 생성하고 서버에 등록하세요."
        exit 1
    fi
    
    # 1단계: GitHub 푸시
    push_to_github
    
    # 2단계: 서버 배포
    deploy_on_server
    
    log_success "전체 배포 프로세스 완료!"
    log_info "서비스 URL: http://103.244.108.70"
}

# 스크립트 실행
main "$@"
