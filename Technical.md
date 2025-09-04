# GreenMate Frontend Technical Documentation

## 프로젝트 개요
- **프로젝트명**: GreenMate Frontend
- **기술 스택**: Next.js 14, React, TypeScript, Tailwind CSS
- **배포 환경**: Linux Server (103.244.108.70)
- **웹서버**: Nginx
- **프로세스 관리**: PM2

## 시스템 아키텍처

### 서버 구성
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80)    │────│  Next.js (3000) │────│   PM2 Process   │
│   (Reverse      │    │   (App Server)  │    │   Manager       │
│    Proxy)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
    ┌─────────┐            ┌─────────┐
    │ Static  │            │  /m/*   │
    │ Files   │            │ Routes  │
    │ (index  │            │ (App)   │
    │ .html)  │            │         │
    └─────────┘            └─────────┘
```

### 디렉토리 구조
```
/var/www/greenmate/
├── .next/                 # Next.js 빌드 파일
├── public/                # 정적 파일
│   ├── index.html         # 메인 웹페이지
│   ├── styles.css         # 메인 웹페이지 CSS
│   ├── GreenMate_v1.0.0.apk  # APK 파일
│   ├── manifest.json      # PWA 매니페스트
│   ├── favicon.ico        # 파비콘
│   └── images/            # 이미지 파일들
├── src/                   # 소스 코드
│   ├── app/               # Next.js App Router
│   │   ├── m/             # 모바일 앱 웹뷰
│   │   │   ├── sns/       # SNS 페이지
│   │   │   ├── walk/      # 걷기 페이지
│   │   │   ├── challenge/ # 챌린지 페이지
│   │   │   ├── points/    # 포인트 페이지
│   │   │   └── mypage/    # 마이페이지
│   │   └── layout.tsx     # 루트 레이아웃
│   ├── components/        # React 컴포넌트
│   │   └── Navbar.tsx     # 네비게이션 바
│   ├── lib/               # 유틸리티 함수
│   ├── styles/            # 스타일 파일
│   └── types/             # TypeScript 타입 정의
├── package.json           # 프로젝트 설정
├── next.config.js         # Next.js 설정
├── tailwind.config.js     # Tailwind CSS 설정
└── tsconfig.json          # TypeScript 설정
```

## GitHub 저장소 설정

### 저장소 정보
- **URL**: https://github.com/mhsssshin/GreenMate_FE.git
- **브랜치**: master
- **접근 방식**: HTTPS

### Git 설정 명령어
```bash
# 저장소 클론
git clone https://github.com/mhsssshin/GreenMate_FE.git

# 원격 저장소 추가
git remote add origin https://github.com/mhsssshin/GreenMate_FE.git

# 변경사항 커밋 및 푸시
git add .
git commit -m "커밋 메시지"
git push origin master
```

### 주요 커밋 히스토리
- 초기 프로젝트 설정
- Navbar 및 페이지 구조 생성
- 챌린지 기능 추가
- APK 다운로드 기능 구현
- CSS 스타일링 및 반응형 디자인
- Nginx 설정 및 배포 최적화

## SSH 접속 설정

### 서버 정보
- **IP 주소**: 103.244.108.70
- **사용자**: root
- **포트**: 22 (기본)

### SSH 키 인증 설정
```bash
# SSH 키 생성 (로컬에서)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/greenmate_key

# 공개키를 서버에 복사
ssh-copy-id -i ~/.ssh/greenmate_key.pub root@103.244.108.70

# 또는 수동으로 복사
scp ~/.ssh/greenmate_key.pub root@103.244.108.70:~/.ssh/authorized_keys
```

### SSH 접속 명령어
```bash
# SSH 키를 사용한 접속
ssh -i ~/.ssh/greenmate_key root@103.244.108.70

# Windows PowerShell에서
ssh -i $env:USERPROFILE\.ssh\greenmate_key root@103.244.108.70
```

### 파일 전송 명령어
```bash
# 로컬에서 서버로 파일 전송
scp -i ~/.ssh/greenmate_key local_file root@103.244.108.70:/remote/path

# 서버에서 로컬로 파일 다운로드
scp -i ~/.ssh/greenmate_key root@103.244.108.70:/remote/file local_path
```

## 배포 파이프라인

### 자동 배포 스크립트 (PowerShell)
```powershell
# deploy-port80.ps1
$server = "103.244.108.70"
$keyPath = "$env:USERPROFILE\.ssh\greenmate_key"

# GitHub에 푸시
git add .
git commit -m "배포: $args[0]"
git push origin master

# 서버에서 배포 실행
$deployScript = @"
cd /var/www/greenmate
git pull origin master
npm install
npm run build
pm2 restart greenmate
echo '배포 완료'
"@

ssh -i $keyPath root@$server $deployScript
```

### 수동 배포 명령어
```bash
# 1. GitHub에 푸시
git add .
git commit -m "변경사항 설명"
git push origin master

# 2. 서버에서 배포
ssh -i ~/.ssh/greenmate_key root@103.244.108.70
cd /var/www/greenmate
git pull origin master
npm install
npm run build
pm2 restart greenmate
```

## Nginx 설정

### 설정 파일 위치
- **메인 설정**: `/etc/nginx/nginx.conf`
- **사이트 설정**: `/etc/nginx/conf.d/greenmate.conf`

### 주요 설정 내용
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Next.js 정적 파일들 프록시
    location /_next/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

    # APK 파일 다운로드
    location = /GreenMate_v1.0.0.apk {
        root /var/www/greenmate/public;
        add_header Content-Type "application/octet-stream" always;
        add_header Content-Disposition "attachment; filename=\"GreenMate_v1.0.0.apk\"" always;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    # 정적 파일 (index.html) 서빙
    location = / {
        root /var/www/greenmate/public;
        try_files /index.html =404;
    }

    # CSS 및 JS 파일들
    location ~* \.(css|js)$ {
        root /var/www/greenmate/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 이미지 파일들
    location /images/ {
        root /var/www/greenmate/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # manifest.json
    location = /manifest.json {
        root /var/www/greenmate/public;
        add_header Content-Type application/json;
    }

    # favicon.ico
    location = /favicon.ico {
        root /var/www/greenmate/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # icon 파일들
    location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/greenmate/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Nginx 관리 명령어
```bash
# 설정 테스트
nginx -t

# 설정 리로드
systemctl reload nginx

# Nginx 재시작
systemctl restart nginx

# Nginx 상태 확인
systemctl status nginx
```

## PM2 프로세스 관리

### PM2 설정
```bash
# PM2로 앱 시작
pm2 start npm --name "greenmate" -- start

# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs greenmate

# PM2 재시작
pm2 restart greenmate

# PM2 중지
pm2 stop greenmate

# PM2 삭제
pm2 delete greenmate
```

### PM2 자동 시작 설정
```bash
# PM2 시작 스크립트 생성
pm2 startup

# 현재 프로세스 저장
pm2 save
```

## 보안 설정

### 방화벽 설정
```bash
# 방화벽 시작
systemctl start firewalld
systemctl enable firewalld

# 포트 허용
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh

# 방화벽 리로드
firewall-cmd --reload
```

### SSH 보안 설정
```bash
# SSH 설정 파일 수정
vim /etc/ssh/sshd_config

# 주요 설정
Port 22
PermitRootLogin yes
PasswordAuthentication no
PubkeyAuthentication yes

# SSH 서비스 재시작
systemctl restart sshd
```

## 모니터링 및 로그

### 서버 모니터링 스크립트
```bash
#!/bin/bash
# /root/server-monitor.sh

echo '=== GreenMate Server Status ==='
echo 'Date: ' $(date)
echo ''

echo '=== System Resources ==='
echo 'CPU Usage:'
top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1
echo 'Memory Usage:'
free -h | grep Mem | awk '{print $3"/"$2}'
echo 'Disk Usage:'
df -h / | tail -1 | awk '{print $5}'
echo ''

echo '=== Services Status ==='
echo 'Nginx Status:'
systemctl is-active nginx
echo 'PM2 Status:'
pm2 status | grep greenmate
echo ''

echo '=== Network Connections ==='
netstat -tuln | grep :80
netstat -tuln | grep :3000
echo ''

echo '=== Recent Logs ==='
echo 'Last 5 Nginx Access Logs:'
tail -5 /var/log/nginx/access.log
echo ''
echo 'Last 5 Nginx Error Logs:'
tail -5 /var/log/nginx/error.log
```

### 로그 파일 위치
- **Nginx 액세스 로그**: `/var/log/nginx/access.log`
- **Nginx 에러 로그**: `/var/log/nginx/error.log`
- **PM2 로그**: `~/.pm2/logs/`

## 트러블슈팅

### 일반적인 문제 해결

#### 1. Next.js 정적 파일 404 에러
```bash
# 해결 방법
cd /var/www/greenmate
npm run build
pm2 restart greenmate
systemctl reload nginx
```

#### 2. Nginx 설정 오류
```bash
# 설정 테스트
nginx -t

# 설정 파일 백업
cp /etc/nginx/conf.d/greenmate.conf /etc/nginx/conf.d/greenmate.conf.backup

# 설정 복원
cp /etc/nginx/conf.d/greenmate.conf.backup /etc/nginx/conf.d/greenmate.conf
systemctl reload nginx
```

#### 3. PM2 프로세스 문제
```bash
# PM2 상태 확인
pm2 status

# PM2 재시작
pm2 restart greenmate

# PM2 로그 확인
pm2 logs greenmate --lines 50
```

#### 4. 포트 충돌 문제
```bash
# 포트 사용 확인
netstat -tuln | grep :80
netstat -tuln | grep :3000

# 프로세스 종료
kill -9 $(lsof -t -i:80)
kill -9 $(lsof -t -i:3000)
```

## 개발 환경 설정

### 로컬 개발 환경
```bash
# 프로젝트 클론
git clone https://github.com/mhsssshin/GreenMate_FE.git
cd GreenMate_FE

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

### 환경 변수
```bash
# .env.local (로컬 개발용)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GreenMate

# .env.production (프로덕션용)
NEXT_PUBLIC_API_URL=https://103.244.108.70
NEXT_PUBLIC_APP_NAME=GreenMate
```

## 성능 최적화

### Next.js 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 스플리팅**: 자동 코드 스플리팅 활용
- **정적 생성**: 가능한 페이지는 정적 생성
- **캐싱**: 적절한 캐시 헤더 설정

### Nginx 최적화
- **Gzip 압축**: 텍스트 파일 압축
- **캐시 설정**: 정적 파일 캐싱
- **Keep-Alive**: 연결 재사용
- **Worker 프로세스**: CPU 코어 수에 맞게 설정

## 백업 및 복구

### 백업 스크립트
```bash
#!/bin/bash
# /root/backup.sh

BACKUP_DIR="/backup/greenmate"
DATE=$(date +%Y%m%d_%H%M%S)

# 디렉토리 생성
mkdir -p $BACKUP_DIR

# 소스 코드 백업
tar -czf $BACKUP_DIR/greenmate_source_$DATE.tar.gz /var/www/greenmate

# Nginx 설정 백업
cp /etc/nginx/conf.d/greenmate.conf $BACKUP_DIR/greenmate.conf_$DATE

# PM2 설정 백업
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_dump_$DATE.pm2

echo "백업 완료: $BACKUP_DIR"
```

### 복구 절차
```bash
# 소스 코드 복구
tar -xzf /backup/greenmate/greenmate_source_YYYYMMDD_HHMMSS.tar.gz -C /

# Nginx 설정 복구
cp /backup/greenmate/greenmate.conf_YYYYMMDD_HHMMSS /etc/nginx/conf.d/greenmate.conf
systemctl reload nginx

# PM2 설정 복구
pm2 resurrect /backup/greenmate/pm2_dump_YYYYMMDD_HHMMSS.pm2
```

## 연락처 및 지원

### 개발팀 연락처
- **이메일**: support@lifeplusgreenmate.com
- **전화**: 1588-0000

### 기술 지원
- **GitHub Issues**: https://github.com/mhsssshin/GreenMate_FE/issues
- **문서**: 이 Technical.md 파일 참조

---

**마지막 업데이트**: 2024년 9월 5일
**문서 버전**: 1.0
**작성자**: GreenMate 개발팀
