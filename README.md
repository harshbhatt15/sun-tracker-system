# ☀️ SunTrack Pro — Solar Tracking System

An intelligent **dual-axis solar panel sun tracking and monitoring system** designed to continuously orient a solar panel toward the Sun for improved solar energy capture.

SunTrack Pro combines a **4-LDR sensor array, ESP32-based hardware architecture, dual-axis motor control, solar power monitoring, and a real-time web dashboard**. The current project includes a complete simulation layer that allows the tracking system to be demonstrated without physical hardware.

---

## 📌 Overview

Solar panels produce maximum power when their surface is properly aligned with incoming sunlight. A fixed solar panel cannot continuously maintain the optimum angle throughout the day because the Sun's position changes continuously.

**SunTrack Pro** solves this problem using a dual-axis tracking approach:

* **Azimuth axis** — rotates the panel horizontally.
* **Elevation axis** — moves the panel vertically.
* **4 LDR sensors** — detect the direction of stronger sunlight.
* **ESP32** — intended as the hardware controller.
* **Motors** — adjust the panel orientation.
* **Power sensor** — measures voltage and current.
* **Web dashboard** — displays tracking, sensor, power, and system information.

The project currently runs using a **simulated hardware layer**, making it possible to test and demonstrate the complete tracking logic directly in the browser.

---

## ✨ Features

### ☀️ Dual-Axis Solar Tracking

The system tracks the Sun using two independent axes:

* Azimuth
* Elevation

The tracking algorithm compares opposing LDR sensor values and adjusts the target panel position accordingly.

### 🔆 4-LDR Sensor Array

Four simulated LDR sensors represent:

* Left
* Right
* Top
* Bottom

The controller compares:

```text
Right − Left
Top − Bottom
```

and uses the differences to determine the required panel movement.

### 🎯 Automatic Tracking

In automatic mode, the system continuously:

1. Reads the sensor values.
2. Compares opposing sensors.
3. Calculates the direction of required movement.
4. Updates the target panel angle.
5. Moves the panel smoothly toward the target.
6. Stops when the panel is sufficiently aligned.

A configurable **deadband** prevents unnecessary motor movement caused by small sensor differences.

### 🎮 Manual Control

The dashboard also supports manual panel positioning.

Users can:

* Move the azimuth axis.
* Move the elevation axis.
* Nudge individual axes.
* Stop an axis.
* Center the panel.
* Return the panel to its parking position.

### 🌙 Night Mode

When the simulated Sun goes below the horizon, the system automatically enters night mode.

The panel moves toward its configured parking position:

```text
Azimuth:   180°
Elevation: 10°
```

Tracking automatically resumes after sunrise.

### ⚡ Energy Monitoring

The dashboard displays:

* Voltage
* Current
* Power
* Today's energy
* Total energy
* Solar irradiance
* Tracking efficiency

Power is calculated from:

```text
Power = Voltage × Current
```

### 📊 Tracking Efficiency

The system calculates an alignment-based efficiency value using the angular difference between:

* Sun position
* Panel position

The dashboard displays the efficiency as a percentage.

### 🚨 Alerts & Notifications

The system generates alerts for important events such as:

* Successful Sun alignment
* Sun movement
* Sunrise
* Night mode activation
* Low sunlight
* Sensor failure
* Motor errors
* Panel approaching an axis limit
* Emergency stop

### 🛑 Emergency Stop

An emergency stop feature immediately:

* Stops simulation.
* Stops both motors.
* Prevents further movement.
* Marks the system as being in E-STOP state.

The system can subsequently be resumed.

### 🧪 Fault Simulation

The project includes a sensor fault simulation feature.

A simulated LDR failure can be introduced to demonstrate:

* Sensor errors
* Motor errors
* System alerts
* Health diagnostics

### 🎥 Project Demo Mode

The **Project Demo Mode** automatically runs through a complete simulated day cycle.

