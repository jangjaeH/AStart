# Multi-Robot A* PoC

설계서 기준으로 `Node.js + TypeScript + Redis Adapter + Weighted A* + Reservation Table` 기본 골격을 만든 프로젝트입니다.

## 포함 내용

- `src/config/map.json`: 공장형 레이아웃 초안 맵
- `src/planner/*`: 가중치 맵 구성과 Weighted A* 플래너
- `src/reservation/*`: 시간 슬롯 예약 테이블
- `src/scheduler/*`: 4대 로봇 작업 배정 골격
- `src/simulation/*`: 샘플 시나리오와 CLI 실행기
- `src/api/*`: 간단한 HTTP API 서버
- `src/infra/redis/*`: Redis 연결 골격

## 맵 초안 설명

현재 초안은 아래 구성을 기준으로 잡았습니다.

- 상단 라인: LINE-A 설비 접근 동선
- 중단 라인: 중앙 병목과 동서 관통 메인 라인
- 하단 라인: LINE-B 설비 접근 동선
- 우측 라인: LINE-C 설비 및 스테이징 구역
- 병목 구간: `N5`, `N8`, `N11`
- 충전 구간: `CHG-W`, `CHG-E`
- 버퍼 구간: 서측 `BUF-W1`, `BUF-W2`, 동측 `E-TOP`, `E-MID`, `E-BOT`

## 실행

```bash
npm.cmd install
npm.cmd run simulate
npm.cmd run start
```

## 다음 권장 작업

1. 실제 도면 기준으로 노드 좌표와 zone 이름을 교체
2. 설비별 `EQ-xxx-ACCESS` 노드에 실제 작업 타입 속성 추가
3. 병목 구간에 exclusive window 규칙 추가
4. Redis Streams 기반 상태 수집기와 route version 관리 연결
