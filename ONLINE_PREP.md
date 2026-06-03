# Online Prep

## 목표
현재 로컬 `localStorage` 게임을 온라인 초대형 PVP 게임으로 바꾼다.

## 현재 추가된 서버 초안
- `server.js`: 외부 패키지 없이 돌아가는 Node 서버
- `package.json`: `npm start`로 서버 실행
- `data/db.json`: 실행 중 자동 생성되는 로컬 JSON DB

## 현재 API
- `POST /api/signup`: 계정 생성, 기본 100C와 `thrower` 지급
- `POST /api/login`: 로그인 토큰 발급
- `GET /api/me`: 내 데이터 조회
- `POST /api/rooms`: 방 생성 및 방 코드 발급
- `GET /api/rooms/:code`: 방 참가자 조회
- `POST /api/rooms/:code/join`: 방 코드로 참가
- `POST /api/gacha`: 서버에서 50C 차감 후 캐릭터 뽑기

## 완료된 프론트 전환
- 회원가입/로그인 화면 추가
- 로그인 토큰 저장
- 로비의 플레이어 추가 방식을 방 만들기/방 참가 방식으로 변경
- 방 참가자 목록을 PVP 플레이어 후보로 사용
- 캐릭터 뽑기는 서버 API를 통해 처리

## 추천 구조
- 프론트: 지금의 `index.html`, `style.css`, `game.js`
- 서버: Node.js
- 현재 저장소: JSON 파일
- 다음 저장소: SQLite
- 실시간 통신: Socket.IO

## 다음 구현 순서
1. 방 안에서 PVP 준비 상태 동기화
2. 방 참가자 자동 새로고침 또는 Socket.IO 실시간 반영
3. 전투 결과와 코인 정산은 서버에서만 처리
4. 클라이언트는 서버가 보낸 결과만 화면에 표시
5. JSON DB를 SQLite로 교체

## 중요한 규칙
코인, 뽑기 결과, 승패 정산은 클라이언트가 아니라 서버가 결정해야 한다.
