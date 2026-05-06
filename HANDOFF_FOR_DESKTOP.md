# 데스크탑 개발환경 인수인계 (Windows)

> 작성일: 2026-05-07  
> 목적: 윈도우 데스크탑에서 Copilot이 현재 프로젝트 상황을 한 번에 파악하고, CI/CD 구축까지 이어서 작업할 수 있도록 정리.

---

## 0. TL;DR (한눈에 보기)

| 항목 | 상태 |
|---|---|
| 백엔드 배포 | ✅ 완료 — `https://api.lookup-app.co.kr/health` 200 OK |
| 프론트엔드 | ⏸️ EAS 환경변수만 갱신하면 production 빌드 가능 |
| HTTPS | ✅ Let's Encrypt (자동 갱신, 만료 2026-08-02) |
| DB | ✅ AWS RDS PostgreSQL 16, SSL 강제, 마이그레이션 자동 실행 |
| Storage | ✅ AWS S3 (`lookup-uploads-prod`) |
| CI/CD | ❌ 미구축 — **이번에 작업할 것** |
| 시크릿 로테이트 | ⚠️ **필수** — 채팅에 평문 노출됨 |

---

## 1. 프로젝트 구성

루트: `recognizer2/`

```
recognize-backend-nestjs/    # NestJS 11 + TypeORM + PostgreSQL
recognize-frontend-reactnative/  # Expo SDK + React Native
docs/                         # 기획/배포 문서
```

GitHub:
- 백엔드: `https://github.com/jaemina-a/recognize-backend-nestjs` (main)
- 프론트엔드: 별도 repo (디렉토리 안에서 `git remote -v` 확인)

---

## 2. 인프라 현황 (AWS, ap-northeast-2)

### 2.1 EC2
- **인스턴스**: t3.small, Ubuntu 24.04
- **퍼블릭 IP**: `13.125.101.69`
- **SSH 키**: `~/.ssh/lookup-key.pem` (Mac 기준 — **윈도우로 옮길 때 반드시 가져갈 것**)
- **SSH 접속**:
  ```bash
  ssh -i <키경로> ubuntu@13.125.101.69
  ```
