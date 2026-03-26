# Multi-Robot A* Engine

설계서 기준으로 `Node.js + TypeScript + Redis Adapter + Weighted A* + Reservation Table`를 라이브러리형 엔진 골격으로 정리한 프로젝트입니다.

## 포함 내용

- `src/engine/*`: 라이브러리형 엔진 진입점과 시간 계산 모델
- `src/config/map.json`: 공장형 레이아웃 초안 맵
- `src/planner/*`: 가중치 맵 구성과 Weighted A* 플래너
- `src/reservation/*`: 시간 슬롯 예약 테이블
- `src/scheduler/*`: 4대 로봇 작업 배정 골격
- `src/simulation/*`: 샘플 시나리오와 CLI 실행기
- `src/api/*`: 간단한 HTTP API 서버
- `src/infra/redis/*`: Redis 연결 골격

## 엔진 사용 방향

핵심 구조는 아래 흐름입니다.

- `EngineScenario`: 맵, 로봇, 작업, 설비, 시간 모델 입력
- `PlannerEngine`: 시나리오를 받아 배정, 경로, 시간 요약 계산
- `EnginePlanResult`: 경로, 로봇별 실행 요약, KPI 반환

향후에는 이 엔진을 npm 라이브러리처럼 감싸서 다른 서버나 시뮬레이터에서 재사용할 수 있습니다.

## 실행

```bash
npm.cmd install
npm.cmd run simulate
npm.cmd run start
```

## 예시 코드

```ts
import { createPlannerEngine } from "./src/engine";
import { createSeedScenario } from "./src/simulation/seed-scenario";

const engine = createPlannerEngine();
const scenario = createSeedScenario();
const result = engine.runScenario(scenario);
```

## 다음 권장 작업

1. `src/engine` 아래에 objective 함수별 최적화 전략 분리
2. 실제 도면 기준으로 시나리오 JSON 로더 추가
3. 설비 가동시간, 작업시간, 배치시간을 더 정교하게 모델링
4. 병목 구간 exclusive window와 deadlock 해소 정책 추가
