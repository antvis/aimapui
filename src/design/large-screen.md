# Cartographic Precision System (CPS) - Large Screen Dashboard Specification

This specification extends the CPS visual language for Large Screen Command & Control centers, optimized for high-density data visualization and cinematic geospatial presentation.

---

## 1. Visual Foundation (Dark Mode / High Contrast)

### 1.1 Color Palette
*   **Background (Deep Surface)**: `#0B0E14` (Near-black navy).
*   **Surface (Container)**: `rgba(20, 24, 33, 0.8)` with `backdrop-blur-xl`.
*   **Accent (Primary)**: `#3B82F6` (Electric Blue).
*   **Semantic Colors**:
    *   **Success**: `#10B981` (Emerald).
    *   **Warning**: `#F59E0B` (Amber).
    *   **Danger/Alert**: `#EF4444` (Rose).

### 1.2 Material & Texture
*   **Glassmorphism**: All UI overlays must use `backdrop-blur-md` (12px-20px blur) to separate from the dynamic map background.
*   **Borders**: 1px `border-white/10` with a subtle inner glow.
*   **Glow Effects**: Active elements and high-priority alerts should use `drop-shadow` with the respective semantic color to create a "light-emitting" effect.

---

## 2. Layout & Composition (The "Command" Grid)

### 2.1 Immersive Map Viewport
*   **Role**: The core canvas for all spatial data.
*   **Style**: Dark-themed base map (Slate/Midnight) with reduced label noise to highlight business overlays.

### 2.2 Dashboard Overlays
*   **Lateral Panels**: Fixed width `400px` on both sides. Left for "Operations & Layers", Right for "Real-time Analytics".
*   **Global Header**: Slim `56px` bar. Contains Brand, Global Search, System Status (Online/Offline), and a Precise Digital Clock.
*   **Data Ticker (Footer)**: `32px` bar scrolling through live events, coordinates, and system logs.

---

## 3. Component Specifications

### 3.1 Data Visualization (Charts)
*   **Container**: Translucent cards with `rounded-xl`.
*   **Typography**: Value labels in `font-mono` for technical precision.
*   **Color Mapping**: Categorical data should use a consistent palette of neon-saturated colors.

### 3.2 High-Density Data Tables
*   **Header**: `font-label-caps uppercase tracking-widest text-white/50`.
*   **Rows**: `h-10` with `border-b border-white/5`.
*   **Interaction**: Hover state shifts row background to `bg-white/5` and highlights text.
*   **Status Indicators**: Small glowing dots or mini-sparklines within cells.

### 3.3 Geospatial Controls
*   **Zoom/Tilt Group**: Vertical cluster in a bottom corner. Circular buttons, glassmorphic.
*   **Legend Overlay**: Floating bottom-left. Categorical colors + toggle switches.

---

## 4. Interaction & Motion

### 4.1 Transition States
*   **Panel Sliding**: `duration-500 ease-in-out` for panel toggles.
*   **Data Updates**: Numerical values should use a "Counter" animation (smooth rolling) when updating in real-time.

### 4.2 Visual Cues
*   **Pulse**: High-priority map markers or alerts use a multi-stage radial pulse (`animate-ping` variant).
*   **Scanning**: Subtle horizontal "scanline" overlay on the map to enhance the high-tech aesthetic.

---
*Derived from: {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}} | CPS Large Screen Module v1.0.0*
