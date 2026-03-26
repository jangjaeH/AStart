# Multi-Robot A* Engine Development Plan

Project: Node.js-based multi-robot path and task optimization engine  
Date: 2026-03-26

## 1. Purpose

This document defines a practical development roadmap for evolving the current library-style engine skeleton into a reusable multi-robot planning engine that can support map changes, equipment processing time, robot travel time, task service time, bottleneck handling, and dynamic replanning.

The goal is not only to find shortest paths, but to produce execution plans that are useful in realistic factory-style scenarios.

## 2. Current Status

The project already includes the following foundations:

- Weighted A* path planning
- Reservation table based conflict avoidance
- Library entry flow: EngineScenario -> PlannerEngine -> EnginePlanResult
- Sample factory-style map.json
- Sample scenario and CLI runner
- Lightweight HTTP API wrapper
- Basic KPI calculation for travel time, wait time, and service time

This means the engine skeleton exists, but the project still needs schema stabilization, better timing models, stronger assignment logic, bottleneck policies, and live integration.

## 3. Target Architecture

The recommended architecture has five layers.

### 3.1 Core Engine

Responsibilities:

- Task assignment
- Weighted A* planning
- Reservation-based conflict resolution
- Timing computation
- KPI aggregation

Key rule:

- No direct Redis, HTTP, or dashboard logic inside the core engine

### 3.2 Scenario Layer

Responsibilities:

- Load maps
- Load robots
- Load equipment definitions
- Load tasks
- Load timing models
- Validate scenario input

Recommended output:

- EngineScenario

### 3.3 Optimization Layer

Responsibilities:

- Objective-specific scoring
- Heuristic assignment
- Aging rules
- Replan strategies

Initial supported objectives:

- minimize_makespan
- minimize_total_cost
- balanced

### 3.4 Adapter Layer

Responsibilities:

- Redis integration
- HTTP API
- CLI entry points
- Dashboard/WebSocket integration

### 3.5 Observability Layer

Responsibilities:

- Logging
- KPI collection
- Bottleneck utilization tracking
- Replan counts
- Failure diagnostics

## 4. Core Development Principles

### 4.1 Freeze the input format first

Before expanding algorithms, stabilize EngineScenario and its structure for maps, robots, equipment, tasks, and timing.

### 4.2 Keep the engine pure

The engine should receive input objects and return output objects. External I/O belongs in adapters.

### 4.3 Define optimization objectives explicitly

The shortest path is not always the best operating plan. Each planning run should be understood in terms of what it optimizes.

### 4.4 Build around scenarios and KPIs

Quality should be measured with repeatable scenarios and objective metrics, not only by code size or subjective behavior.

## 5. Phase Roadmap

## Phase 1. Stabilize Scenario Format

Main work:

- Define EngineScenario schema
- Add zod validator or JSON Schema
- Split sample scenarios into files
- Add scenario loader utilities

Completion criteria:

- A new scenario can be executed without code changes
- Missing required fields fail with clear validation errors

Suggested outputs:

- docs/scenario-format.md
- src/scenario/validator.ts
- examples/*.scenario.json

## Phase 2. Improve Map Model

Main work:

- Define map conventions for node types
- Define tags for zone, bottleneck, buffer, charge, and service access
- Add map validator
- Add a simple map visualization helper

Completion criteria:

- Broken edges, missing nodes, or invalid zones are detected early

Suggested outputs:

- docs/map-convention.md
- src/map/validator.ts
- src/map/visualize.ts

## Phase 3. Expand Timing Model

Main work:

- Robot-specific movement time
- Wait-time modeling
- Equipment setup time
- Equipment processing time
- Task service time
- Robot speed variation

Completion criteria:

- Completion time reflects more than route length alone

Suggested outputs:

- extended src/engine/time-model.ts
- docs/timing-model.md

## Phase 4. Improve Assignment Logic

Main work:

- Replace simple greedy assignment with heuristics
- Score tasks using priority, aging, travel distance, and bottleneck load
- Separate objective-specific scoring functions

Completion criteria:

- Better makespan or total cost than the simple baseline

Suggested outputs:

- src/engine/objectives/*
- src/scheduler/assignment-strategy.ts

## Phase 5. Strengthen Bottleneck and Deadlock Handling

Main work:

- Exclusive bottleneck windows
- Better edge-swap protection
- Starvation detection
- Deadlock detection and global replanning

Completion criteria:

- Stable planning with 4 or more robots through narrow intersections

Suggested outputs:

- src/reservation/bottleneck-policy.ts
- src/reservation/deadlock-detector.ts

## Phase 6. Add Redis and Live Replanning

Main work:

- Snapshot versioning
- Event format for equipment, robot, task, and planner events
- Redis Streams integration
- Replan trigger handling

Completion criteria:

- The engine replans when delayed telemetry or equipment faults arrive

Suggested outputs:

- src/infra/redis/stream-consumer.ts
- docs/redis-key-schema.md

## Phase 7. KPI Automation and Benchmarks

Main work:

- Build benchmark scenario sets
- Automate KPI reports
- Add regression performance checks

Completion criteria:

- Algorithm changes can be compared quantitatively

Suggested outputs:

- benchmarks/*.json
- reports/*.md

## 6. Module-Level Work

### src/engine

- Public API cleanup
- Objective selection interface
- KPI aggregation model
- Stable result format

### src/planner

- Extend Weighted A* cost model
- Improve heuristic behavior
- Revisit turn, wait, and congestion penalties

### src/reservation

- Node reservations
- Edge reservations
- Bottleneck exclusivity
- Deadlock detection

### src/scheduler

- Task-to-robot assignment heuristics
- Priority aging
- Reassignment logic
- High-priority task insertion handling

### src/simulation

- Benchmark scenarios
- Fault injection
- Delay injection
- Repeated KPI comparison runs

### src/api and src/infra/redis

- Thin integration layer only
- Snapshot and event translation
- Route distribution structure

## 7. Optimization Objectives

Initial support should focus on three objectives.

### minimize_makespan

- Minimize the time when the last task completes
- Good for overall throughput

### minimize_total_cost

- Minimize total movement, wait, and service cost
- Good for average efficiency

### balanced

- Avoid sacrificing one robot repeatedly
- Good for starvation prevention

## 8. Test Strategy

Required automated scenarios:

- Normal operation
- Bottleneck competition
- Equipment ALARM
- Equipment DOWN
- Delayed robot
- Urgent task insertion
- Deadlock candidate

Validation points:

- collision count = 0
- makespan trend
- total wait time trend
- replan success rate
- bottleneck fairness

## 9. KPI Suggestions

Track at least the following:

- Makespan
- Total Travel Time
- Total Wait Time
- Replan Count
- Collision Count
- Deadlock Count
- Bottleneck Utilization
- Task Completion Time

## 10. Risks and Responses

### Risk 1. Inaccurate map abstraction

Impact:

- Planned behavior differs from the physical process

Response:

- Add map visualization
- Add manual review workflow

### Risk 2. Too much replanning

Impact:

- Higher CPU usage
- Route instability

Response:

- Use horizon planning
- Use zone-based partial updates

### Risk 3. Robot starvation

Impact:

- Some robots wait too often

Response:

- Add priority aging
- Add balanced objective

### Risk 4. Engine polluted by adapters

Impact:

- Harder testing
- Harder maintenance

Response:

- Keep the core engine pure
- Keep all I/O inside adapters only

## 11. Suggested Weekly Sequence

### Week 1

- Scenario schema
- Validator
- Scenario loader

### Week 2

- Map conventions
- Map validator
- Initial map visualization

### Week 3

- Timing model expansion
- Equipment, task, and robot timing parameters

### Week 4

- Assignment heuristic
- Objective scoring

### Week 5

- Bottleneck exclusivity
- Deadlock detection

### Week 6

- Redis snapshot and event integration
- Replan trigger wiring

### Week 7+

- Benchmarks
- KPI reports
- Performance tuning

## 12. Immediate Next Actions

Recommended immediate actions:

1. Add scenario schema or zod validator
2. Write map editing conventions
3. Add objective scoring skeleton
4. Create three benchmark scenarios
5. Then add Redis integration and replanning triggers

## Conclusion

The safest sequence is:

1. Freeze input format
2. Expand timing model
3. Improve scheduling logic
4. Stabilize bottleneck handling
5. Add live integration

Following this order keeps the engine reusable, testable, and easier to adapt to real process constraints later.