- **앱 위치**: `/home/ubuntu/lookup-api/` (백엔드 git clone)
- **Docker**: 29.4.2
- **스왑**: 0 (빌드 OOM 우려 — 추가 권장: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab`)

### 2.2 RDS (PostgreSQL 16)
- **엔드포인트**: `lookup-prod-db.c38y28qy0yyu.ap-northeast-2.rds.amazonaws.com:5432`
- **DB명**: `lookup`
- **유저**: `lookup_admin`
- **퍼블릭 액세스**: 비활성화 (외부 직접 접속 불가, EC2 경유 필요)
- **SSL**: 강제 (`DB_SSL=true` 필수)
- **보안 그룹**: `lookup-rds-sg` (sg-0211787fd85977c58)
  - EC2 보안 그룹(`sg-096c087b24dfe1b7d`)에서 5432 인바운드 허용
  - 임시로 본인 IP(`39.122.203.41/32`)도 추가됨 → 작업 끝나면 정리 권장
- **VSCode DB Client에서 보기**: SSH Tunnel 사용
  - SSH Tunnel: Host `13.125.101.69`, User `ubuntu`, Key `lookup-key.pem`
  - Main: Host = RDS 엔드포인트, Port `5432`, User `lookup_admin`, DB `lookup`, **SSL 토글 ON**

### 2.3 S3
- **버킷**: `lookup-uploads-prod` (ap-northeast-2)
- **퍼블릭 URL**: 미설정 (S3 virtual-hosted URL 사용)
- **IAM 액세스 키**: `AKIA6J6VII43HVPOQJXE` ⚠️ (로테이트 필요)

### 2.4 도메인 / DNS / HTTPS
- **도메인**: `lookup-app.co.kr` (가비아 구매)
- **DNS**: AWS Route 53 호스팅 영역
  - A 레코드: `api.lookup-app.co.kr` → `13.125.101.69`
- **HTTPS**: Let's Encrypt (Certbot webroot 방식)
  - 인증서 위치 (컨테이너 볼륨): `lookup-api_certbot_conf:/etc/letsencrypt/live/api.lookup-app.co.kr/`
  - 만료: 2026-08-02
  - 자동 갱신: `certbot` 컨테이너가 12h 주기로 `certbot renew` 실행

---

## 3. 백엔드 배포 구조

### 3.1 docker-compose.prod.yml (EC2 `~/lookup-api/`)
3개 서비스:
- **api**: NestJS 빌드 (Dockerfile 멀티스테이지), expose 3000, healthcheck `/health`
- **nginx**: `nginx:alpine`, ports 80/443, 리버스 프록시 + TLS 종단
- **certbot**: `certbot/certbot`, 자동 갱신 데몬

볼륨:
- `certbot_www` — ACME challenge 경로
- `certbot_conf` — 인증서 + `options-ssl-nginx.conf`

네트워크: `lookup` (bridge)

### 3.2 nginx/conf.d/api.conf
```nginx
server {
    listen 80;
    server_name api.lookup-app.co.kr;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl;
    server_name api.lookup-app.co.kr;
    ssl_certificate     /etc/letsencrypt/live/api.lookup-app.co.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.lookup-app.co.kr/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    location / {
        proxy_pass         http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
```

> 주의: `options-ssl-nginx.conf`는 certbot이 자동 생성하지 않아서 수동으로 작성됨. `ssl_dhparam` 라인은 제거(현대 TLS에서 불필요).

### 3.3 .env.production (EC2 `~/lookup-api/.env.production`, chmod 600)

```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://api.lookup-app.co.kr

DB_HOST=lookup-prod-db.c38y28qy0yyu.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=lookup_admin
DB_PASSWORD=<RDS_PASSWORD>
DB_DATABASE=lookup
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_MIGRATIONS_RUN=true
DB_SSL=true   # ← RDS SSL 강제 대응 (app.module.ts에서 사용)

KAKAO_REST_API_KEY=<KAKAO_REST>
KAKAO_CLIENT_SECRET=<KAKAO_SECRET>

JWT_ACCESS_SECRET=<생성된 64바이트 base64>
JWT_REFRESH_SECRET=<생성된 64바이트 base64>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

STORAGE_DRIVER=s3
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=lookup-uploads-prod
AWS_S3_PUBLIC_URL=
AWS_ACCESS_KEY_ID=<IAM_KEY>
AWS_SECRET_ACCESS_KEY=<IAM_SECRET>
```

> **실제 시크릿 값은 1Password / AWS Secrets Manager / 안전한 노트에 별도 저장**.  
> 채팅에 노출된 값들은 모두 로테이트 필요 (아래 §6 참고).

### 3.4 배포된 NestJS 핵심 변경사항
- `src/app.module.ts`: `DB_SSL=true`이면 `{ ssl: { rejectUnauthorized: false } }` 적용
- 부팅 시 `migrationsRun: true`로 자동 마이그레이션
- `dev` 모듈은 `NODE_ENV !== 'production'` 일 때만 로드

---

## 4. 프론트엔드 (React Native + Expo) 현황

### 4.1 환경변수 흐름
- `app.config.ts`에서 `extra.apiUrl = process.env.EXPO_PUBLIC_API_URL`
- 빌드 시점에 EAS profile env가 주입됨

### 4.2 eas.json (수정 필요)
현재 production profile의 `EXPO_PUBLIC_API_URL`이 **`https://api.lookup.app`** (구 도메인)으로 되어 있음 →  
**`https://api.lookup-app.co.kr`** 로 교체 필요.

```json
"production": {
  "env": {
    "APP_VARIANT": "production",
    "EXPO_PUBLIC_API_URL": "https://api.lookup-app.co.kr"  // ← 이렇게
  }
}
```

`preview` profile의 `api-staging.lookup.app`도 staging 환경 만들 때 같이 정리.

### 4.3 로컬 개발
- iOS 시뮬레이터: `npx expo run:ios`
- 실기기 (LAN): Metro 켜고 같은 Wi-Fi에서 QR 스캔
- ngrok 사용 시: `ngrok http 3000` 후 `EXPO_PUBLIC_API_URL`을 ngrok URL로

---

## 5. 윈도우 데스크탑 셋업 절차

### 5.1 사전 설치
| 도구 | 비고 |
|---|---|
| Git for Windows | https://git-scm.com/ |
| Node.js LTS 20 | nvm-windows 권장 |
| pnpm/npm | npm 동봉 |
| Docker Desktop (선택) | 로컬에서 prod 이미지 테스트 시 |
| VSCode + Copilot | 본 문서 같이 열기 |
| AWS CLI v2 | `aws configure`로 동일 IAM 키 등록 |
| OpenSSH (기본 포함) | EC2 SSH용 |
| EAS CLI | `npm i -g eas-cli` (프론트 빌드용) |

### 5.2 Repo 클론
```powershell
mkdir D:\projects ; cd D:\projects
git clone https://github.com/jaemina-a/recognize-backend-nestjs
git clone <프론트엔드 repo URL>
```

> 본 핸드오프 문서(`docs/HANDOFF_FOR_DESKTOP.md`)는 백엔드 repo 또는 별도 monorepo doc에 포함시켜 함께 push.

### 5.3 SSH 키 옮기기
1. Mac에서 `~/.ssh/lookup-key.pem` 을 USB/암호화된 채널로 데스크탑으로 이동
2. 윈도우 위치: `C:\Users\<사용자>\.ssh\lookup-key.pem`
3. 권한 설정 (PowerShell):
   ```powershell
   icacls "$env:USERPROFILE\.ssh\lookup-key.pem" /inheritance:r
   icacls "$env:USERPROFILE\.ssh\lookup-key.pem" /grant:r "$($env:USERNAME):R"
   ```
4. 접속 테스트:
   ```powershell
   ssh -i $env:USERPROFILE\.ssh\lookup-key.pem ubuntu@13.125.101.69
   ```

### 5.4 백엔드 로컬 실행
```powershell
cd recognize-backend-nestjs
copy .env.example .env
# .env를 로컬 PostgreSQL 정보로 채움
npm ci
npm run start:dev
```

### 5.5 프론트엔드 로컬 실행
```powershell
cd recognize-frontend-reactnative
npm ci
npx expo start
```

---

## 6. ⚠️ 시크릿 로테이트 (CI/CD 작업 전에 반드시 처리)

채팅 히스토리에 평문 노출된 값들. 데스크탑 작업 시작 시 가장 먼저:

1. **RDS 비밀번호 변경**  
   AWS RDS Console → DB 선택 → Modify → Master password → Apply immediately  
   → EC2 `.env.production` 갱신 → `docker compose restart api`

2. **IAM 액세스 키 재발급** (`AKIA6J6VII43HVPOQJXE`)  
   IAM → Users → 해당 유저 → Security credentials → Create access key (신규 생성 후 구 키 비활성화 → 며칠 모니터링 후 삭제)

3. **Kakao REST/Client Secret 재발급**  
   Kakao Developers → 운영 앱 → 일반 → 키 재발급

4. **JWT secrets 재생성**  
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
   ```
   → 교체 시 모든 기존 토큰 무효화 = 사용자 재로그인 필요. 운영 시작 전에 처리.

---

## 7. CI/CD 계획 (이번 데스크탑에서 구축)

### 7.1 목표
- **백엔드**: `main` push → GitHub Actions가 EC2에 SSH로 접속해서 `git pull && docker compose up -d --build` 자동 실행
- **프론트엔드**: `main` push → EAS Build (production) 자동 트리거 (선택)

### 7.2 백엔드 CI/CD — GitHub Actions

#### 워크플로 파일: `.github/workflows/deploy.yml`

```yaml
name: Deploy Backend to EC2

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-prod
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      # - run: npm test   # 테스트 정비 후 활성화

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd ~/lookup-api
            git fetch --all
            git reset --hard origin/main
            docker compose -f docker-compose.prod.yml up -d --build
            docker image prune -f

      - name: Health check
        run: |
          sleep 20
          curl -fsS https://api.lookup-app.co.kr/health || exit 1
```

#### GitHub Secrets 등록 (Repo → Settings → Secrets and variables → Actions)
| Secret 이름 | 값 |
|---|---|
| `EC2_HOST` | `13.125.101.69` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | `lookup-key.pem` 전체 내용 (`-----BEGIN ... END-----` 포함) |

> **주의**: `.env.production`은 EC2 서버에만 두고, **GitHub에 커밋하지 않음**. 변경이 필요하면 SSH로 직접 수정 후 `docker compose up -d` 재실행.

#### (선택) EC2에서 GitHub Container Registry 사용으로 빌드 분리
현재 EC2에서 직접 빌드 → 메모리 부담. 개선안:
1. GitHub Actions에서 Docker 이미지 빌드 → GHCR push
2. EC2에서는 `docker compose pull && up -d`만 실행 (빌드 안 함)

이 방식은 t3.small의 메모리 부담을 줄이고 배포 속도도 빨라집니다. CI/CD 1차 구축 후 개선 단계로 진행 권장.

### 7.3 프론트엔드 CI/CD (선택)

#### 워크플로: `.github/workflows/eas-build.yml`
```yaml
name: EAS Production Build
on:
  push:
    branches: [main]
    paths:
      - 'app/**'
      - 'src/**'
      - 'app.config.ts'
      - 'package.json'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile production --non-interactive
```

GitHub Secret 추가:
- `EXPO_TOKEN`: https://expo.dev/accounts/[user]/settings/access-tokens 에서 생성

> Submit (스토어 업로드)은 처음엔 수동 권장. 익숙해지면 `eas submit` job 추가.

### 7.4 CI/CD 구축 순서 (데스크탑에서 할 일)

1. ⚠️ §6 시크릿 로테이트 먼저
2. EC2 스왑 추가 (빌드 안정성)
3. `.github/workflows/deploy.yml` 작성 → push
4. GitHub Secrets 3개 등록
5. 더미 커밋(README 수정 등)으로 워크플로 동작 확인
6. health check 통과하면 완료
7. (개선) GHCR 이미지 빌드 분리
8. (선택) 프론트엔드 EAS workflow

---

## 8. 자주 쓰는 운영 명령어 (cheat sheet)

```bash
# EC2 접속
ssh -i ~/.ssh/lookup-key.pem ubuntu@13.125.101.69

# 컨테이너 상태
cd ~/lookup-api && docker compose -f docker-compose.prod.yml ps

# API 로그 (최근 100줄)
docker logs lookup-api --tail=100 -f

# Nginx reload (설정 변경 후)
docker exec lookup-nginx nginx -s reload

# 인증서 수동 갱신 테스트
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot renew --dry-run

# DB 마이그레이션 수동 실행 (보통 부팅 시 자동)
docker exec lookup-api node dist/typeorm migration:run -d dist/data-source.js

# 외부 헬스체크
curl https://api.lookup-app.co.kr/health
```

---

## 9. 알려진 이슈 / 주의사항

- `t3.small` + 스왑 0 → docker build 중 OOM 발생 가능 (해결: 스왑 2GB 추가 또는 GHCR 분리)
- RDS 퍼블릭 액세스 OFF → 로컬에서 직접 접속 불가, SSH 터널 필수
- `options-ssl-nginx.conf`는 certbot이 자동 생성하지 않음. EC2 볼륨에 수동 작성됨 (재구축 시 §3.2 참고)
- `docker-compose.prod.yml`의 certbot 서비스 entrypoint가 renew loop라서, 인증서 발급 명령 시 `--entrypoint certbot` override 필요
- 프론트엔드 `eas.json`의 `EXPO_PUBLIC_API_URL`이 옛 도메인(`api.lookup.app`)으로 남아있음 → 갱신 필수

---

## 10. 진행 우선순위 제안

1. 🔴 시크릿 로테이트 (RDS / IAM / Kakao / JWT)
2. 🟠 EC2 스왑 추가
3. 🟠 GitHub Actions 백엔드 배포 워크플로 구축 + 검증
4. 🟡 프론트엔드 `eas.json` API URL 수정 + production 빌드
5. 🟢 (개선) GHCR 이미지 빌드 분리
6. 🟢 (선택) 프론트엔드 EAS CI 자동화
