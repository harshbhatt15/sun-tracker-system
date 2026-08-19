# Sun Tracker System

Build a Complete Solar Tracking System Web Application

Project Name

SunTrack Pro — Intelligent Solar Panel Sun Tracking & Monitoring System

Build a complete, professional, responsive web application for an engineering project called SunTrack Pro.

The system represents a dual-axis solar panel tracking system that automatically follows the Sun throughout the day. The physical solar panel will use light sensors and motors to change its orientation so that the panel faces the direction of strongest sunlight.

The website is the central monitoring and control interface for the complete system.

This is NOT just a static dashboard or UI mockup. Build a functional web application with realistic simulated hardware data, working controls, animations, charts, system states, and a clean architecture that can later be connected to an ESP32/Arduino.

1. MAIN OBJECTIVE

Create a web application that allows a user to:

See the current position of the Sun.

See the current orientation of the solar panel.

Visually see the panel rotating toward the Sun.

Monitor sunlight intensity from multiple sensors.

Monitor panel angle.

Monitor voltage, current, power, and energy generation.

Switch between Automatic Tracking and Manual Control.

Manually rotate the solar panel.

See whether the panel is correctly aligned with the Sun.

Monitor motor status.

Monitor sensor status.

View historical energy and tracking data.

Receive system warnings and alerts.

Configure system settings.

The entire experience should feel like a real solar tracking control system, not a generic admin dashboard.

2. IMPORTANT — FULL SYSTEM VISUALIZATION

The most important feature is a large interactive visual representation of the complete solar tracking system.

Create a dedicated Live Tracking visualization.

The visualization should contain:

Sun

Show a realistic stylized Sun moving across a sky area.

Display:

Sun position

Sun direction

Approximate solar elevation

Approximate solar azimuth

Sunrise

Sunset

Current simulated time

The Sun should move gradually during the simulation.

Solar Panel

Show a 3D-style/isometric solar panel mounted on a mechanical tracking structure.

The panel should visibly rotate according to:

Horizontal rotation / azimuth

Vertical rotation / elevation

Display the current angles:

Azimuth: 0°–360°

Elevation: 0°–90°

The panel should visually rotate when the values change.

The visualization should make it immediately obvious whether the panel is facing the Sun.

Mounting Structure

Visually represent:

Solar panel

Support frame

Vertical rotating axis

Horizontal rotating axis

Motor/servo components

Sensor module

Base structure

Use subtle animations to make the system look like real hardware.

3. TRACKING LOGIC

Implement a realistic simulation of a dual-axis solar tracker.

The system should simulate four light sensors:

LDR Left

LDR Right

LDR Top

LDR Bottom

The system compares sensor readings.

For example:

If:

Left LDR > Right LDR

the tracker should rotate toward the left.

If:

Right LDR > Left LDR

the tracker should rotate toward the right.

If:

Top LDR > Bottom LDR

the tracker should increase elevation.

If:

Bottom LDR > Top LDR

the tracker should decrease elevation.

When the light difference becomes small, display:

"SUN ALIGNED"

and stop the simulated motors.

Include a configurable tolerance/deadband so the motors do not constantly move because of tiny sensor differences.

4. AUTOMATIC TRACKING MODE

Create a prominent mode selector:

AUTO TRACKING

MANUAL CONTROL

When AUTO TRACKING is active:

Simulated sensors continuously update.

Sun position changes gradually.

Panel orientation automatically follows the Sun.

Motor status changes when the panel moves.

Panel angle changes smoothly.

Tracking efficiency updates.

Alignment status updates.

Show statuses such as:

🟢 Sun Aligned

🟡 Adjusting Position

🔵 Tracking Sun

🔴 Tracking Error

The automatic simulation should be believable.

Do NOT make the panel instantly jump to the target angle.

Use smooth movement.

5. MANUAL CONTROL

Create a complete manual control panel.

Controls:

Horizontal Axis

Rotate Left

Stop

Rotate Right

Vertical Axis

Move Up

Stop

Move Down

Also provide:

Azimuth Slider

0° → 360°

Elevation Slider

0° → 90°

Add:

CENTER PANEL

button.

