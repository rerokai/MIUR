<div align="center">

```
               ███╗   ███╗ ██╗ ██╗   ██╗ ██████╗
                ████╗ ████║ ██║ ██║   ██║ ██╔══██╗
                ██╔████╔██║ ██║ ██║   ██║ ██████╔╝
                ██║╚██╔╝██║ ██║ ██║   ██║ ██╔══██╗
                ██║ ╚═╝ ██║ ██║ ╚██████╔╝ ██║  ██║
                ╚═╝     ╚═╝ ╚═╝  ╚═════╝  ╚═╝  ╚═╝
```

**Monitoring Infrastructure, Unified & Reactive**

*Real-time server monitoring for your pocket*

</div>

---

## Overview

MIUR connects directly to your Prometheus instances and turns raw metrics into actionable insights — health scores, anomaly alerts, trend predictions — all in a clean mobile interface. No backend. No middleman. Just your servers and your phone.

---

## Features

### Core monitoring
- **Real-time metrics** — CPU, RAM, Disk, Load avg, Uptime, TCP connections, Running processes
- **Multi-server support** — monitor any number of Prometheus endpoints simultaneously
- **Time ranges** — 15 min / 1h / 6h / 24h with auto-scaling charts

### Intelligence
- **Health score** — aggregated 0–100 score per server weighted across CPU / RAM / Disk
- **Anomaly detection** — spike detection via 2σ threshold + silent degradation tracking
- **Baseline** — rolling average window to compare current vs normal behavior
- **Scenario modelling** — linear extrapolation predicting when metrics hit critical thresholds

### Organisation
- **Server groups** — custom groups (PROD / DEV / STAGING) with per-group analytics
- **Event history** — full anomaly timeline sortable by date, server, or severity
- **Digest** — auto-generated human-readable system status summary

### UX
- **Dark / Light theme** — system-aware with manual override
- **Onboarding** — role-based setup (SRE / Developer / Manager) on first launch
- **Offline-tolerant** — gracefully handles unreachable servers without crashing

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo | Cross-platform, fast iteration |
| Navigation | React Navigation | Stack + Bottom Tabs |
| Charts | react-native-gifted-charts | Line charts with area fill |
| SVG charts | react-native-svg | Multi-server overlay charts |
| Storage | AsyncStorage | Persistent server/group config |
| Data source | Prometheus HTTP API | Direct query, no backend needed |
| Language | TypeScript | Type safety across hooks + services |

---

## Getting started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Prometheus + node_exporter on your target servers
- Expo Go app (iOS) or Android device for testing

### Install

```bash
git clone https://github.com/yourname/MIUR.git
cd MIUR
npm install
```

### Configure

Edit `src/constants/config.ts`:

```typescript
export const config = {
  prometheusUrl: 'http://YOUR_SERVER_IP:9090',  // default server
  defaultInterval: 15,                           // polling interval, seconds
  anomalyThreshold: 2,                           // σ threshold for anomaly detection
  baselineWindow: 30,                            // rolling average window size
}
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go on iPhone, or press `a` for Android emulator.

---

## Server setup

Install Prometheus and node_exporter on any Ubuntu/Debian server:

```bash
sudo apt install prometheus prometheus-node-exporter -y
sudo systemctl enable --now prometheus
sudo systemctl enable --now prometheus-node-exporter

# Verify
curl http://localhost:9090/api/v1/query?query=up
```

Then open the app → Settings → Add Server → enter `http://YOUR_IP:9090`.

---

## Project structure

```
MIUR/
├── src/
│   ├── screens/
│   │   ├── MainScreen.tsx          # Overview — multi-server chart, worst group
│   │   ├── MapScreen.tsx           # All servers grouped with mini charts
│   │   ├── ServiceScreen.tsx       # Single server deep dive
│   │   ├── AnalyticsScreen.tsx     # Digest, degradation, modelling
│   │   ├── HistoryScreen.tsx       # Anomaly event timeline
│   │   ├── SettingsScreen.tsx      # Servers, groups, role, theme
│   │   ├── OnboardingWelcomeScreen.tsx
│   │   ├── OnboardingRoleScreen.tsx
│   │   └── OnboardingServerScreen.tsx
│   │
│   ├── components/
│   │   ├── MetricChart.tsx         # Single-metric line chart
│   │   ├── MultiServerChart.tsx    # SVG overlay chart for all servers
│   │   ├── ServerMiniChart.tsx     # Compact server card with sparkline
│   │   ├── MapServerCard.tsx       # Map screen server card
│   │   ├── MapGroupBlock.tsx       # Collapsible group block
│   │   ├── StabilityHeader.tsx     # Global health score header
│   │   ├── InsightCard.tsx         # Anomaly insight callout
│   │   └── CountersBlock.tsx       # Stable/Unstable counters
│   │
│   ├── hooks/
│   │   ├── usePrometheus.ts        # Single-server metric polling
│   │   ├── useAllServersHealth.ts  # Parallel health fetch for all servers
│   │   ├── useServers.ts           # Server list with AsyncStorage persistence
│   │   ├── useGroups.ts            # Group management
│   │   └── useAnomalyHistory.ts    # Anomaly detection + history storage
│   │
│   ├── services/
│   │   └── prometheus.ts           # queryRange, checkConnection, PromQL queries
│   │
│   ├── utils/
│   │   └── analytics.ts            # Baseline, anomaly detection, health score, digest
│   │
│   ├── constants/
│   │   ├── colours.ts              # Global colors object
│   │   ├── themes.ts               # Dark + Light theme definitions
│   │   ├── ThemeContext.tsx        # Theme provider + useTheme hook
│   │   ├── types.ts                # Shared TypeScript interfaces
│   │   └── config.ts               # App configuration
│   │
│   └── navigation/
│       └── index.tsx               # Stack + Tab navigator
│
├── app.json
├── App.tsx
└── package.json
```

---

## Analytics internals

### Health score formula

```
score = (100 − cpu) × 0.4
      + (100 − ram) × 0.3
      + (100 − disk) × 0.2
      − anomaly_penalty(10)
```

| Score | Status |
|---|---|
| ≥ 75 | 🟢 Stable |
| 50 – 74 | 🟡 Degrading |
| < 50 | 🔴 Critical |

### Anomaly detection

```
spike         →  current > baseline + 2σ
degradation   →  last 5 consecutive points above baseline
```

### Trend prediction

Linear regression over the last 5 data points extrapolated to a 90% threshold. Displayed as `~N min` on the Analytics screen.

---

## Prometheus queries

| Metric | PromQL |
|---|---|
| CPU usage | `100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100` |
| RAM usage | `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100` |
| Disk usage | `100 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes * 100)` |
| Load avg 1m | `node_load1` |
| Uptime | `node_time_seconds - node_boot_time_seconds` |
| TCP connections | `node_sockstat_TCP_inuse` |
| Running processes | `node_procs_running` |

---

## Build for production

### Android APK (EAS Build — recommended)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Download link appears in terminal and on [expo.dev](https://expo.dev) after ~15 minutes. Install directly on any Android device.

### iOS (requires Apple Developer account — $99/yr)

```bash
eas build -p ios --profile preview
```

Distribute via TestFlight or sideload via Xcode.

---

## Contributing

Pull requests welcome. For major changes please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT — do whatever you want with it.

---

<div align="center">
<sub>Built with caffeine and suffering · 2026</sub>
</div>
