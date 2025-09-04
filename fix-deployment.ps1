# GreenMate 배포 문제 해결 스크립트
$server = "103.244.108.70"
$keyPath = "$env:USERPROFILE\.ssh\greenmate_key"

Write-Host "=== GreenMate 배포 문제 해결 시작 ===" -ForegroundColor Green

# 1. GitHub에 푸시
Write-Host "1. GitHub에 변경사항 푸시..." -ForegroundColor Yellow
git add .
git commit -m "Fix: Next.js 정적 파일 404 에러 해결"
git push origin master

# 2. Nginx 설정 파일 전송
Write-Host "2. Nginx 설정 파일 전송..." -ForegroundColor Yellow
scp -i $keyPath greenmate.conf root@${server}:/etc/nginx/conf.d/greenmate.conf

# 3. 서버에서 배포 및 설정 적용
Write-Host "3. 서버에서 배포 및 설정 적용..." -ForegroundColor Yellow
$deployScript = @"
cd /var/www/greenmate
git pull origin master
npm install
npm run build
pm2 restart greenmate
nginx -t
systemctl reload nginx
echo '배포 및 설정 적용 완료'
"@

ssh -i $keyPath root@${server} $deployScript

Write-Host "=== 배포 완료 ===" -ForegroundColor Green
Write-Host "서버 상태 확인: http://103.244.108.70/m/sns" -ForegroundColor Cyan