Add:

RESET POSITION

button.

Show the current angle while controlling the panel.

Prevent the panel from exceeding its physical limits.

6. EMERGENCY STOP

Create a highly visible:

EMERGENCY STOP

button.

When pressed:

Stop all simulated motors.

Stop automatic tracking.

Set motor state to STOPPED.

Display a warning.

Prevent movement until the user resumes the system.

Add:

RESUME SYSTEM

button.

This should behave like a real control system.

7. MAIN DASHBOARD

Create a professional dashboard containing:

System Status Card

Show:

System Online

Tracking Mode

Motor Status

Sensor Status

Last Update

Panel Orientation Card

Show:

Azimuth

Elevation

Target Azimuth

Target Elevation

Sun Position Card

Show:

Sun Azimuth

Sun Elevation

Sunrise

Sunset

Current simulated time

Solar Output Card

Show:

Voltage

Current

Current Power

Today's Energy

Total Energy

Tracking Efficiency

Show a large percentage:

94.8%

with a circular progress indicator.

Alignment Status

Example:

SUN ALIGNED

and show the angular difference between the Sun and panel.

8. REAL-TIME SENSOR DASHBOARD

Create a dedicated Sensor Data page.

Show four sensor cards:

LDR LEFT

Example:
720

LDR RIGHT

Example:
680

LDR TOP

Example:
810

LDR BOTTOM

Example:
540

Use animated gauges/progress bars.

Also display:

Average sunlight intensity

Maximum sensor value

Minimum sensor value

Sensor difference

Sensor health

Use realistic changing simulated values.

Add a real-time line chart showing sensor readings.

9. ENERGY MONITORING

Create a dedicated Energy Monitoring page.

Display:

Electrical Measurements

Voltage: 18.6 V

Current: 2.45 A

Power: 45.57 W

Energy Today: 0.82 kWh

Total Energy: 128.4 kWh

These are simulated values initially.

Automatically calculate:

Power = Voltage × Current

Show a chart for:

Power vs Time

Energy Generated vs Time

Sunlight vs Time

Provide time filters:

Today

7 Days

30 Days

Make the charts interactive.

10. LIVE TRACKING PAGE

Create the most visually impressive page of the application.

Layout:

LEFT SIDE:
Large animated solar tracking visualization.

RIGHT SIDE:
Live information panel.

Show:

SUN

Azimuth: 142°

Elevation: 48°

PANEL

Azimuth: 140°

Elevation: 46°

ERROR

Azimuth Error: 2°

Elevation Error: 2°

STATUS

SUN ALIGNED

MOTORS

Azimuth Motor: IDLE

Elevation Motor: ADJUSTING

TRACKING EFFICIENCY

96.2%

The visualization must update whenever these values change.

11. SOLAR TRACKING ANIMATION

Create a day simulation.

Provide a control:

SIMULATE SUN

When enabled, simulate the Sun moving from sunrise to sunset.

The Sun should move gradually.

The solar panel should follow it.

Include:

Simulation Speed

1×

5×

10×

50×

Include:

PAUSE SIMULATION

and

RESET DAY

buttons.

This should allow the user to demonstrate the complete tracking system during a project presentation.

12. DAY/NIGHT LOGIC

Implement realistic day/night behavior.

During daylight:

Tracking is enabled.

Sun position changes.

Sensors receive light.

Panel follows the Sun.

Power generation increases/decreases depending on alignment.

During nighttime:

Sensors show very low light.

Power generation becomes approximately zero.

Tracking stops.

Panel enters a configurable night position.

Display:

NIGHT MODE

At sunrise, automatically resume tracking.

13. NIGHT PARKING POSITION

Create a setting called:

Night Parking Position

Default:

Azimuth: 180°

Elevation: 10°

When night mode begins, the simulated tracker moves to this position.

Allow the user to change the parking position in Settings.

14. TRACKING EFFICIENCY

Calculate tracking efficiency based on the angular difference between the Sun and panel.

Example:

If the panel is almost perfectly aligned:

98–100%

If moderately misaligned:

70–90%

If badly misaligned:

below 70%

Use the simulated alignment values to calculate this dynamically.

