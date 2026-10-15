# 🚤 Water Boat — Firmware (the boat's brain)

> **Hello!** 


---

## 📖 Table of contents

1. [What is this project?](#1-what-is-this-project)
2. [The team inside the boat](#2-the-team-inside-the-boat)
3. [Parts you need](#3-parts-you-need)
4. [Map of all the folders and files](#4-map-of-all-the-folders-and-files)
5. [Every file explained, one by one](#5-every-file-explained-one-by-one)
6. [Wiring: which wire goes where](#6-wiring-which-wire-goes-where)
7. [How to put the code on the boat (step by step)](#7-how-to-put-the-code-on-the-boat-step-by-step)
8. [Calibration: teaching the sensors](#8-calibration-teaching-the-sensors)
9. [What the boat says in the Serial Monitor](#9-what-the-boat-says-in-the-serial-monitor)
10. [Safety features](#10-safety-features)
11. [Something is not working? (Troubleshooting)](#11-something-is-not-working-troubleshooting)
12. [Small dictionary of big words](#12-small-dictionary-of-big-words)

---

## 1. What is this project?

Imagine a **small robot boat** that floats on a pond or lake. 🦆

It is like a **water doctor**. A doctor checks your temperature and asks, "Are you feeling okay?"
In the same way, this boat checks the water and asks, **"Is this water healthy for fish?"**

The boat can:

| The boat can…               | Using this part               |
|-----------------------------|-------------------------------|
| 🧪 Check if water is sour or soapy (pH) | pH sensor              |
| 🌡️ Check how hot or cold the water is  | DS18B20 temperature probe |
| 🟤 Check if water is clear or muddy    | Turbidity sensor          |
| 👃 Smell bad gas above the water       | MQ-135 gas sensor         |
| 🌧️ Feel if it is raining               | Rain sensor plate         |
| 🆘 Know if water is coming inside (sinking!) | Water level sensor on the side |
| 📍 Know where it is on Earth           | GPS module (NEO-6M)       |
| 🔄 Know if it is tilting or turning    | Gyro sensor (MPU6050)     |
| 📺 Show a message on its own little screen | 16x2 LCD display     |
| 🚣 Move forward, back, left, right     | 2 motors + Arduino Nano   |
| 📱 Talk to your phone over WiFi        | ESP32's WiFi              |

At the end, the boat gives the water a **score from 0 to 100**, like marks in an exam:

| Score    | Rating       | Meaning                        |
|----------|--------------|--------------------------------|
| 85 – 100 | EXCELLENT 🌟 | Super healthy water            |
| 70 – 84  | GOOD 🙂      | Healthy water                  |
| 50 – 69  | MODERATE 😐  | Okay, but watch it             |
| 30 – 49  | POOR 😟      | Not good for fish              |
| 0 – 29   | VERY BAD ☠️  | Dangerous for fish             |

---

## 2. The team inside the boat

Think of the boat like a **school team**. Each member has one job.

```
                 📱 Your phone / laptop (the WEBSITE)
                          ▲   │
             sensor data  │   │  "go forward!"
                          │   ▼
   ┌──────────────────────────────────────────────┐
   │   🧠 ESP32  — the CAPTAIN (main brain)        │
   │   • reads all sensors                         │
   │   • makes the WiFi                            │
   │   • calculates the water score                │
   │   • writes on the LCD                         │
   └──────────────────────────────────────────────┘
        │ wires to            │ wire message: "F180"
        ▼ every sensor        ▼
   🧪🌡️🟤👃🌧️🆘📍🔄      💪 Arduino NANO — the HELPER
   (the senses)              • only job: spin the motors
                                   │
                                   ▼
                             🔌 Motor driver → ⚙️ Left motor + ⚙️ Right motor
```

- **ESP32 = the Captain.** It is a tiny computer with WiFi. It reads every sensor and makes the decisions.
- **Arduino Nano = the Helper.** The captain is busy, so the helper only takes care of the motors.
  The captain sends short notes like `F180` ("Forward at speed 180") and the helper does it.
- **Sensors = the senses** (eyes, nose, skin) of the boat.
- **LCD = the boat's face.** It shows a short message.
- **Website = a window** into the boat from your phone. You can see everything and drive the boat.

**Why two boards?** Motors use a lot of power and make electrical "noise".
Keeping them on a separate helper board (the Nano) keeps the captain (ESP32) calm and working properly.

---

## 3. Parts you need

| Part                               | How many | What it does                          |
|------------------------------------|----------|---------------------------------------|
| ESP32 Dev board (esp32dev)         | 1        | Main brain + WiFi                     |
| Arduino Nano (ATmega328)           | 1        | Motor helper                          |
| Motor driver (L298N / L9110S / MX1508 / DRV8833) | 1 | Gives power to motors      |
| DC motors with paddle wheels       | 2        | Make the boat move                    |
| MPU6050 gyro + accelerometer       | 1        | Tilt and turning                      |
| NEO-6M GPS module                  | 1        | Location                              |
| Analog water level sensor (S + −)  | 1        | Detects water coming up the side      |
| Rain sensor (FC-37 / YL-83)        | 1        | Detects rain                          |
| MQ-135 gas sensor                  | 1        | Smells ammonia / bad air              |
| DS18B20 waterproof temperature probe | 1 (up to 4) | Water temperature              |
| Turbidity sensor (SEN0189 type)    | 1        | Clear or muddy water                  |
| pH sensor (PH-4502C type + probe)  | 1        | Sour (acidic) or soapy (alkaline)     |
| 16x2 LCD with I2C backpack         | 1        | Small screen                          |
| Resistors: 4.7k (1), 10k (3), 20k (3), 1k (1), 2k (1) | — | Protect pins, help sensors   |
| Battery                            | 1        | Power                                 |

---

## 4. Map of all the folders and files

```
Water Boat/
│
├── platformio.ini          ← The "recipe card": which board, which libraries
├── .gitignore              ← List of files Git should ignore
├── README.md               ← You are reading this!
│
├── include/                ← "Menu cards" (.h files): names, pins and settings
│   ├── config.h            ← ⭐ MAIN SETTINGS: switch parts ON/OFF, WiFi name
│   ├── pindef.h            ← ⭐ Which ESP32 pin goes to which sensor
│   ├── BoatData.h          ← One big box that holds all latest readings
│   ├── Display.h           ← LCD settings
│   ├── GasSensor.h         ← Gas sensor settings
│   ├── GPS.h               ← GPS settings
│   ├── Gyro.h              ← Gyro settings
│   ├── Motor.h             ← How ESP32 talks to the Nano
│   ├── PHSensor.h          ← pH sensor settings
│   ├── RainSensor.h        ← Rain sensor settings
│   ├── TempSensor.h        ← Temperature sensor settings
│   ├── Turbidity.h         ← Turbidity sensor settings
│   ├── WaterLevel.h        ← Water level (sinking) settings
│   ├── WaterQuality.h      ← How the 0-100 score is made
│   ├── WebDashboard.h      ← WiFi / website connection settings
│   └── README              ← PlatformIO's note about this folder
│
├── src/                    ← "Kitchen" (.cpp files): the real working code for ESP32
│   ├── main.cpp            ← ⭐ The captain's daily routine (start here!)
│   ├── Display.cpp         ← Writes on the LCD
│   ├── GasSensor.cpp       ← Reads the gas sensor
│   ├── GPS.cpp             ← Reads the GPS
│   ├── Gyro.cpp            ← Reads the gyro, calculates tilt
│   ├── Motor.cpp           ← Sends motor notes to the Nano
│   ├── PHSensor.cpp        ← Reads pH, handles calibration
│   ├── RainSensor.cpp      ← Reads the rain sensor
│   ├── TempSensor.cpp      ← Reads water temperature
│   ├── Turbidity.cpp       ← Reads muddiness
│   ├── WaterLevel.cpp      ← Reads water level (sinking check)
│   ├── WaterQuality.cpp    ← Gives the water its score
│   ├── WebDashboard.cpp    ← WiFi + sends data to the phone
│   │
│   └── nano/               ← Code for the HELPER (Arduino Nano) only
│       ├── main.cpp        ← Nano's routine: listen and move motors
│       ├── MotorDriver.cpp ← Spins the motors
│       ├── MotorDriver.h   ← Motor speed limits and settings
│       └── NanoPins.h      ← Which Nano pin goes to the motor driver
│
├── lib/                    ← Empty shelf for your own libraries (has a README)
├── test/                   ← Empty shelf for tests (has a README)
│
├── Webpage/
│   └── index.html          ← Older all-in-one version of the website (1 file)
│
├── WEBSITE/                ← ⭐ Newer website (3 files) — see WEBSITE/README.md
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .vscode/                ← Settings for the VS Code editor (made automatically)
└── .pio/                   ← PlatformIO's workshop (made automatically — don't touch)
```

**Easy way to remember:**
- **`.h` files (include/)** = the **menu card**. It says *what* dishes exist and the settings.
- **`.cpp` files (src/)** = the **kitchen**. It is where the dishes are *really cooked*.

For every sensor there is a pair: `GPS.h` (menu) + `GPS.cpp` (kitchen).

---

## 5. Every file explained, one by one

### 📂 Files in the main folder

#### `platformio.ini` — the recipe card 📝

- **What is it?** A settings file for **PlatformIO** (the tool that builds code and puts it on the board).
- **Why is it here?** This one project has code for **two different boards**. This file tells PlatformIO:
  - `[env:esp32dev]` → build for the **ESP32**. Use all files in `src/` **except** `src/nano/`.
    It also downloads the libraries the ESP32 needs:
    - `TinyGPSPlus` – understands GPS messages
    - `OneWire` + `DallasTemperature` – talk to the temperature probe
    - `LiquidCrystal_I2C` – writes on the LCD
    - `WebSockets` – live connection to the phone
  - `[env:nano]` → build for the **Arduino Nano**. Use **only** `src/nano/`.
  - `default_envs = esp32dev` → if you just press "Upload", it goes to the ESP32.
  - `monitor_speed` → how fast the board talks to your computer (115200 for ESP32, 9600 for Nano).
- **How to use it:**
  - Normally you don't change anything.
  - If your computer uses a fixed COM port, remove the `;` in front of `upload_port = COM9` and change the number.
  - If the Nano upload fails with "not in sync", change `nanoatmega328new` to `nanoatmega328` (old bootloader).

#### `.gitignore` — the "don't pack this" list 🎒

- **What?** A list for **Git** (the tool that saves versions of your project).
- **Why?** Some files are made automatically and are very big (like `.pio/`). We don't need to save them.
- **How to use?** Nothing to do. It works by itself.

#### `README.md` — this guide 📘

- You are reading it now!

---

### 📂 `include/` — the menu cards (settings and names)

#### ⭐ `config.h` — the MAIN SWITCH BOARD

- **What?** The most important settings file.
- **Why?** So you can change how the boat works **without touching the hard code**.
- **How to use it:**

  **1. Switch any part ON or OFF** — `1` means ON, `0` means OFF.
  ```cpp
  #define USE_GYRO    1   // gyro sensor
  #define USE_GPS     1   // GPS
  #define USE_WATER   1   // water level (sinking check)
  #define USE_RAIN    1   // rain
  #define USE_GAS     1   // gas
  #define USE_TEMP    1   // water temperature
  #define USE_TURB    1   // turbidity (muddy)
  #define USE_PH      1   // pH
  #define USE_LCD     1   // LCD screen
  #define USE_MOTOR   1   // motors (Nano)
  #define USE_WEB     1   // WiFi + website
  ```
  Example: your pH sensor is broken? Make it `#define USE_PH 0` and upload again.
  The boat and website will simply show pH as **OFF**.

  **2. Choose the WiFi type**
  ```cpp
  #define WIFI_USE_ROUTER  0
  ```
  - `0` = **Hotspot mode** (default). The boat makes its **own WiFi**:
    - WiFi name: **`WaterBoat`**
    - Password: **`12345678`**
    - Boat address: **`192.168.4.1`**
  - `1` = **Router mode**. The boat joins your home WiFi or your mobile hotspot.
    Fill in `WIFI_STA_SSID` (WiFi name) and `WIFI_STA_PASSWORD`.
    The boat's address is shown on the LCD and in the Serial Monitor.
    If it can't find your WiFi in 15 seconds, it makes its own `WaterBoat` hotspot instead.

  **3. Serial Monitor printing**
  ```cpp
  #define SERIAL_PRINT_MS   2000   // print all values every 2 seconds (0 = off)
  ```

#### ⭐ `pindef.h` — the address book of pins

- **What?** A list that says which **ESP32 pin** is connected to which sensor.
- **Why?** If you move a wire, you change the number here **once**, and the whole code follows.
- **How to use?** See the full table in [Section 6: Wiring](#6-wiring-which-wire-goes-where).
- **Important rule written inside:** analog sensors must use **pins 32–39** (called ADC1).
  The other analog pins (ADC2) **stop working when WiFi is on**.

#### `BoatData.h` — the big school bag 🎒

- **What?** One big "bag" called `boat` that holds the **latest reading of every sensor**.
- **Why?** The sensors put their readings *into* the bag. The LCD, website and score *take* readings *from* the bag.
  Everybody uses the same bag, so nobody gets confused.
- **How to use?** You don't need to change it. If you add a new sensor, you add a new pocket here.

#### `Display.h` — LCD settings 📺

- **What?** Settings for the 16x2 LCD (16 letters wide, 2 lines tall).
- **Why?** LCDs can have different "house numbers" (I2C addresses) like `0x27` or `0x3F`.
- **How to use?**
  - `LCD_ADDR 0` means **"find it automatically"**. Keep it like this.
  - If you see a blue light but **no letters**, turn the small **blue screw** (contrast) on the back of the LCD.
  - Wiring: VCC → 5V, GND → GND, SDA → pin 21, SCL → pin 22.

#### `GasSensor.h` — gas sensor settings 👃

- **What?** Settings for the MQ gas sensor.
- **Why?** There are different MQ sensors. Each one smells different gases:
  - `MQ2` → cooking gas (LPG), hydrogen, smoke
  - `MQ4` → methane (gas from rotting pond mud)
  - `MQ135` → **ammonia (NH3)**, CO2 — best for dirty pond water ✅ (this is selected)
- **How to use?**
  - Change `GAS_SENSOR_TYPE` if you use a different sensor.
  - `GAS_WARMUP_MS 60000` → the sensor has a tiny heater inside. It needs **1 minute** to warm up, like a toaster.
  - `GAS_R0_KOHM 0.0f` → `0` means "measure clean air by yourself at start". See [Calibration](#8-calibration-teaching-the-sensors).
  - `GAS_DIVIDER 1.5f` → the sensor gives up to 5V, but ESP32 pins only like 3.3V. Two resistors (10k + 20k) make the voltage smaller. This number undoes that math.

#### `GPS.h` — GPS settings 📍

- **What?** Settings for the NEO-6M GPS.
- **Why?** To know the boat's **latitude, longitude, speed, height, number of satellites and time**.
- **How to use?** GPS speed is 9600 (the module's normal speed). No change needed.
  GPS **TX** → ESP32 pin **26**, GPS **RX** → ESP32 pin **27**.

#### `Gyro.h` — gyro settings 🔄

- **What?** Settings for the MPU6050 sensor.
- **Why?** It tells the boat three things:
  - **Roll** = tilting left or right (like a see-saw going sideways)
  - **Pitch** = nose going up or down
  - **Yaw** = which way the boat is turning (like a compass, but it slowly drifts)
- **How to use?** Address is `0x68`. If the AD0 pin on the sensor is connected to 3.3V, change it to `0x69`.

#### `Motor.h` — how the captain talks to the helper 💬

- **What?** Settings for the ESP32 ↔ Nano "chat".
- **Why?** The ESP32 sends small notes, and the Nano replies:

  | ESP32 sends | Meaning                |
  |-------------|------------------------|
  | `F200`      | Forward at speed 200   |
  | `B200`      | Backward at speed 200  |
  | `L200`      | Turn left              |
  | `R200`      | Turn right             |
  | `S`         | Stop                   |

  The Nano replies like `OK,F,200,200` → "OK, going Forward, left motor 200, right motor 200".
- **How to use?**
  - `MOTOR_DEFAULT_SPEED 180` → starting speed.
  - `MOTOR_RESEND_MS 200` → the ESP32 repeats the note every 0.2 seconds, so the Nano knows the captain is still there.
  - `NANO_ONLINE_MS 1000` → if the Nano doesn't reply for 1 second, it is shown as **OFFLINE**.

#### `PHSensor.h` — pH sensor settings 🧪

- **What?** Settings for the pH sensor.
- **Why?** pH tells us if water is **sour** (acidic, like lemon juice) or **soapy** (alkaline, like soap water).
  - pH **7** = neutral (pure water)
  - Below 7 = acidic 🍋
  - Above 7 = alkaline 🧼

  | pH          | Status            | What it means for a pond                |
  |-------------|-------------------|-----------------------------------------|
  | below 6.0   | ACIDIC            | Acid rain, pollution, rotting leaves    |
  | 6.0 – 6.5   | SLIGHTLY ACIDIC   | Normal in the morning                   |
  | 6.5 – 8.5   | NORMAL ✅         | Healthy pond                            |
  | 8.5 – 9.0   | SLIGHTLY ALKALINE | Afternoon, lots of algae                |
  | above 9.0   | ALKALINE          | Too much algae / soap / sewage — bad for fish |
- **How to use?** Calibrate it with RO water (see [Calibration](#8-calibration-teaching-the-sensors)).
  You **don't** need to change code for that. You just type `cal` in the Serial Monitor.

#### `RainSensor.h` — rain sensor settings 🌧️

- **What?** Settings for the rain plate.
- **Why?** When the plate gets wet, its number goes **down**. The code turns that into **0% (dry) to 100% (very wet)**.
  - below 10% → NO RAIN
  - 10–40% → LIGHT RAIN
  - 40–70% → MEDIUM RAIN
  - above 70% → HEAVY RAIN
- **How to use?** `RAIN_RAW_DRY` and `RAIN_RAW_WET` can be adjusted (see [Calibration](#8-calibration-teaching-the-sensors)).

#### `TempSensor.h` — temperature settings 🌡️

- **What?** Settings for the DS18B20 waterproof temperature probe.
- **Why?** Fish like water that is not too cold or too hot.
  - below 20°C → COLD
  - 20–32°C → NORMAL
  - above 32°C → HOT
- **How to use?** Wires: Red → 3.3V, Black → GND, Yellow → pin 4.
  **You must put a 4.7k resistor between Yellow and Red (3.3V).** Without it, the probe is not found.
  You can connect up to **4 probes** on the same yellow wire.

#### `Turbidity.h` — muddiness settings 🟤

- **What?** Settings for the turbidity sensor.
- **Why?** It shines light through the water. Muddy water blocks light. It measures in **NTU** (a unit for muddiness).
  - below 10 NTU → CLEAR
  - 10–50 → SLIGHTLY CLOUDY
  - 50–100 → MUDDY
  - above 100 → VERY MUDDY
- **How to use?**
  - The small switch on the sensor board must be set to **"A"** (analog).
  - `TURB_CLEAR_V` → put the voltage you see in clean drinking water here (see [Calibration](#8-calibration-teaching-the-sensors)).

#### `WaterLevel.h` — sinking alarm settings 🆘

- **What?** Settings for the water level sensor stuck on the **side of the boat**.
- **Why?** If water climbs up this sensor, it means the **boat is going down into the water**!
  - below 40% → SAFE
  - 40–70% → WATER RISING ⚠️
  - above 70% → SINKING 🆘
- **How to use?** `WATER_RAW_DRY` and `WATER_RAW_FULL` can be adjusted (see [Calibration](#8-calibration-teaching-the-sensors)).

#### `WaterQuality.h` — the exam paper 📝

- **What?** Explains how the final water score (0–100) is made.
- **Why?** Four sensors give marks, but some are **more important**:

  | Subject          | Weight (importance) |
  |------------------|---------------------|
  | pH               | 35                  |
  | Turbidity        | 35                  |
  | Temperature      | 15                  |
  | Gas (ammonia)    | 15                  |

  Like a school exam where Maths and Science count more than Drawing.
  If a sensor is OFF or not ready, it is simply **left out** of the score.
- **How to use?** Change the weights if you think one sensor matters more.

#### `WebDashboard.h` — WiFi connection settings 📡

- **What?** Settings for how the phone/website talks to the boat.
- **Why?** The boat gives data in two ways:
  - **WebSocket** (`ws://192.168.4.1:81/`) → a **live phone call**. The boat sends new data every **0.5 seconds**.
  - **HTTP** (`http://192.168.4.1/api/data`) → like **sending a letter and waiting for a reply**. Used if the live call fails.
- **How to use?**
  - `WEB_PUSH_MS 500` → how often live data is sent.
  - `WEB_CONTROL_TIMEOUT_MS 1500` → **safety**: if the phone stops talking for 1.5 seconds, the motors stop.

#### `include/README`

- **What?** A note written by PlatformIO explaining what an `include` folder is. You can ignore it.

---

### 📂 `src/` — the kitchen (ESP32 code)

#### ⭐ `main.cpp` — the captain's daily routine

- **What?** The **starting point** of the ESP32 program. Read this file first.
- **Why?** Every Arduino program has two parts:
  - **`setup()`** = "**Good morning!**" — runs **once** when you switch the boat on.
  - **`loop()`** = "**Do your work again and again**" — runs **forever**, thousands of times every second.

- **What happens in `setup()` (the morning):**
  1. Starts the Serial Monitor and says `========== WATER BOAT ==========`.
  2. **Stops the motors first** (safety!).
  3. Starts the LCD and shows `WATER BOAT / Starting...`.
  4. Starts the gyro and **calibrates it** — LCD shows `Calibrating IMU / Keep boat still`.
     👉 **Keep the boat flat and still at this moment!**
  5. Starts GPS, water level, rain, gas, temperature, turbidity and pH sensors.
  6. Starts WiFi and shows the **boat's IP address on the LCD for 5 seconds**.

- **What happens in `loop()` (all day):**

  | Job                                   | How often          |
  |---------------------------------------|--------------------|
  | Talk to the phone (website)           | all the time       |
  | Remind the Nano "I'm still here"      | all the time       |
  | Read the gyro                         | 50 times a second  |
  | Read GPS                              | every 1 second     |
  | Read water temperature                | when ready (~0.8 s) |
  | Check if you typed `cal` for pH       | all the time       |
  | Read **one** analog sensor (takes turns: water → rain → gas → turbidity → pH) | every 0.2 s (so each one every ~1 s) |
  | Calculate water quality score         | every 1 second     |
  | Update the LCD                        | every 1 second     |
  | Print everything in Serial Monitor    | every 2 seconds    |

  **Why take turns?** Reading a sensor takes a little time. If the boat read all of them together,
  it would "freeze" and the phone controls would feel slow. Taking turns keeps everything smooth.
  (It's like students answering one by one instead of all shouting together!)

- **What the LCD shows:**
  - Normally: `Water Quality:` / `GOOD 78%`
  - If the boat is **sinking**: it **blinks** `!! BOAT SINKING` / `Water level 75%`
  - If it is **raining**: it **blinks** `!! RAINING` / `LIGHT RAIN`

- **How to use?** You usually don't need to change it. To turn parts on/off, use `config.h`.

#### `Display.cpp` — the LCD writer ✍️

- **What?** Code that writes letters on the LCD.
- **Why?** It **searches** for the LCD at many possible addresses, so you don't need to know it.
  It also fills empty space with blanks so old letters don't stay behind (no flickering).
- **How to use?** Nothing to change. If the LCD is not found, the Serial Monitor says:
  `LCD: Not found - check wiring (SDA=21, SCL=22, VCC=5V)`.

#### `GasSensor.cpp` — the nose 👃

- **What?** Reads the MQ gas sensor and turns the voltage into **ppm** (parts per million — how much gas is in the air).
- **Why / how it works:**
  1. Waits **60 seconds** for the heater to warm up.
  2. If not calibrated, it **smells clean air** and remembers it as "normal" (called R0).
  3. After that, it compares new air to that normal air. More gas = smaller number = more ppm.
  4. For MQ-135 it shows **NH3, CO2, CO and Alcohol**. The **first one (NH3 / ammonia)** decides the status:
     - below 5 ppm → GOOD
     - 5–25 ppm → MODERATE
     - above 25 ppm → POOR
  5. It **smooths** the reading because wind and waves make it jumpy.
- **How to use?** Switch the boat on **on the shore in fresh air** the first time, so it learns clean air correctly.

#### `GPS.cpp` — the map reader 🗺️

- **What?** Reads messages from the GPS module and pulls out location, speed, satellites and time.
- **Why?** So you can find the boat on Google Maps from the website.
- **How to use?** Take the boat **outside under open sky**. GPS does not work well indoors.
  The first "fix" can take **1–5 minutes**. Messages you may see:
  - `GPS: No data received` → check wires.
  - `GPS: Waiting for fix... Satellites: 3` → wait, it is searching.

#### `Gyro.cpp` — the balance sense 🔄

- **What?** Talks directly to the MPU6050 and calculates roll, pitch and yaw.
- **Why / how it works:**
  - At start it **calibrates**: it reads 500 times while the boat is still, and learns the "zero" position.
  - It mixes two measurements (98% from the gyro + 2% from the accelerometer). This mix is called a
    **complementary filter**. It gives steady, smooth angles — like using both your eyes and your ears to keep balance.
  - If the gyro is not found, the main code **tries again every 5 seconds**.
- **How to use?** Keep the boat **flat and still** for a few seconds after switching on.

#### `Motor.cpp` — the messenger to the Nano 📨

- **What?** Sends notes like `F180` to the Nano through wires (pins 16 and 17) and reads the Nano's replies.
- **Why?** So the ESP32 knows if the Nano is **ONLINE** and what speed each motor really has.
- **How it works:** It repeats the current note every **0.2 s**. If the Nano doesn't hear anything
  for 1 second, it stops the motors by itself (safety).
- **How to use?** Nothing to change.

#### `PHSensor.cpp` — the sour/soapy checker 🧪

- **What?** Reads the pH probe and calculates pH (0–14).
- **Why / how it works:**
  - Reads **30 times**, throws away the 5 highest and 5 lowest (noise), and averages the rest.
  - Uses the **water temperature** from the DS18B20 to be more accurate.
  - **Saves calibration in the ESP32's memory** (flash), so it is remembered even after switching off.
- **How to use?** Type these in the Serial Monitor (115200 baud):

  | You type    | What happens                                         |
  |-------------|------------------------------------------------------|
  | `cal`       | Calibrate with RO water (pH 6.50)                    |
  | `cal 7.0`   | Calibrate with any liquid whose pH you know (here 7.0) |
  | `reset`     | Forget calibration and use default values            |

#### `RainSensor.cpp` — the rain feeler 🌧️

- **What?** Reads the rain plate 20 times, averages it, and turns it into 0–100%.
- **Why?** To warn you to cover the electronics when it rains.
- **How to use?** Nothing to change; adjust numbers in `RainSensor.h` if needed.

#### `TempSensor.cpp` — the thermometer 🌡️

- **What?** Reads the DS18B20 probe(s).
- **Why / how it works:**
  - It **asks** the probe for a temperature, then **comes back later** (after 0.8 s) to collect the answer,
    instead of waiting. Like putting rice on the stove and doing homework while it cooks. 🍚
  - If you plug in the probe **after** switching on, it will still find it.
  - It knows two "bad" numbers: **-127** (probe unplugged) and **85** (reading failed).
- **How to use?** Remember the **4.7k resistor**.

#### `Turbidity.cpp` — the muddy-water checker 🟤

- **What?** Reads the turbidity sensor 50 times, averages it and converts voltage to **NTU** using a formula from the sensor maker (DFRobot).
- **Why?** Clean water = high voltage (~4.2V). Muddy water = lower voltage.
- **How to use?** Calibrate with clean water (see [Calibration](#8-calibration-teaching-the-sensors)).

#### `WaterLevel.cpp` — the sinking detector 🆘

- **What?** Reads the water level sensor on the boat's side and turns it into 0–100%.
- **Why?** To shout **"SINKING!"** on the LCD and website before the boat is lost.
- **How to use?** Mount it on the side of the hull so that water only touches it if the boat sinks lower.

#### `WaterQuality.cpp` — the teacher who gives marks 👩‍🏫

- **What?** Gives each sensor a mark out of 100, then makes the final score.
- **How marks are given:**

  | pH             | Marks |      | Turbidity (NTU) | Marks |
  |----------------|-------|------|-----------------|-------|
  | 7.0 – 8.0      | 100 (Ideal) |  | below 5     | 100 (Crystal clear) |
  | 6.5 – 8.5      | 80 (Normal) |  | 5 – 10      | 85 (Clear) |
  | 6.0–6.5 / 8.5–9.0 | 50  |      | 10 – 25         | 65 |
  | 5.5–6.0 / 9.0–9.5 | 25  |      | 25 – 50         | 45 |
  | outside that   | 0     |      | 50 – 100        | 25 |
  |                |       |      | above 100       | 10 |

  | Temperature °C | Marks |      | Ammonia (ppm)   | Marks |
  |----------------|-------|------|-----------------|-------|
  | 22 – 30        | 100 (Ideal) |  | below 2     | 100 (Fresh air) |
  | 18–22 / 30–32  | 75    |      | 2 – 5           | 80    |
  | 15–18 / 32–35  | 45    |      | 5 – 10          | 55    |
  | outside that   | 20    |      | 10 – 25         | 30    |
  |                |       |      | above 25        | 10    |

- **Special rule:** If **any one** sensor is terribly bad (10 marks or less), the final score
  **cannot be more than 45**. Why? Because very bad pH alone can hurt fish, even if everything else is perfect.
  (Like: you can't pass the year if you got zero in one subject.)
- **How to use?** Change the numbers if your fish need different conditions.

#### `WebDashboard.cpp` — the WiFi post office 📮

- **What?** Starts WiFi and a small web server on the ESP32.
- **Why?** So the website on your phone can **read data** and **send drive commands**.
- **What it offers:**

  | Address                               | What you get                              |
  |---------------------------------------|-------------------------------------------|
  | `http://192.168.4.1/`                 | A short text help message                 |
  | `http://192.168.4.1/api/data`         | All sensor values as **JSON** (a neat text list) |
  | `http://192.168.4.1/api/cmd?c=F&v=180`| Drive command (Forward, speed 180)        |
  | `ws://192.168.4.1:81/`                | Live data every 0.5 s + controls          |

  👉 Try it: connect to the `WaterBoat` WiFi and open `http://192.168.4.1/api/data` in a browser. You will see all the numbers!

- **Safety rules inside:**
  - Phone stopped sending commands for **1.5 s** → **motors stop**.
  - The last phone **disconnects** → **motors stop**.
- **How to use?** Nothing to change. The website does all the talking.

---

### 📂 `src/nano/` — the helper's code (Arduino Nano only)

> This folder is built **only** when you choose the `nano` environment. The ESP32 ignores it.

#### `nano/main.cpp` — the helper's routine 💪

- **What?** The Nano's program. It **listens** for notes from the ESP32 and moves the motors.
- **How the moves work:**

  | Note | Left motor | Right motor | Boat does       |
  |------|-----------|-------------|-----------------|
  | `F`  | forward   | forward     | goes forward ⬆️ |
  | `B`  | backward  | backward    | goes back ⬇️    |
  | `L`  | backward  | forward     | spins left ⬅️   |
  | `R`  | forward   | backward    | spins right ➡️  |
  | `S`  | stop      | stop        | stops ⏹️        |

- **Safety:** If **no note** comes for **1 second**, it stops the motors and says `TIMEOUT`.
- **Self-test mode:** Change `#define SELF_TEST 0` to `1` and upload. The Nano will then, **by itself**,
  go Forward 3 s → Stop 2 s → Back 3 s → Stop 2 s, again and again. Great for testing motors **without** the ESP32!
  (Remember to change it back to `0` after testing.)
- **Test by typing:** Open the Serial Monitor at **9600** baud and type `F150`, `S`, `L150` etc.

#### `nano/MotorDriver.h` — motor settings ⚙️

- **What?** Settings for the motor driver board.
- **How to use?**
  - `MOTOR_MAX_SPEED 180` → the **top speed limit**. Even if the phone asks for 255, the Nano uses at most 180.
    (This protects the motors and battery. Raise it to 255 if you want full speed.)
  - `MOTOR_MIN_PWM 60` → below this, the motor only hums and doesn't turn. If a motor doesn't start, raise it.
  - `MOTOR_LEFT_INVERT` / `MOTOR_RIGHT_INVERT` → if a motor spins the **wrong way**,
    change `false` to `true` instead of swapping wires. 👍

#### `nano/MotorDriver.cpp` — the motor spinner

- **What?** Sends power pulses (called **PWM**) to the motor driver. More pulses = faster motor.
- **Why?** To make each motor go forward, backward or stop at the right speed.
- **How to use?** Nothing to change.

#### `nano/NanoPins.h` — Nano's address book

- **What?** Which Nano pins go to the motor driver: D5, D6 (left motor), D9, D10 (right motor).
- **Important note inside:** ⚠️ **Unplug the D0 wire before uploading code to the Nano!**
  The Nano uses D0 for USB upload **and** for the ESP32 link. If both are connected, upload fails.

---

### 📂 Other folders

#### `lib/` — empty shelf 📚
- **What?** A place for your **own** libraries. Right now it only has PlatformIO's `README`. Nothing to do.

#### `test/` — empty shelf 🧪
- **What?** A place for automatic tests. Right now only PlatformIO's `README`. Nothing to do.

#### `Webpage/index.html` — the older website (all-in-one)
- **What?** The **same kind of dashboard** as the `WEBSITE/` folder, but everything (HTML + style + code) is packed into **one single file**.
- **Why?** It's handy if you want to send just one file to someone.
- **How to use?** Double-click it after connecting to the boat's WiFi.
  The newer, cleaner version is in `WEBSITE/` → read [WEBSITE/README.md](WEBSITE/README.md).

#### `WEBSITE/` — the new website 📱
- Three files: `index.html`, `style.css`, `script.js`.
- Full explanation: 👉 [WEBSITE/README.md](WEBSITE/README.md)

#### `.vscode/` — editor settings (automatic)
- `extensions.json` → tells VS Code "please install the **PlatformIO** extension".
- `c_cpp_properties.json` → helps VS Code understand the code (colours, auto-complete). Made by PlatformIO.
- `launch.json` → settings for debugging. Made by PlatformIO. **Don't edit** (it says so at the top).

#### `.pio/` — PlatformIO's workshop (automatic)
- **What?** Where PlatformIO keeps downloaded libraries and the **built program** (`firmware.bin`).
- **How to use?** **Don't touch it.** If something is strange, you can delete it — PlatformIO makes it again.

---

## 6. Wiring: which wire goes where

> ⚠️ **ESP32 pins only like 3.3 volts.** Sensors that give 5V must go through **two resistors**
> (a "voltage divider") so the pin gets a smaller voltage:
>
> ```
>   Sensor output ──[10k]──┬── ESP32 pin
>                          │
>                        [20k]
>                          │
>                         GND
> ```

### ESP32 connections

| Part                 | Part pin      | ESP32 pin        | Notes                          |
|----------------------|---------------|------------------|--------------------------------|
| MPU6050 gyro         | SDA           | GPIO 21          | Shares the wires with LCD      |
|                      | SCL           | GPIO 22          | Shares the wires with LCD                                |
| LCD 16x2 (I2C)       | SDA / SCL     | GPIO 21 / 22     | VCC → **5V**                   |
| GPS NEO-6M           | TX            | GPIO 17          | Shares the wires with Arduino Nano                               |
|                      | RX            | GPIO 16          | Shares the wires with Arduino Nano                               |
| Water level sensor   | S             | GPIO 34          | + → 3.3V, − → GND              |
| Rain sensor          | AO            | GPIO 35          | VCC → 3.3V                     |
| Gas sensor MQ-135    | AO            | GPIO 32          | VCC → **5V**, use 10k/20k divider |
| DS18B20 temperature  | Yellow (data) | GPIO 4           | Red → 3.3V, **4.7k from yellow to 3.3V** |
| Turbidity sensor     | OUT           | GPIO 33          | VCC → **5V**, use 10k/20k divider, switch on "A" |
| pH sensor            | Po            | GPIO 36 (VP)     | V+ → **5V**, use 10k/20k divider |
| Arduino Nano         | Nano RX0 (D0) | GPIO 17 (TX2)    | Direct wire                    |
|                      | Nano TX1 (D1) | GPIO 16 (RX2)    | Through **1k / 2k** divider (Nano is 5V!) |
|                      | GND           | GND              | **Must** share ground          |

### Nano ↔ ESP32 divider (for the Nano's TX wire)

```
  Nano D1 (TX) ───── ESP32 GPIO16
  Nano D0 (RX) ───── ESP32 GPIO17
  
```

### Nano → motor driver

| Nano pin | Motor driver pin | Motor        |
|----------|------------------|--------------|
| D5       | IN1              | Left motor   |
| D6       | IN2              | Left motor   |
| D9       | IN3              | Right motor  |
| D10      | IN4              | Right motor  |

---

## 7. How to put the code on the boat (step by step)

### Step 1 — Install the tools (only once)
1. Install **VS Code** (free) from <https://code.visualstudio.com>.
2. Open VS Code → Extensions (the 4-squares icon) → search **PlatformIO IDE** → Install.
3. Wait until it finishes (it downloads many things the first time).

### Step 2 — Open the project
1. In VS Code: **File → Open Folder** → choose the `Water Boat` folder.
2. PlatformIO reads `platformio.ini` and downloads the libraries by itself.

### Step 3 — Change settings (optional)
- Open `include/config.h`. Switch parts ON/OFF and choose the WiFi type.

### Step 4 — Upload to the ESP32 (the captain) 🧠
1. Connect the **ESP32** to the computer with a USB cable.
2. At the bottom of VS Code, click the environment box and choose **`env:esp32dev`**.
3. Click the **→ arrow (Upload)** at the bottom.
4. If it gets stuck at `Connecting.....`, **press and hold the BOOT button** on the ESP32 until it starts uploading.
5. When it says `SUCCESS` ✅, click the **🔌 plug icon (Serial Monitor)** to see messages.

### Step 5 — Upload to the Arduino Nano (the helper) 💪
1. ⚠️ **Unplug the wire on Nano pin D0** first.
2. Connect the **Nano** with USB.
3. Choose **`env:nano`** at the bottom.
4. Click **→ Upload**.
5. If it says `not in sync`, open `platformio.ini` and change `nanoatmega328new` → `nanoatmega328`. Try again.
6. Plug the D0 wire back in.

### Step 6 — First time switching on the boat 🔋
1. Put the boat on a **flat table, on the shore, in fresh air**.
2. Switch it on. **Don't move it** while the LCD says `Calibrating IMU`.
3. Wait **1 minute** for the gas sensor to warm up.
4. The LCD shows the **Boat IP** (for example `192.168.4.1`) for 5 seconds.
5. On your phone or laptop, connect to WiFi **`WaterBoat`**, password **`12345678`**.
6. Open the website (see [WEBSITE/README.md](WEBSITE/README.md)). 🎉

---

## 8. Calibration: teaching the sensors

Calibration means **teaching the sensor what "normal" looks like**, just like setting a kitchen scale to zero before weighing.

Keep the **Serial Monitor open (115200 baud)** while doing these.

### 🧪 pH (most important)
1. Get **RO water** (from a water purifier). Its pH is about **6.5**.
2. Dip the pH probe in it. **Wait 2 minutes.**
3. In the Serial Monitor, type **`cal`** and press Enter.
4. You'll see `pH: Saved! pH 6.50 = 2.590V`. Done! It's saved forever (even after switching off).
5. If you have a liquid with another known pH (for example a pH 7.0 buffer), type **`cal 7.0`** instead.
6. Made a mistake? Type **`reset`**.

### 👃 Gas sensor
1. Switch on the boat **in fresh air** (not over the pond, not near a kitchen).
2. Wait 1 minute. The Serial Monitor prints:
   `Put this in GasSensor.h -> #define GAS_R0_KOHM 12.34f`
3. Copy that number into `include/GasSensor.h` and upload again. Now it doesn't need to re-learn every time.

### 🟤 Turbidity
1. Dip the sensor in **clean drinking water**.
2. Look at the Serial Monitor: `Turbidity: ... Sensor V: 4.05V`.
3. Put that voltage in `include/Turbidity.h`: `#define TURB_CLEAR_V 4.05f`. Upload again.

### 🆘 Water level
1. Look at `Water Raw:` in the Serial Monitor when the sensor is **dry** → put it in `WATER_RAW_DRY`.
2. Dip it **fully** in water → put that number in `WATER_RAW_FULL`.
3. File: `include/WaterLevel.h`.

### 🌧️ Rain
1. Look at `Rain Raw:` when the plate is **dry** → `RAIN_RAW_DRY`.
2. Pour water on the plate until it's fully wet → `RAIN_RAW_WET`.
3. File: `include/RainSensor.h`.

---

## 9. What the boat says in the Serial Monitor

Every 2 seconds you'll see something like this:

```
----------------------------------------
WATER QUALITY: GOOD  (78/100)
   pH              7.21  score 100  Ideal
   Turbidity      18.40  score  65  Slightly cloudy
   Temperature    27.50  score 100  Ideal
   Gas (NH3)       3.10  score  80  Normal
Roll:    1.20  Pitch:   -0.80  Yaw:   12.40
GPS: Waiting for fix... Satellites: 4  (keep antenna under open sky)
Water Raw:  120  Level:   6.7%  Status: SAFE
Rain Raw: 4090  Intensity:   0.2%  Status: NO RAIN
[MQ-135] AO: 1.10V  Rs/R0: 3.20 |  NH3: 3.1 ppm  CO2: 402.0 ppm ...  | Pond Air: GOOD
Water Temp 1:  27.50 C  ( 81.50 F)  Status: NORMAL
Turbidity:    18.4 NTU  Sensor V: 3.95V  Status: SLIGHTLY CLOUDY
pH:  7.21  Sensor V: 2.450V  Temp: 27.5C  Status: NORMAL
Motor  Cmd: S  Speed: 180  |  Nano: ONLINE  Left:    0  Right:    0
Web: http://192.168.4.1  (1 phone connected)
```

(Your numbers will be different — this is just an example.)

---

## 10. Safety features

The boat is careful! It has **many ways to stop the motors** if something goes wrong:

| What goes wrong                                | What the boat does                    |
|-----------------------------------------------|---------------------------------------|
| Boat switches on                              | Motors are stopped first              |
| Phone stops sending commands for 1.5 s        | ESP32 stops the motors                |
| The phone disconnects from WiFi               | ESP32 stops the motors                |
| ESP32 stops talking to the Nano for 1 s       | Nano stops the motors by itself       |
| You switch tabs / lock the phone              | Website sends STOP                    |
| Water climbs the side sensor (≥ 70%)          | LCD and website shout **BOAT SINKING** |
| It starts raining                             | LCD and website warn **RAINING**      |

---

## 11. Something is not working? (Troubleshooting)

| Problem                                       | Try this                                               |
|-----------------------------------------------|--------------------------------------------------------|
| Upload stuck at `Connecting.....` (ESP32)      | Hold the **BOOT** button during upload                 |
| Nano upload says `not in sync`                | Unplug D0 wire. Or change board to `nanoatmega328`     |
| LCD light is on but no letters               | Turn the blue screw on the LCD back                    |
| `LCD: Not found`                              | Check SDA=21, SCL=22, VCC=5V                           |
| `MPU6050 not responding`                      | Check SDA/SCL wires; try address `0x69`                |
| `GPS: No data received`                       | GPS TX must go to pin 26; check power                  |
| GPS always `Waiting for fix`                  | Go outside under open sky and wait up to 5 minutes     |
| `No DS18B20 found`                            | Add the **4.7k resistor** (yellow ↔ 3.3V)              |
| `Turbidity: No signal`                        | Set the switch on the sensor board to **A**            |
| `pH: No signal`                               | Check the probe's round connector and wires            |
| Gas says `Warming up...`                      | Normal — wait 60 seconds                               |
| Website says **NANO OFFLINE**                 | Check the ESP32 ↔ Nano wires and shared GND            |
| A motor turns the wrong way                   | Set `MOTOR_LEFT_INVERT` / `MOTOR_RIGHT_INVERT` to `true` |
| Motor only hums                               | Raise `MOTOR_MIN_PWM` in `nano/MotorDriver.h`          |
| Speed above 180 feels the same                | That's the `MOTOR_MAX_SPEED 180` limit in `nano/MotorDriver.h` |
| A sensor is broken and I want to skip it      | Set its `USE_...` to `0` in `config.h`                 |
| Can't find the boat on WiFi                  | Look for `WaterBoat`, password `12345678`              |

---

## 12. Small dictionary of big words

| Word              | Simple meaning                                                  |
|-------------------|-----------------------------------------------------------------|
| **ESP32**         | A tiny computer chip with WiFi. The boat's brain.               |
| **Arduino Nano**  | A small, simple computer board. The motor helper.               |
| **Firmware**      | The program that lives inside a chip.                          |
| **PlatformIO**    | A tool inside VS Code that builds and uploads the code.         |
| **Upload / Flash**| Copying the program into the chip.                              |
| **Pin / GPIO**    | A small metal leg on the board where you connect a wire.        |
| **Sensor**        | A part that measures something (like our eyes or nose).         |
| **Analog**        | A value that can be anything in a range (like a volume knob).   |
| **ADC**           | The part of the chip that turns voltage into a number (0–4095). |
| **Voltage divider** | Two resistors that make a big voltage smaller.                |
| **I2C**           | A way for many parts to share just 2 wires (SDA and SCL).       |
| **UART / Serial** | A way for two boards to send letters to each other on 2 wires.  |
| **Baud**          | How fast they talk (for example 9600 letters-bits per second).  |
| **PWM**           | Switching power on and off very fast to control motor speed.    |
| **Calibration**   | Teaching a sensor what "normal" or "zero" is.                   |
| **pH**            | How sour (acidic) or soapy (alkaline) water is. 7 = neutral.    |
| **NTU**           | Unit for how muddy water is. Small = clear.                     |
| **ppm**           | Parts per million — how much of a gas is in the air.            |
| **Roll / Pitch / Yaw** | Tilt sideways / nose up-down / turning left-right.         |
| **Serial Monitor**| A window in VS Code where the board writes messages to you.     |
| **IP address**    | The boat's "house number" on WiFi, like `192.168.4.1`.          |
| **JSON**          | A neat way of writing data as text, like a list of labels and values. |
| **WebSocket**     | A live, always-open line between the phone and the boat.        |
| **Hotspot (AP)**  | When the boat makes its own WiFi network.                       |

---

Happy boating and keep our ocean clean! 🐟💧🚤