The demonstration shows:

```text
Pre-sunrise
     ↓
Sunrise
     ↓
Sun detection
     ↓
Automatic tracking
     ↓
Panel alignment
     ↓
Energy generation
     ↓
Sunset
     ↓
Night mode
     ↓
Parking position
```

Simulation speeds available:

* 1×
* 5×
* 10×
* 50×

---

# 🏗️ System Architecture

```text
                    ☀️ SUN
                      │
                      ▼
              ┌─────────────────┐
              │   4 × LDR Array │
              │                 │
              │ L   R   T   B   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │      ESP32      │
              │  Microcontroller│
              └────────┬────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Tracking Algorithm │
             │                   │
             │ Differential      │
             │ Comparison        │
             │ + Deadband        │
             └─────────┬─────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
       ┌─────────────┐   ┌─────────────┐
       │   Azimuth   │   │  Elevation  │
       │    Motor    │   │    Motor    │
       └──────┬──────┘   └──────┬──────┘
              │                 │
              └────────┬────────┘
                       ▼
                ┌─────────────┐
                │ Solar Panel │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │ Power Sensor│
                │   INA219    │
                └──────┬──────┘
                       │
                       ▼
             ┌────────────────────┐
             │ SunTrack Pro Web UI │
             │                    │
             │ React + TypeScript │
             └────────────────────┘
```

---

# ⚙️ How It Works

## 1. Detect Sunlight

The four LDR sensors measure the intensity of light coming from different directions.

```text
          TOP
           │
           │
     LEFT ─┼─ RIGHT
           │
           │
         BOTTOM
```

---

## 2. Compare Sensor Values

The system calculates the difference between opposing sensors.

### Horizontal Axis

```text
Azimuth Error = Right LDR − Left LDR
```

### Vertical Axis

```text
Elevation Error = Top LDR − Bottom LDR
```

---

## 3. Determine Movement

If the difference is greater than the configured deadband, the tracker moves the corresponding axis.

```text
if |Right − Left| > Deadband
        ↓
   Move Azimuth

if |Top − Bottom| > Deadband
        ↓
  Move Elevation
```

The deadband prevents continuous small motor movements caused by sensor noise.

---

## 4. Move the Panel

The target position is constrained by configured mechanical limits.

Default limits:

```text
Azimuth:
20° → 340°

Elevation:
5° → 90°
```

The simulated motor movement uses smooth movement toward the target position.

---

## 5. Confirm Alignment

The system calculates the angular difference between the Sun and panel.

If the total angular error is sufficiently small:

```text
Angular Error < 3°
```

the panel is considered aligned.

---

## 6. Generate Energy

The simulated power output depends on:

* Solar irradiance
* Panel alignment
* Voltage
* Current

The system calculates:

```text
Power = Voltage × Current
```

and accumulates energy over the simulated day.

---

# 🖥️ Dashboard

The application provides multiple monitoring pages.

### 🏠 Dashboard

The main dashboard displays:

* Tracking efficiency
* Current power
* Sunlight intensity
* Panel angle
* System status
* Panel orientation
* Sun position
* Solar output
* LDR readings
* Recent alerts
* System health

### 🎯 Live Tracking

Provides a visual representation of:

* Sun position
* Panel orientation
* Tracking direction
* Alignment status

### 🎮 Manual Control

Allows direct control of:

* Azimuth
* Elevation
* Motor movement
* Panel positioning

### 🔋 Energy

Displays solar energy and historical simulation data.

Available ranges include:

* 1 day
* 7 days
* 30 days

### 📡 Sensors

Displays the individual LDR sensor readings and sensor status.

### 🚨 Alerts

Provides a complete list of system events and notifications.

### ❤️ System Health

Displays the health of:

* ESP32 connection
* LDR sensors
* Azimuth motor
* Elevation motor
* Solar panel
* Power sensor
* Internet connection

### 🏗️ Hardware Architecture

