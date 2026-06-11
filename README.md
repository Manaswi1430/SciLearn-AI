# SciLearn AI — Immersive Science Learning Platform

SciLearn AI is a production-grade, immersive 3D science education platform designed to provide interactive courses in Biology, Physics, and Chemistry.

---

## 🚀 Accomplishments & Features

### Phase 2: Firebase Authentication & Progress Tracking (Completed)
- **Firebase Authentication**: Implemented email/password authentication (registration with custom usernames, logins, logouts).
- **User Profile Management**: Synchronized profiles in Cloud Firestore storing registration details, custom usernames, XP points, current levels, active learning streaks, and completed items.
- **Progress Tracking Foundation**: Developed automated triggers that compute subject progress percentages (completed lessons divided by total curriculum lessons) and save them to the user profile. Completing all lessons under a topic automatically marks the topic as complete and awards bonus XP.
- **Protected Routing**: Created `<ProtectedRoute />` route guards that intercept unauthorized traffic, rendering glassmorphic loading animations and directing users to the login screen.
- **Dynamic Dashboard**: Integrated profile stats (level, XP, streak progress bars, completed lessons) and subject completion percentages directly from active Firestore sessions.

### Phase 3: Interactive 3D Learning Engine (Completed)
- **React Three Fiber Integration**: Added and configured `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`.
- **Mesh Raycasting & Click Detection**: Configured interactive pointer triggers to capture mesh selections and coordinate coordinates for floating label placement.
- **Reusable ModelViewer**: Designed a canvas viewer component featuring:
  - Responsive container resizing
  - OrbitControls constraints (restricted min/max zoom distances, orbit, pan)
  - Camera resets
  - HTML5 Fullscreen API integrations
  - Post-processing bloom effects
- **GLBLoader & Programmatic Fallback**: Built a loading system that searches `/public/models/` for `.glb` files. It includes a custom React `ErrorBoundary` that automatically generates beautiful, interactive, glassmorphic 3D fallbacks (Heart, Brain, Atom, Solar System) if the GLB file is missing on disk.
- **Fact Database**: Established a centralized glossary mapping normalized mesh nodes to titles, headliner facts, and descriptions.
- **Interactive Presenters**: Developed the `LabelPopup` (3D HTML projections) and `FactPanel` (inspector panel) to display structural highlights in real-time.

### Phase 3A: Sketchfab 3D Integration (Completed)
- **SketchfabViewer Embed**: Created a reusable component leveraging embedded Sketchfab models configured with custom iframe URL options (`ui_theme=dark`, `dnt=1`, `preload=1`, `autostart=1`). Handles connection state loading and timeout error boundaries.
- **Unified3DViewer Router**: Designed a unified bridge to easily swap between Sketchfab embeds and custom React Three Fiber loaders via config keys (`VITE_USE_R3F`).
- **Lesson Content System (`src/data/lessons.js`)**: Structured an educational database detailing overviews, key concepts, and structured facts for Biology, Physics, and Chemistry.
- **Integrated Workspace & Persistent Notes**: Built layout integrations combining the 3D player, animated fact grids, full overview segments, a persistent study notepad (saving to `localStorage`), and locked placeholders for future practice, quiz, and AI systems.

### Phase 4: Context-Aware AI Tutor (Completed)
- **Reusable AI Service (`src/services/ai.js`)**: Architected a future-ready AI coordinator. Integrates with the official Google Gemini API (via `VITE_GEMINI_API_KEY`) and falls back to a highly realistic, rule-based local simulator when no API key is set.
- **Context System**: Passes current subject, category, lesson title, lesson ID, and difficulty settings to the AI service automatically for hyper-focused answers.
- **Chat Interface & Experience**: Developed a glassmorphic chat interface featuring Framer Motion fade-ins, responsive styling, message history, typing animation indicators, and alert-based error states.
- **Quick Study Actions**: Implemented one-click action triggers that prompt the AI to instantly *Explain Topics*, *Summarize Lessons*, list *Key Facts*, deliver *Exam Tips*, *Generate Notes*, or formulate *Practice Questions*.

---

## 📚 Curriculum & Course Catalog

### 🧬 Biology
* **Human Anatomy**
  * The Heart & Circulatory System *(Beginner)*
  * The Brain & Central Nervous System *(Advanced)*
  * The Stomach & Digestive Process *(Beginner)*
  * The Lungs & Respiratory Mechanics *(Intermediate)*
* **Plant Biology**
  * Structure of Plant Cells *(Beginner)*
  * Xylem & Phloem Transport *(Intermediate)*
* **Cell Biology**
  * Mitochondria & ATP Generation *(Advanced)*
  * Mitosis vs. Meiosis Division *(Intermediate)*
* **Genetics**
  * DNA Double Helix & Base Pairing *(Beginner)*
  * Punnett Squares & Dominance *(Intermediate)*
* **Photosynthesis**
  * Photosystem I & II Light Capture *(Advanced)*
  * Calvin Cycle & Carbon Fixation *(Advanced)*
* **Digestive System**
  * Amylase, Pepsin & Lipase Enzymes *(Intermediate)*
  * Small Intestine Villi Mechanics *(Intermediate)*
* **Respiratory System**
  * Alveolar Gas Exchange *(Beginner)*
  * Oxygen Transport via Hemoglobin *(Advanced)*