Do not hard-code a constant percentage.

15. MOTOR SIMULATION

Create two simulated motors:

AZIMUTH MOTOR

States:

IDLE

ROTATING LEFT

ROTATING RIGHT

STOPPED

ERROR

ELEVATION MOTOR

States:

IDLE

MOVING UP

MOVING DOWN

STOPPED

ERROR

Display motor activity visually.

When the panel moves, show an animated motor indicator.

16. SYSTEM ALERTS

Create an Alerts/Notifications area.

Possible alerts:

Information

"Solar tracking started."

Success

"Solar panel successfully aligned with the Sun."

Warning

"Low sunlight detected."

Warning

"Panel approaching azimuth limit."

Error

"Left LDR sensor is not responding."

Error

"Motor movement timeout."

Alerts should have timestamps.

Allow users to dismiss alerts.

17. SYSTEM HEALTH

Create a system health section.

Show:

ESP32 Connection

LDR Sensors

Azimuth Motor

Elevation Motor

Solar Panel

Power Sensor

Internet Connection

Use:

🟢 Operational

🟡 Warning

🔴 Error

The simulation should occasionally be able to demonstrate warning states.

18. SETTINGS PAGE

Create a complete Settings page.

Sections:

Tracking Settings

Automatic Tracking ON/OFF

Sensor Deadband

Tracking Interval

Maximum Azimuth

Minimum Azimuth

Maximum Elevation

Minimum Elevation

Night Settings

Night Mode ON/OFF

Night Parking Azimuth

Night Parking Elevation

System Settings

System Name

Location

Measurement Units

Simulation Mode

Hardware Settings

ESP32 IP Address

Sensor Configuration

Motor Configuration

For now, hardware connection fields can be stored locally and simulated.

19. HARDWARE CONNECTION ARCHITECTURE

Design the application so that the simulated hardware layer can later be replaced by real hardware.

Use a clean abstraction such as:

Hardware Data Layer

↓

Tracking Logic

↓

Application State

↓

Dashboard/UI

Initially:

Simulated Hardware → Tracking Logic → UI

Later:

ESP32 → API/WebSocket/MQTT → Tracking Logic → UI

Do not make the frontend code dependent on hard-coded fake values everywhere.

Keep simulated hardware data in a separate service/module.

20. SIMULATION ENGINE

Create a realistic simulation engine.

It should maintain:

Sun position

Panel position

Sensor values

Motor states

Voltage

Current

Power

Energy

System status

Update values at regular intervals.

The simulation should be deterministic enough for a presentation but still feel live.

21. RESPONSIVE DESIGN

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

Desktop should use a professional sidebar navigation.

Mobile should use a collapsible navigation menu.

Do not allow charts or the solar visualization to overflow the screen.

22. VISUAL DESIGN

Use a premium engineering/clean-energy aesthetic.

Suggested design language:

Dark navy background for the main application

White/light cards

Solar yellow/orange accents

Green for successful tracking

Blue for information

Red for errors

Subtle gradients

Soft shadows

Rounded corners

Professional typography

Smooth transitions

Avoid making it look like a generic admin template.

It should visually communicate:

Solar Energy + Engineering + IoT + Automation

23. SIDEBAR NAVIGATION

Create:

☀️ SunTrack Pro

Navigation:

Dashboard

Live Tracking

Sensors

Energy

Manual Control

Alerts

System Health

Settings

At the bottom:

System Online

with a green status indicator.

24. TOP BAR

Show:

System name

Current simulated time

Connection status

Tracking mode

Notification icon

User/profile icon

Add a quick control for:

AUTO / MANUAL

25. LANDING / OVERVIEW SECTION

The dashboard should begin with a strong project overview.

Title:

SunTrack Pro

Subtitle:

Intelligent Solar Panel Sun Tracking & Monitoring System

Short description:

"An automated dual-axis solar tracking system designed to continuously orient a solar panel toward the Sun for improved solar energy capture."

Show quick statistics:

Tracking Efficiency

Current Power

Sunlight Intensity

Panel Angle

26. DATA PERSISTENCE

Use local storage or an appropriate lightweight client-side persistence mechanism for:

