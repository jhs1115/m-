# Render Online Deploy Guide

이 프로젝트는 `server.js` 하나가 프론트 파일과 API를 같이 서빙합니다.

## 1. GitHub에 올리기

```powershell
git init
git add .
git commit -m "Prepare online deploy"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

이미 GitHub 저장소가 있으면 `remote add`는 건너뛰고 `git push`만 하면 됩니다.

## 2. Render에서 배포

1. Render에 로그인합니다.
2. New + 버튼을 누릅니다.
3. Blueprint를 선택합니다.
4. GitHub 저장소를 연결합니다.
5. `render.yaml`을 감지하면 그대로 배포합니다.

배포가 끝나면 `https://matchzzang-arena.onrender.com` 같은 공개 주소가 생깁니다.

## 3. 왜 디스크가 필요한가

계정, 코인, 방 정보는 현재 JSON 파일에 저장됩니다.
Render 서버는 재배포될 때 일반 파일이 초기화될 수 있으므로 `/var/data/db.json`에 저장하도록 설정했습니다.

`render.yaml`의 `disk` 설정은 이 데이터를 보존하기 위한 설정입니다.
완전한 운영 버전에서는 JSON 파일 대신 SQLite 또는 Postgres로 바꾸는 게 좋습니다.

## 4. 배포 후 접속

친구에게 Render 공개 URL을 보내면 같은 와이파이가 아니어도 접속할 수 있습니다.

코드를 수정한 뒤 GitHub에 다시 push하면 Render가 자동으로 새 버전을 배포합니다.
