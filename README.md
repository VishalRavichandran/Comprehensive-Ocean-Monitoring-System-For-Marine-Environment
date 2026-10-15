# Comprehensive-Ocean-Monitoring-System-For-Marine-Environment
# 📱 AQUA NEXUS — Water Boat Website

> **Hello!** 
> Every file is explained: **what it is**, **why it is there** and **how to use it**.

This website is the **remote control and TV screen** for the Water Boat.
Open it on your phone or laptop and you can:

- 👀 **See** all the boat's sensor readings, live
- 🎮 **Drive** the boat forward, back, left and right
- 🚨 **Get warnings** if the boat is sinking, it is raining, or the water is bad

The code inside the boat (ESP32 + Arduino Nano) has its **own guide**:
👉 [../README.md](../README.md)

---

## 📖 Table of contents

1. [How the website and the boat talk](#1-how-the-website-and-the-boat-talk)
2. [The 3 files: a house example](#2-the-3-files-a-house-example)
3. [`index.html`: the skeleton](#3-indexhtml--the-skeleton-)
4. [`style.css`: the paint and clothes](#4-stylecss--the-paint-and-clothes-)
5. [`script.js`: the brain and electricity](#5-scriptjs--the-brain-and-electricity-)
6. [How to open and use the website (step by step)](#6-how-to-open-and-use-the-website-step-by-step)
7. [Tour of the screen](#7-tour-of-the-screen)
8. [Driving the boat](#8-driving-the-boat)
9. [What the colours mean](#9-what-the-colours-mean)
10. [Settings you can change](#10-settings-you-can-change)
11. [Something is not working? (Troubleshooting)](#11-something-is-not-working-troubleshooting)
12. [Small dictionary of big words](#12-small-dictionary-of-big-words)

---

## 1. How the website and the boat talk

```
   📱 Phone / 💻 Laptop                          🚤 Boat (ESP32)
  ┌──────────────────────┐    WiFi "WaterBoat"   ┌──────────────────┐
  │  AQUA NEXUS website   │ ◄──── sensor data ─── │  192.168.4.1      │
  │  index.html           │                       │                   │
  │  style.css            │ ──── "F180" ────────► │  → Nano → motors  │
  │  script.js            │      (drive!)         │                   │
  └──────────────────────┘                       └──────────────────┘
```

- The **website files live on your phone or laptop**, not inside the boat.
- The **boat only sends numbers** (sensor data). The website turns those numbers into nice pictures.
- They talk over **WiFi**. By default the boat makes its own WiFi:
  - WiFi name: **`WaterBoat`**
  - Password: **`12345678`**
  - Boat address: **`192.168.4.1`**

There are **two ways** they talk. The website tries the first one and uses the second if the first fails:

| Way             | Like…                                 | Speed                     |
|-----------------|---------------------------------------|---------------------------|
| **WebSocket** ⚡ | A **phone call** that stays open       | New data every 0.5 second |
| **HTTP** 📮      | Sending a **letter** and waiting for a reply | Asks every 1 second  |

---

## 2. The 3 files: a house example

Every website is like a **house**. 🏠

| File          | In a house it is…           | What it does on the website                       |
|---------------|-----------------------------|---------------------------------------------------|
| `index.html`  | 🧱 **Walls and rooms** (skeleton) | Decides **what** is on the page: titles, boxes, buttons, the boat picture |
| `style.css`   | 🎨 **Paint, curtains, lights**    | Decides **how it looks**: colours, sizes, shapes, animations |
| `script.js`   | ⚡ **Electricity and switches**   | Makes it **work**: talks to the boat, updates numbers, moves the boat picture, drives the motors |

All three must stay **in the same folder**. `index.html` calls the other two:
```html
<link rel="stylesheet" href="style.css">   <!-- "Please bring the paint" -->
<script src="script.js"></script>          <!-- "Please switch on the electricity" -->
```

This website needs **no internet** and **no extra downloads**. Everything is inside these 3 files.
(Only the "Open in Maps" button needs internet, because it opens Google Maps.)

---

## 3. `index.html` — the skeleton 🧱

- **What is it?** The main page. HTML is a language that uses **tags** like `<button>` and `<section>` to build a page, like LEGO blocks.
- **Why is it here?** Without it, there is no page. It is the **file you open** in the browser.
- **How to use it?** Double-click it (after connecting to the boat's WiFi). You don't need to edit it.

### What's inside, from top to bottom

| Part of the file | What it builds on the screen |
|------------------|------------------------------|
| `<head>`         | The page title **AQUA NEXUS**, phone-friendly size, and a link to `style.css` |
| **Effect layers** (`rainCv`, `storm`, `bolt`, `flood`, `vig`) | Invisible layers covering the whole page. They show **rain falling**, **lightning**, and **water rising** when there is danger. They don't block your taps. |
| **Header** (`<header class="top">`) | The **logo** (a water drop), the name **AQUA NEXUS**, the **connection pill** (Connecting… / Live / Offline) and the **⚙️ gear button** |
| **Settings sheet** (`id="sheet"`) | Opens when you tap ⚙️. Has a box for the **boat address**, a **Connect** button and a **Clear trends** button |
| **Tabs** (`class="tabs"`) | Two buttons: **Monitor** and **Control** |
| **Hazard + alert area** (`hazards`, `alerts`) | Big red/orange banners like **BOAT SINKING** and a list of alerts |
| **Monitor tab** (`pane-mon`) | Everything you **see** (details below) |
| **Control tab** (`pane-ctl`) | Everything you **drive** with (details below) |
| **Footer** | Name + how long the boat has been switched on (uptime) |
| **Toast** (`id="toast"`) | A small pop-up message at the bottom, like "Copied!" |
| `<script src="script.js">` | Switches on the brain |

### Inside the **Monitor** tab

| Card (box)                  | What it shows |
|-----------------------------|---------------|
| **Water Quality** (big circle) | Score 0–100, rating (EXCELLENT / GOOD / …), and 4 small bars for pH, Turbidity, Temperature, Ammonia |
| **Live Digital Twin**       | A **drawing of the boat** that moves like the real boat: front view (roll), top view with compass (heading), side view (pitch). It has **11 numbered dots** for each sensor |
| **Underwater** zone         | Cards **1 pH**, **2 Water Temperature**, **3 Turbidity**, each with a small trend graph |
| **Top Deck** zone           | Cards **4 Air / Gas**, **5 Rain**, **6-8 Controller & Display** (ESP32, Nano, LCD, speed of connection, uptime, packets) |
| **Side** zone               | Card **9 Water Level** (a little tank that fills up) |
| **Navigation** zone         | **GPS** card (latitude, longitude, speed, satellites, "Open in Maps") and **Boat Motion** card (roll, pitch, heading, direction, drive) |

### Inside the **Control** tab

| Card                 | What it has |
|----------------------|-------------|
| **Drive**            | Shows Command / Left % / Right %, the **arrow pad** (▲ ◀ ■ ▶ ▼), and the **Hold to move / Tap to move** switch |
| **Speed**            | A slider from **60 to 255** |
| **Water Quality** (mini) | A small score circle, so you can watch the water while driving |
| **Boat**             | Heading, roll/pitch, GPS speed, Nano link status |

> 💡 The boat drawing is made with **SVG** — pictures drawn with code (circles, rectangles, lines).
> That's why it can move smoothly and stay sharp at any size.

---

## 4. `style.css` — the paint and clothes 🎨

- **What is it?** CSS is the language that says **how things look**: colour, size, space, animation.
- **Why is it here?** Without it, the page would be plain black text on white, with no layout.
- **How to use it?** You don't need to change it. But if you want **different colours**, this is the file.

### What's inside, section by section

| Section in the file             | What it styles |
|---------------------------------|----------------|
| **`:root` (top of the file)**   | The **colour box** 🖍️. All colours are saved here with names, like `--accent` (blue), `--ok` (green), `--warn` (orange), `--bad` (red). Change a colour here → it changes everywhere! |
| `body` and `body::before`       | Dark blue ocean background with slow-moving soft lights |
| **Header**                      | Top bar, logo, connection pill (the dot blinks), gear button, settings sheet, buttons, text boxes |
| **Layout**                      | How cards sit side by side on a laptop, and stack on a phone. Cards gently rise in when the page opens. Page looks faded when the boat is offline |
| **Digital twin**                | Size and layout of the boat drawings (front / top / side views) |
| **SVG twin parts**              | The numbered dots, their colours, the "ping" ripple animation, bubbles, waves, gas puffs, raindrops |
| **Sections & cards**            | The boxes, big numbers, chips (small coloured labels), scale bars, trend graphs, water tank, GPS bars |
| **Tabs**                        | The Monitor / Control buttons |
| **Water quality**               | The big circle gauge. **The whole page tint changes with the rating** (greenish when EXCELLENT, reddish when VERY BAD) |
| **Control**                     | The arrow pad, speed slider, Hold/Tap switch |
| **Hazard effects**              | Rain on the screen, lightning flash, **water rising from the bottom** of the page when the boat is sinking, red glow around the edges |
| **Alert themes**                | Colours of the warning banners (red for sinking, orange for rising, blue for rain) |
| `@media (max-width: …)`         | Special rules for **small screens** (phones) so everything fits |

> 💡 **Try it!** Open `style.css`, find `--accent:#2ec5e6` at the top and change it to `--accent:#ff66cc`.
> Save and refresh the page. Many blue things become pink! 🎀

---

## 5. `script.js` — the brain and electricity ⚡

- **What is it?** JavaScript code. It makes the page **alive**.
- **Why is it here?** HTML and CSS can't talk to the boat or change numbers by themselves. This file does all the work.
- **How to use it?** Nothing to do — it starts automatically. There is **one setting** you may need to change (`IMU_MAP`, see [Settings](#10-settings-you-can-change)).

### What's inside, part by part (in the same order as the file)

#### 🏷️ Colour words (`TONE`)
A list that says which status word gets which colour:
- green (`ok`): GOOD, NORMAL, CLEAR, NO RAIN, SAFE
- orange (`warn`): SLIGHTLY ACIDIC, MODERATE, MUDDY, LIGHT RAIN, COLD, WATER RISING…
- red (`bad`): ACIDIC, ALKALINE, POOR, VERY MUDDY, HEAVY RAIN, HOT, SINKING

#### 🧰 Small helpers
Tiny tools used everywhere: `$` finds a thing on the page, `fx` rounds numbers (and shows `--` if there is no number), `clamp` keeps a number inside limits, `esc` makes text safe to show.

#### 🔄 IMU mounting (`IMU_MAP`)
The gyro sensor may be fixed **turned or upside down** on the boat. This setting fixes the directions so the drawing tilts the **same way** as the real boat. (See [Settings](#10-settings-you-can-change).)

#### 📍 Sensor map (`SPOTS`) and building the twin (`buildTwin`)
- `SPOTS` is a list of the **11 sensor dots** on the boat drawing: where they are and which card they belong to.
- `buildTwin` **draws** things with code when the page opens: the numbered dots, the legend buttons, the waves, raindrops, paddle-wheel blades, compass ticks and water-tank lines.
- **Tap a dot** → the page scrolls to that sensor's card and makes it flash. (Motors / Motor driver dots → jump to the Control tab.)

#### 🎞️ The animation loop (`frame`)
Runs about **60 times per second**. It:
- smoothly **tilts** the boat drawing (roll and pitch),
- **turns** the top view like a compass (yaw),
- **spins** the paddle wheels based on real motor speeds,
- makes the boat **bob** gently on the waves,
- shows an **arrow** for which way the boat is moving.

(If your device is set to "reduce motion", the bobbing is switched off.)

#### 🧪 Water quality (`renderWQ`)
- Fills the big circle and the 4 bars.
- Changes the **page tint** to match the rating.
- If the water is POOR or VERY BAD → shows a pop-up and **vibrates** the phone 📳.
- Copies the **same text as the real LCD** onto the LCD in the drawing.
- Makes the water in the drawing turn **brown when turbidity is high**.

#### 🆘 Hazards (`renderHazards`, rain effects)
- **Water rising** (≥ 40% on the hull sensor) → orange banner **"BOAT GOING INTO THE WATER"** + water starts filling the bottom of the screen.
- **Sinking** (≥ 70%) → red banner **"BOAT SINKING — bring the boat back now"** + strong vibration.
- **Raining** → blue banner + **raindrops fall across the whole screen**. More rain = more drops.
  **Heavy rain** = lightning flashes too! ⚡

#### 🖼️ Showing all the data (`render`)
Every time new data arrives, this updates every card: pH, temperature, turbidity, gas, rain, water level, motors, GPS, gyro, uptime. It also:
- saves the **recent readings** for the small trend graphs (last 120 readings),
- shows **OFF** on a card if that sensor is switched off in the boat's `config.h`,
- counts problems and shows them in the **alerts box** (red ones first). If there are none: **✓ All systems normal**.

#### ⚙️ Settings (boat address, trends, copy)
- The boat address is **remembered** in the browser, so you only type it once.
- **Clear trends** empties the small graphs.
- **Copy coords** copies the GPS position.

#### 📡 Connection (`openWs`, `poll`, `restart`)
1. First tries the **WebSocket** (live phone call) at `ws://<boat>:81/`.
2. If that fails, uses **HTTP** — asks `http://<boat>/api/data` every second.
3. Keeps trying WebSocket again every 5 seconds.
4. If **nothing arrives for 3 seconds** → pill turns red: **Offline**, and the page fades.
5. The small line under the title says things like `192.168.4.1 · updated just now · WebSocket live`.

#### 🎮 Control (`go`, `sendCtl`, arrow pad, keyboard)
- Sends `F`, `B`, `L`, `R` + speed (for example `F180`), or `S` to stop.
- While moving, it **repeats the command every 0.4 seconds** so the boat knows you're still there.
- Speed slider value is **remembered**.

#### 🛡️ Safety stops in the website
The boat **stops** if you:
- switch to the **Monitor** tab,
- **lock** your phone or switch to another app/tab,
- click outside the browser window,
- **let go** of the button (in Hold mode).

#### 🗂️ Tabs
Switches between Monitor and Control, and scrolls to the top.

---

## 6. How to open and use the website (step by step)

### Step 1 — Switch on the boat 🔋
Wait until the LCD shows **`Boat IP: 192.168.4.1`**.

### Step 2 — Connect to the boat's WiFi 📶
On your phone or laptop, open WiFi settings and join:
- **Name:** `WaterBoat`
- **Password:** `12345678`

(Your phone may say "No internet". That's okay! Choose **"Stay connected"**.)

### Step 3 — Open the website 🌐

**On a laptop / computer (easiest):**
1. Open the `WEBSITE` folder.
2. **Double-click `index.html`**. It opens in Chrome / Edge / Firefox.

**On a phone:**
- **Option A:** Copy the whole `WEBSITE` folder (all 3 files) to the phone, then open `index.html` with the browser.
- **Option B:** Share it from a laptop. Connect the laptop to `WaterBoat` too, open a terminal inside the `WEBSITE` folder and run:
  ```
  python -m http.server 8000
  ```
  The laptop's WiFi address will look like `192.168.4.2`. On the phone, open `http://192.168.4.2:8000` (use your laptop's real address).

> ⚠️ Open the website from your own device or from a plain `http://` address.
> If you put it on an **`https://`** website (like GitHub Pages), the browser will **block** it from talking to the boat.

### Step 4 — Check the connection ✅
Look at the pill at the top right:

| Pill                    | Meaning                                       |
|-------------------------|-----------------------------------------------|
| 🟡 **Connecting…**      | Trying to reach the boat                      |
| 🟢 **Live**             | Connected with the fast live line (WebSocket) |
| 🟢 **Live · HTTP**      | Connected with the slower backup line         |
| 🔴 **Offline**          | No data for 3 seconds                         |

### Step 5 — If the boat has a different address
If the boat joined your home WiFi (Router mode), its address is different (look at the LCD).
- Tap **⚙️** → type the address (for example `192.168.1.50`) → **Connect**.
- Or open the page with the address in the link: `index.html?boat=192.168.1.50`

---

## 7. Tour of the screen

```
┌──────────────────────────────────────────────────────┐
│ 💧 AQUA NEXUS                      🟢 Live     ⚙️    │ ← Header
│ [ Monitor ] [ Control ]                              │ ← Tabs
├──────────────────────────────────────────────────────┤
│ 🆘 BOAT SINKING … (only when there's danger)         │ ← Hazard banners
│ ✓ All systems normal                                 │ ← Alerts box
├──────────────────────────────────────────────────────┤
│  ( 78 )  Water Quality: GOOD                         │
│  /100    pH ████████  Turbidity █████ …              │ ← Score
├──────────────────────────────────────────────────────┤
│   Live Digital Twin  🚤 (moves like the real boat)   │
│   ①②③ … numbered sensor dots                        │
├──────────────────────────────────────────────────────┤
│ Underwater: [1 pH] [2 Temp] [3 Turbidity]            │
│ Top deck:   [4 Gas] [5 Rain] [6-8 ESP32/Nano/LCD]    │
│ Side:       [9 Water level]                          │
│ Navigation: [GPS] [Boat Motion]                      │
└──────────────────────────────────────────────────────┘
```

### The 11 numbered dots on the boat drawing

| No. | Sensor        | Where on the boat | Dot colour zone |
|-----|---------------|-------------------|-----------------|
| 1   | pH            | Underwater        | 🔵 blue         |
| 2   | Temperature   | Underwater        | 🔵 blue         |
| 3   | Turbidity     | Underwater        | 🔵 blue         |
| 4   | Gas           | Top deck          | 🟠 orange       |
| 5   | Rain          | Top deck          | 🟠 orange       |
| 6   | LCD           | Top deck          | 🟠 orange       |
| 7   | ESP32         | Top deck          | 🟠 orange       |
| 8   | Nano          | Top deck          | 🟠 orange       |
| 9   | Water level   | Side of the hull  | 🟢 green        |
| 10  | Motor driver  | Middle deck       | 🟣 purple       |
| 11  | Motors        | Middle deck       | 🟣 purple       |

The dot itself turns **green / orange / red** depending on whether that sensor's reading is good, a warning, or bad.

### What each card tells you

| Card               | Look at…                                                        |
|--------------------|-----------------------------------------------------------------|
| **pH**             | The number (0–14) and where the marker sits on the rainbow bar  |
| **Water Temperature** | °C. If there are several probes, all are listed              |
| **Turbidity**      | NTU (0 = clear). The water in the drawing turns brown when high |
| **Air / Gas**      | NH3, CO2, CO, Alcohol in ppm. Says **WARM-UP** for the first minute |
| **Rain**           | % wet, and 10 little drops that light up                        |
| **Controller & Display** | Online/offline, speed of connection, uptime, packets received |
| **Water Level**    | A tank that fills up. Border turns orange/red when dangerous    |
| **GPS**            | Location, speed, satellite bars. **Open in Maps** / **Copy coords** after a fix |
| **Boat Motion**    | Roll ("left down" / "right down"), Pitch ("bow up" / "bow down"), heading in degrees and N/NE/E…, and drive (FORWARD / TURN LEFT / STOPPED…). Status: STABLE / ROCKING (>10°) / TILTED (>25°) |

---

## 8. Driving the boat

1. Tap the **Control** tab.
2. Check the chip says **NANO ONLINE** 🟢. (If it says NANO OFFLINE, the motors can't move.)
3. Choose a speed with the **slider** (60 = slow, 255 = fastest).
4. Use the arrow pad:

```
            ▲ FORWARD
   ◀ LEFT   ■ STOP   RIGHT ▶
            ▼ BACK
```

### Two driving styles

| Style               | How it works                                             |
|---------------------|----------------------------------------------------------|
| **Hold to move** (default) | Boat moves **only while your finger is on the button**. Let go = stop. Safest! 👍 |
| **Tap to move**     | Tap once = start moving. Tap the same button again or ■ STOP = stop |

### Keyboard (laptop, Control tab only)

| Key                  | Action   |
|----------------------|----------|
| `W` or `↑`           | Forward  |
| `S` or `↓`           | Back     |
| `A` or `←`           | Left     |
| `D` or `→`           | Right    |
| `Space`              | Stop     |

> ℹ️ The boat's helper board (Nano) has a **top-speed limit of 180**. If you slide above 180, the boat won't go faster.
> This can be changed in the firmware (`src/nano/MotorDriver.h`).

---

## 9. What the colours mean

| Colour     | Meaning               | Example                           |
|------------|-----------------------|-----------------------------------|
| 🟢 Green   | Good / safe           | NORMAL, CLEAR, SAFE, NANO ONLINE  |
| 🟠 Orange  | Be careful            | SLIGHTLY CLOUDY, LIGHT RAIN, WATER RISING, ROCKING |
| 🔴 Red     | Danger / problem      | ACIDIC, VERY MUDDY, SINKING, OFFLINE, TILTED |
| 🔵 Blue    | Information           | Drive status, LCD                 |
| ⚪ Grey **OFF** | Sensor switched off in the boat's `config.h` | — |

Special screen effects:
- 🌧️ **Rain falls on the screen** → it's raining at the boat.
- ⚡ **Screen flashes** → heavy rain.
- 🌊 **Water rises from the bottom of the screen** → water is climbing the boat's side. **Bring it back!**
- 🌫️ **Page looks faded** → lost connection to the boat.

---

## 10. Settings you can change

### In the website (no coding)

| Setting            | Where                        | Remembered? |
|--------------------|------------------------------|-------------|
| Boat address       | ⚙️ → Boat address → Connect  | ✅ Yes       |
| Speed              | Control tab → slider         | ✅ Yes       |
| Hold / Tap mode    | Control tab → switch         | ❌ No (starts on Hold) |
| Clear trend graphs | ⚙️ → Clear trends            | —           |

### In `script.js` (small code change)

**`IMU_MAP`** — near the top of `script.js`:
```js
const IMU_MAP={
  swapRollPitch:true,   // sensor X/Y axes are turned 90° on the boat
  invertYaw:true,       // yaw turns the opposite way
  invertRoll:true,      // roll direction reversed
  invertPitch:true      // pitch direction reversed
};
```
**When to change it:** tilt the real boat to the **right**. Does the drawing also tilt right?
- Drawing tilts **front/back instead of sideways** → flip `swapRollPitch` (`true` ↔ `false`).
- Drawing tilts the **opposite side** → flip `invertRoll`.
- Nose goes **down instead of up** → flip `invertPitch`.
- Compass turns the **wrong way** → flip `invertYaw`.

Save the file and **refresh** the page.

**`DEFAULT_BOAT`** — the address used the very first time:
```js
const DEFAULT_BOAT='192.168.4.1';
```

---

## 11. Something is not working? (Troubleshooting)

| Problem                                  | Try this                                                   |
|------------------------------------------|------------------------------------------------------------|
| Pill stays **Connecting…** / **Offline** | Is your device on the `WaterBoat` WiFi? Is the boat on?    |
| Phone keeps leaving `WaterBoat` WiFi     | Tap "Stay connected" when it says "No internet". Turn off mobile data for a moment |
| Address is wrong                         | ⚙️ → type the IP shown on the boat's LCD → Connect          |
| Works on laptop, not when hosted online  | Don't host on `https://`. Open the file directly or use `http://` |
| **Live · HTTP** instead of **Live**      | It's still working, just slower. The live line will retry every 5 s |
| A card says **OFF**                      | That sensor is switched off in the firmware's `config.h`   |
| Gas says **WARM-UP**                     | Normal — wait about 1 minute after switching on the boat   |
| GPS says **SEARCHING**                   | Boat must be outside under open sky. Wait up to 5 minutes  |
| GPS says **NO DATA**                     | GPS wiring problem on the boat                             |
| Motion says **NOT FOUND**                | Gyro wiring problem on the boat                            |
| **NANO OFFLINE**                         | Check wires between ESP32 and Nano on the boat             |
| Boat drawing tilts the wrong way         | Change `IMU_MAP` in `script.js` (see [Settings](#10-settings-you-can-change)) |
| Boat stops when I switch apps            | That's on purpose — a safety feature 🛡️                    |
| Page looks plain with no colours         | `style.css` is missing — keep all 3 files in the same folder |
| Nothing moves / no numbers at all        | `script.js` is missing — keep all 3 files in the same folder |

---

## 12. Small dictionary of big words

| Word             | Simple meaning                                                    |
|------------------|-------------------------------------------------------------------|
| **Website**      | A page you open in a browser (Chrome, Edge, Safari…).             |
| **Browser**      | The app you use to open websites.                                 |
| **HTML**         | The language for the **structure** of a page (the skeleton).      |
| **CSS**          | The language for the **look** of a page (colours, sizes).         |
| **JavaScript (JS)** | The language that makes a page **do things**.                  |
| **SVG**          | Pictures made from code (shapes), which stay sharp at any size.   |
| **Dashboard**    | A screen that shows lots of information at once, like a car's dashboard. |
| **Digital twin** | A drawing that copies what the real object is doing, live.        |
| **IP address**   | The boat's "house number" on WiFi, like `192.168.4.1`.            |
| **WebSocket**    | A live, always-open line between phone and boat (like a phone call). |
| **HTTP**         | Asking for data and waiting for a reply (like sending a letter).   |
| **JSON**         | Data written as neat text with labels and values.                 |
| **Latency**      | How long a message takes to travel.                               |
| **Packet**       | One delivery of data from the boat.                               |
| **Uptime**       | How long the boat has been switched on.                           |
| **Toast**        | A small pop-up message that disappears by itself.                 |
| **Trend / sparkline** | The small line graph showing how a value changed recently.   |
| **Roll / Pitch / Yaw** | Tilt sideways / nose up-down / turning left-right.          |
| **pH**           | How sour or soapy water is. 7 = neutral.                          |
| **NTU**          | Unit for how muddy water is. Small = clear.                       |
| **ppm**          | Parts per million — how much of a gas is in the air.              |

---

Have fun driving, and keep the water clean! 🐟💧📱

