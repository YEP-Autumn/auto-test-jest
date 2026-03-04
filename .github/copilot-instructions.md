# Copilot Instructions: auto-test-jest

## Project Overview

This is a **Jest-based automated testing framework** for network device testing. It provides infrastructure to orchestrate tests across multiple DUTs (Devices Under Test) running network protocols (BGP, EVPN, VXLAN, MPLS, VRANs, etc.) and validate packet stream behavior.

## Architecture

### Core Components

**TestHelper** (`utils/TestHelper.ts`) - Main orchestrator

- Manages multiple DUT connections via `Dut` instances (currently supports A, B, C, D)
- Queues actions (ExecConfig, CleanConfig, ExecRetMatch, Sleep) through an Actuator pattern
- Executes all queued actions sequentially via `startTest()`
- Returns boolean test result

**DUT** (`utils/comm/Dut.ts`) - Device Under Test interface

- Telnet connection wrapper to network switches
- `exec()` throws on CLI errors (detects "% " error patterns)
- `safeExec()` never throws, just logs
- Requires static IP config in `utils/comm/Config.ts`

**Packet Generation** (`utils/stream/`)

- `PacketBuilder` / `Parser` - Layer 2-3 packet construction/validation
- `PacketListBuilder` / `Parser` - Serialize multiple packets to binary buffer
- `StreamBackendApi` - HTTP multipart endpoint to `http://127.0.0.1:8000/stream_backend` for packet injection

**Topology API** (`utils/controller/`)

- `ControllerApi` - HTTP endpoints to `http://127.0.0.1:8000/topology` for adding/removing topology links

## Critical Patterns

### Test Structure

1. Test files match pattern `test/**/*.test.ts`
2. Use `beforeAll()` to initialize TestHelper + DUT connections
3. Chain config changes fluently: `testHelper.ExecConfigDutA([...]).ExecConfigDutB([...]).startTest()`
4. Interface names are replaced at runtime via `replaceIntfA/B/C/D()` helper functions

### Config Execution Flow

```typescript
testHelper
  .ExecConfigDutA(["configure terminal", "...commands"])
  .CleanConfigDutA(["no ...commands"]) // Safe cleanup after test
  .startTest() // Executes all queued actions sequentially
  .result(); // Returns boolean success
```

### DUT Expectations

- Connected via Telnet on ports 23
- Host IPs configured in `Config` class (e.g., 172.16.9.106)
- Shell prompt matches regex: `Switch.*#`
- Commands execute with 30s timeout, session timeout 5 minutes

## Build & Test

- **Build**: TypeScript compilation via Jest/babel
- **Test**: `npm test` runs all `test/**/*.test.ts` files serially (`-i` flag)
- **Config**: `jest.config.ts` specifies test regex; custom config in `config/jest.config.ts`

## External Dependencies

- **telnet-client**: TCP telnet connections
- **axios**: HTTP requests to stream backend & controller APIs
- **thrift**: Packet serialization (see `utils/rpc/thrift/packet.thrift`)

## Protocol Test Organization

Tests are grouped by protocol in `/test/`:

- `10-BGP_EVPN_VXLAN/` - BGP, EVPN, VXLAN
- `30-MPLS/` - MPLS configurations (with sub-folders for load-balance, VLAN mapping)
- `40-VLAN-MAPPING/`, `41-VLAN-DOT1Q-TUNNEL/`, `999-VRF/` - Other protocols

## Key File References

- `utils/TestHelper.ts` - Orchestration & fluent API
- `utils/comm/Dut.ts` - DUT CLI execution
- `utils/comm/Components.ts` - Actuator implementations
- `utils/comm/Config.ts` - DUT connection parameters
- `utils/stream/StreamBackendApi.ts` - Packet injection
- `test/10-BGP_EVPN_VXLAN/0010-BGP_EVPN_VXLAN.test.ts` - Example test structure