Provides a visual explanation of how the hardware components interact.

### ⚙️ Settings

Allows configuration of tracking and system parameters.

---

# 🔧 Hardware Architecture

The project is designed around the following hardware configuration:

| Component       | Configuration   |
| --------------- | --------------- |
| Microcontroller | ESP32           |
| Light Sensors   | 4 × LDR         |
| Azimuth Motor   | SG90 Servo      |
| Elevation Motor | SG90 Servo      |
| Power Sensor    | INA219          |
| Solar Panel     | Solar panel     |
| Communication   | Wi-Fi           |
| Dashboard       | Web application |

### ESP32 Configuration

The current configuration defines:

```text
LDR Sensors:
GPIO 32
GPIO 33
GPIO 34
GPIO 35

Motors:
GPIO 18
GPIO 19
```

The web application currently uses simulated hardware, while the architecture is designed so an ESP32 hardware implementation can be connected later using:

* REST
* WebSocket
* MQTT

---

# 💻 Technology Stack

## Frontend

* React 19
* TypeScript
* TanStack Router
* Tailwind CSS
* Vite
* Lucide React
* Recharts

## UI Components

* Radix UI
* Custom reusable dashboard components
* Responsive layouts
* Interactive controls

## Application Architecture

* TypeScript
* Hardware abstraction layer
* Simulation engine
* LocalStorage persistence
* Real-time state updates

---

# 📁 Project Structure

```text
sun-tracker-system/
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   │
│   ├── components/
│   │   ├── solar/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── ClientTime.tsx
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── SolarTrackerVisualization.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── ui-bits.tsx
│   │   │
│   │   └── ui/
│   │       └── Reusable UI components
│   │
│   ├── integrations/
│   │   └── supabase/
│   │
│   ├── lib/
│   │   ├── solar/
│   │   │   ├── engine.ts
│   │   │   ├── hardware.ts
│   │   │   ├── historical.ts
│   │   │   ├── types.ts
│   │   │   └── useSolar.ts
│   │   │
│   │   └── utils.ts
│   │
│   └── routes/
│       ├── index.tsx
│       ├── tracking.tsx
│       ├── control.tsx
│       ├── sensors.tsx
│       ├── energy.tsx
│       ├── alerts.tsx
│       ├── health.tsx
│       ├── architecture.tsx
│       └── settings.tsx
│
├── package.json
├── bun.lock
├── vite.config.ts
└── README.md
```

---

# 🧠 Software Architecture

The project separates the solar tracking logic from the user interface using a hardware abstraction layer.

```text
┌──────────────────────────────┐
│        Web Dashboard         │
│     React + TypeScript       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Solar State Engine     │
│                              │
│ Tracking                     │
│ Alignment                    │
│ Power calculation            │
│ Alerts                       │
│ Simulation                   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Hardware Abstraction     │
├──────────────────────────────┤
│ SimulatedHardware            │
│                              │
│ Future: Esp32Hardware        │
└──────────────────────────────┘
```

This architecture makes it possible to replace the simulation with real ESP32 communication without completely rewriting the dashboard.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm or Bun
* Git

Check your installation:

```bash
node --version
npm --version
```

Or if using Bun:

```bash
bun --version
```

---

## 📥 Clone the Repository

```bash
git clone https://github.com/harshbhatt15/sun-tracker-system.git
```

Move into the project directory:

```bash
cd sun-tracker-system
```

---

# 📦 Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

---

# ▶️ Run the Development Server

Using npm:

```bash
npm run dev
```

Or using Bun:

```bash
bun run dev
```

The development server will provide a local URL that can be opened in your browser.

---

# 🏗️ Build for Production

```bash
npm run build
```

Or:

```bash
bun run build
```

---

# 👀 Preview Production Build

```bash
npm run preview
```

---

# 🧪 Development Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Create production build  |
| `npm run build:dev` | Development-mode build   |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint               |
| `npm run format`    | Format project files     |