* **Nervous System**
  * Neuronal Depolarization & Action Potential *(Advanced)*
  * Neurotransmitters & Synapses *(Intermediate)*

### ⚛️ Physics
* **Motion**
  * Displacement, Velocity & Acceleration *(Beginner)*
  * Deriving the Big Three Equations *(Intermediate)*
* **Force**
  * Newton's Three Laws of Motion *(Beginner)*
  * Coefficient of Friction & Drag Forces *(Intermediate)*
* **Gravity**
  * Newtonian Universal Gravitation *(Beginner)*
  * Einstein's Curved Spacetime Overview *(Advanced)*
* **Energy**
  * The Work-Energy Theorem *(Beginner)*
  * Conservation of Mechanical Energy *(Intermediate)*
* **Electricity**
  * Ohm's Law & Circuit Schematics *(Beginner)*
  * Kirchhoff's Junction & Loop Rules *(Advanced)*
* **Magnetism**
  * Lorentz Force & Wire Magnetic Fields *(Intermediate)*
  * Electromagnetic Induction & Generators *(Advanced)*
* **Waves**
  * Amplitude, Frequency & Wavelength *(Beginner)*
  * Superposition & Standing Waves *(Intermediate)*
* **Optics**
  * Snell's Law & Total Internal Reflection *(Intermediate)*
  * Double Slit Interference Experiment *(Advanced)*
* **Solar System**
  * Kepler's Laws of Planetary Motion *(Intermediate)*
  * Lifecycle of Stars: Nebula to Black Hole *(Intermediate)*

### 🧪 Chemistry
* **Atomic Structure**
  * The Bohr Model & Quantum Energy Levels *(Beginner)*
  * s, p, d, f Electron Configurations *(Intermediate)*
* **Chemical Bonding**
  * Ionic vs. Covalent Bonds *(Beginner)*
  * VSEPR Theory & Molecular Shapes *(Advanced)*
* **Chemical Reactions**
  * Law of Conservation of Mass & Balancing *(Beginner)*
  * Mole-to-Mole & Mass-to-Mass Ratios *(Intermediate)*
* **Acids and Bases**
  * Understanding pH & Strong vs Weak Acids *(Beginner)*
  * Neutralization & Titration Math *(Intermediate)*
* **Periodic Table**
  * Electronegativity, Ionization & Atomic Radius *(Intermediate)*
  * Element Groups: Alkali Metals, Halogens, & Noble Gases *(Beginner)*
* **Organic Chemistry**
  * Alkanes, Alkenes & Alkynes Nomenclature *(Intermediate)*
  * Alcohols, Ethers, Aldehydes & Ketones *(Intermediate)*
* **Electrochemistry**
  * Oxidation Numbers & Half-Reactions *(Intermediate)*
  * Anodes, Cathodes & Cell Potential *(Advanced)*

---

## 📂 Project Directory Structure

```text
public/
└── models/
    ├── biology/      # Place biology .glb files here (e.g. heart.glb, brain.glb)
    ├── physics/      # Place physics .glb files here (e.g. solar_system.glb)
    └── chemistry/    # Place chemistry .glb files here (e.g. atom.glb)

src/
├── components/
│   ├── ModelViewer/
│   │   ├── ModelViewer.jsx                 # Main 3D Canvas
│   │   ├── GLBLoader.jsx                   # GLB and Error Boundary Loader
│   │   ├── ProgrammaticInteractiveModel.jsx # Compound 3D Fallback Models
│   │   ├── LabelPopup.jsx                  # Floating 3D/HTML labels
│   │   ├── FactPanel.jsx                   # Side Inspector Panel
│   │   └── LoadingScreen.jsx               # Suspense progress loader
│   ├── Header.jsx                          # Main navbar with auth state
│   ├── ProtectedRoute.jsx                  # Auth route guard
│   ├── SketchfabViewer.jsx                 # Sketchfab iframe embedded viewer
│   └── Unified3DViewer.jsx                 # 3D Router (swaps between R3F and Sketchfab)
│
├── contexts/
│   └── AuthContext.jsx                     # Global Firebase auth session provider
│
├── data/
│   ├── curriculum.js                       # Subjects, topics, and lessons tree
│   ├── lessons.js                          # Detailed lesson study content database
│   └── modelFacts.js                       # 3D mesh facts dictionary
│
├── firebase/
│   ├── config.js                           # SDK Initializer
│   ├── auth.js                             # Auth services and error maps
│   └── firestore.js                        # User profile & progress trackers
│
├── hooks/
│   └── useModelInteraction.js              # 3D selection state manager
│
├── pages/
│   ├── Dashboard.jsx                       # User metrics and course progression
│   ├── LessonPage.jsx                      # Study guides integrated with ModelViewer
│   ├── Login.jsx                           # Login entry portal
│   ├── Register.jsx                        # Registration portal with validation
│   └── ProfilePage.jsx                     # User settings & completions index
```

---

## 🛠️ Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and populate it with your Firebase project keys:
```properties
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Console Enablement
To enable databases and logins, make sure to visit your [Firebase Console](https://console.firebase.google.com/):
- **Authentication**: Enable the **Email/Password** sign-in provider.
- **Firestore Database**: Create a Firestore Database in test mode to support user profiles.

### 4. Running Locally
Run the development server:
```bash
npm run dev
```

### 5. Compiling for Production
Compile and validate:
```bash
npm run build
```