Settings

Panel position

Simulation state

User preferences

Recent alerts

The application should continue working after refreshing the page.

If a backend/database is needed for the architecture, use a sensible Lovable-supported solution, but do NOT add unnecessary complexity that prevents the core application from working.

27. IMPORTANT FUNCTIONAL REQUIREMENTS

Everything visible in the interface should work.

Do NOT create buttons that do nothing.

For example:

Auto Tracking must actually change the panel position.

Manual controls must actually rotate the panel visualization.

Sliders must change the panel angle.

Emergency Stop must stop movement.

Resume must allow movement again.

Simulation speed must affect the simulation.

Reset must reset the system.

Charts must update.

Sensor values must change.

Energy values must respond to sunlight and alignment.

Alerts must reflect system conditions.

Settings must affect the simulation.

28. DEMONSTRATION MODE

Create a special Project Demo Mode for presentations.

When activated, provide a guided simulation:

Sunrise

Sun begins moving

Sensors detect sunlight

Tracker starts

Panel rotates

Panel aligns with Sun

Power generation increases

Sun moves

Panel follows Sun

Sunset

Night mode activates

Panel moves to parking position

Show a progress timeline so the user can understand what is happening.

This mode should make the project impressive during a school/college presentation.

29. EDUCATIONAL INFORMATION

Include a small "How It Works" section explaining:

1. Detect Sunlight

LDR sensors measure light intensity.

2. Compare Sensors

The controller compares readings from different directions.

3. Calculate Direction

The system determines where the strongest sunlight is coming from.

4. Move Panel

Motors rotate the panel toward the Sun.

5. Confirm Alignment

When the sensor difference is within the tolerance range, the motors stop.

6. Generate Energy

The aligned panel receives stronger sunlight and generates electrical energy.

30. TECHNICAL DETAILS PAGE

Add a page/section showing the project's hardware architecture.

Display a visual block diagram:

SUN

↓

LDR SENSOR ARRAY

↓

ESP32 / MICROCONTROLLER

↓

TRACKING ALGORITHM

↓

AZIMUTH MOTOR + ELEVATION MOTOR

↓

SOLAR PANEL

↓

POWER SENSOR

↓

SUNTRACK PRO WEB DASHBOARD

Make this diagram visually attractive and animated.

31. TECHNOLOGY STACK

Use a modern Lovable-compatible stack.

Preferred:

React

TypeScript

Tailwind CSS

Modern component library

Recharts or another reliable charting library

Lucide icons

Keep the code clean and component-based.

Avoid unnecessary dependencies.

32. CODE QUALITY

Use reusable components.

Suggested components:

Dashboard

SolarTrackerVisualization

SunPosition

PanelOrientation

SensorCard

SensorChart

EnergyChart

MotorStatus

TrackingControls

ManualControls

AlertPanel

SystemHealth

Settings

SimulationControls

Keep simulation logic separate from presentation components.

Use clear TypeScript types/interfaces.

Avoid duplicated code.

33. FINAL QUALITY REQUIREMENT

The final result should look and behave like a real IoT solar tracking control system.

It should be:

Fully interactive

Visually impressive

Responsive

Easy to demonstrate

Easy to understand

Ready for simulated operation

Architected for future ESP32 integration

Do NOT create a simple static website.

Do NOT use placeholder buttons.

Do NOT leave major features unfinished.

Prioritize a complete working core system over unnecessary decorative features.

Before finishing, test every major interaction and make sure there are no broken buttons, console errors, layout overflows, or non-functional controls.

The application should open directly to the working SunTrack Pro Dashboard and the user should immediately be able to see the simulated Sun, solar panel, tracking status, sensor values, and energy generation.

FIRST PRIORITY

If there is any conflict between adding more features and making the core system reliable, prioritize these features in this order:

Working solar panel visualization

Working Sun simulation

Automatic dual-axis tracking

Manual panel control

Sensor simulation

Energy simulation

Dashboard

Alerts

System health

Settings

Demo mode

Hardware integration architecture

Build the complete application in one coherent implementation rather than creating separate disconnected mockups.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/98424420-1855-47e3-b859-14c2851a576c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