---

# 💾 Data Persistence

The application stores important simulation state in the browser's `localStorage`.

Persisted information includes:

* System settings
* Panel position
* Simulation time
* Simulation speed
* Tracking mode
* Alerts
* Energy totals

This allows the dashboard to retain simulation state between page reloads.

---

# 🎛️ Simulation Mode

The application can operate without physical hardware.

The simulated hardware generates realistic-style:

* LDR sensor readings
* Solar irradiance
* Voltage
* Current
* Power
* Sun movement
* Motor movement

This makes the project useful for:

* Demonstrations
* Academic projects
* UI development
* Algorithm testing
* Hardware-independent development

---

# 🔮 Future Improvements

The current project provides a simulation-first architecture. Future versions can connect the dashboard to real hardware.

Potential improvements include:

* [ ] Connect real ESP32 hardware
* [ ] Implement REST API communication
* [ ] Add WebSocket real-time communication
* [ ] Add MQTT support
* [ ] Connect physical LDR sensors
* [ ] Connect real servo/stepper motors
* [ ] Connect INA219 power sensor
* [ ] Store real historical energy data
* [ ] Add cloud monitoring
* [ ] Add mobile-responsive hardware controls
* [ ] Add remote system control
* [ ] Add GPS-based location configuration
* [ ] Add astronomical Sun-position calculations
* [ ] Add weather data integration
* [ ] Add long-term performance analytics
* [ ] Add automatic fault recovery

---

# 📊 Project Workflow

```text
             START
               │
               ▼
       Initialize System
               │
               ▼
       Read Sun Position
               │
               ▼
       Read LDR Sensors
               │
               ▼
     Compare LDR Readings
               │
               ▼
      Calculate Direction
               │
               ▼
       Check Deadband
          │         │
       Outside    Inside
       Deadband   Deadband
          │         │
          ▼         ▼
    Move Motor   Stop Motor
          │         │
          └────┬────┘
               ▼
       Check Alignment
               │
               ▼
       Measure Power
               │
               ▼
       Update Dashboard
               │
               ▼
         Check Alerts
               │
               ▼
            Repeat
```

---

# 🎯 Project Objective

The primary objective of SunTrack Pro is to demonstrate how an automated solar tracking system can continuously adjust a solar panel's orientation according to the Sun's position.

The project combines:

**Solar Energy + Embedded Systems + Sensors + Motor Control + Software + Data Visualization**

to create a complete solar tracking and monitoring platform.

---

# 🌱 Applications

Solar tracking systems can be useful in:

* Residential solar installations
* Solar farms
* Educational projects
* Renewable energy research
* Solar-powered IoT systems
* Experimental photovoltaic systems
* Smart energy systems

---

# 📸 Screenshots

Add screenshots of your dashboard here:

```markdown
![Dashboard](screenshots/dashboard.png)

![Live Tracking](screenshots/tracking.png)

![Manual Control](screenshots/control.png)

![Energy Monitoring](screenshots/energy.png)

![Hardware Architecture](screenshots/architecture.png)
```

Create a `screenshots` folder in the repository and place the corresponding images inside it.

---

# ⚠️ Important Note

The current version uses **simulated hardware data**.

The project architecture is prepared for future integration with a real ESP32 system, but the current web application does not directly control physical motors or sensors.

Therefore, values such as:

* LDR readings
* Voltage
* Current
* Power
* Irradiance
* Motor movement

are generated by the simulation layer.

---

# 👨‍💻 Author

**Harsh Bhatt**

GitHub:
https://github.com/harshbhatt15

Project Repository:
https://github.com/harshbhatt15/sun-tracker-system

---

# 📄 License

This project is intended for educational, research, and demonstration purposes.

You may modify and extend the project for your own learning and development.

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

**Built with ☀️ solar energy, ⚡ technology, and 💻 code.**

