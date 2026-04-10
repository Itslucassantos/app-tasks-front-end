# app-tasks-front-end

A **habit and task tracking** mobile application built with **React Native + Expo**. Users can create recurring tasks, mark them as complete, track their completion streaks, browse their full task library, and manage their profile — all synced with a REST API backend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Screens & Navigation](#screens--navigation)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Types](#types)
- [Design System](#design-system)

---

## Features

- **Authentication** — Login and registration with password strength validation
- **Persistent sessions** — Token and user data stored locally via AsyncStorage
- **Dashboard** — View today's tasks with infinite-scroll, toggle completion, add, edit, and delete tasks
- **Streak tracking** — Visual fire icon + streak counter to motivate daily use
- **Progress bar** — Real-time percentage of completed vs. total tasks for the day
- **Task Library** — Browse all tasks filtered by frequency (Daily, Weekly, Monthly, Yearly) with search and pagination
- **Profile management** — Update your full name and upload a profile avatar from the photo library
- **Optimistic UI** — Task completion toggles update the UI immediately with automatic rollback on failure

---

## Tech Stack

| Technology                                                                                    | Version  | Role                          |
| --------------------------------------------------------------------------------------------- | -------- | ----------------------------- |
| [Expo](https://expo.dev)                                                                      | ~55.0.6  | Core SDK and toolchain        |
| [React Native](https://reactnative.dev)                                                       | 0.83.2   | Mobile UI framework           |
| [Expo Router](https://docs.expo.dev/router/introduction)                                      | ~55.0.5  | File-based navigation         |
| [React](https://react.dev)                                                                    | 19.2.0   | UI library                    |
| [TypeScript](https://www.typescriptlang.org)                                                  | ~5.9.2   | Static typing (strict mode)   |
| [Axios](https://axios-http.com)                                                               | ^1.13.6  | HTTP client with interceptors |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage)                    | 2.2.0    | Persistent key-value storage  |
| [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker)                    | ~55.0.17 | Avatar photo selection        |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)                 | 4.2.1    | Animations                    |
| [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) | ~5.6.2   | Safe area insets              |

---

## Project Structure

```
app-tasks-front-end/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (wraps AuthProvider)
│   ├── index.tsx                 # Auth gate (redirects to login or dashboard)
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Registration screen
│   └── (authenticated)/          # Protected route group
│       ├── _layout.tsx           # Tab navigator with custom tab bar
│       ├── dashboard.tsx         # Main task screen
│       ├── library.tsx           # Task library by frequency
│       ├── profile.tsx           # User profile management
│       └── _components/          # Feature-specific components
│           ├── Card.tsx          # Task card (dashboard)
│           ├── FormTaskModal.tsx # Create/edit task modal
│           ├── LibraryCard.tsx   # Task card (library, read-only)
│           └── Menu.tsx          # Custom bottom tab bar
├── components/                   # Shared UI components
│   ├── Button.tsx                # Themed button with loading state
│   └── Input.tsx                 # Labeled text input wrapper
├── config/
│   └── api.config.ts             # Base URL and timeout settings
├── constants/
│   └── theme.ts                  # Design tokens (colors, spacing, etc.)
├── contexts/
│   └── AuthContext.tsx           # Auth state, signIn, signOut, updateUser
├── services/
│   └── api.ts                    # Axios instance with auth interceptors
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── assets/                       # App icons, splash screen, fonts
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9+ or **yarn** — comes with Node.js
- **Expo CLI** — installed globally or used via `npx`
- **Git** — [git-scm.com](https://git-scm.com)
- A physical device or emulator:
  - **iOS Simulator** (macOS only, requires Xcode)
  - **Android Emulator** (requires Android Studio)
  - **Expo Go** app on a physical device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

> **Note:** This app requires a running backend API. Make sure the backend server is running and reachable from your device/emulator before starting the app.

---

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd app-tasks-front-end
```

2. **Install dependencies:**

```bash
npm install
```

---

## Configuration

Before running the app, update the API base URL to point to your backend server.

Open `config/api.config.ts` and replace the IP address with your own machine's local network IP:

```ts
// config/api.config.ts
export const API_CONFIG = {
  BASE_URL: "http://<YOUR_LOCAL_IP>:3000", // e.g. http://192.168.1.10:3000
  TIMEOUT: 15000,
};
```

> **How to find your local IP:**
>
> - **Windows:** Run `ipconfig` in a terminal and look for the IPv4 address under your active network adapter.
> - **macOS/Linux:** Run `ifconfig` or `ip addr` and look for `inet` under your Wi-Fi interface.
>
> If you are using an Android Emulator, you can use `http://10.0.2.2:3000` to reach your host machine's localhost.

---

## Running the App

Start the Expo development server:

```bash
npx expo start
```

This opens the Expo Dev Tools in your browser. From there:

| Target               | How to run                                          |
| -------------------- | --------------------------------------------------- |
| **Physical device**  | Scan the QR code with the Expo Go app               |
| **iOS Simulator**    | Press `i` in the terminal (macOS only)              |
| **Android Emulator** | Press `a` in the terminal (requires Android Studio) |
| **Web browser**      | Press `w` in the terminal                           |

### Additional Scripts

```bash
# Run on Android directly
npx expo start --android

# Run on iOS directly (macOS only)
npx expo start --ios

# Run in web browser
npx expo start --web

# Clear Metro bundler cache (useful when encountering stale module errors)
npx expo start --clear

# Build production APK / IPA (requires Expo account)
npx eas build
```

---

## Screens & Navigation

The app uses **Expo Router** for file-based navigation with a `(authenticated)` route group to separate protected screens from public ones.

### Navigation Flow

```
/ (index)
├── /login            ← unauthenticated users are redirected here
├── /register
└── /(authenticated)  ← only accessible after login
    ├── /dashboard    (default tab)
    ├── /library
    └── /profile
```

The root `index.tsx` acts as an **auth gate**: it reads the auth state from `AuthContext` and redirects immediately — authenticated users go to `/dashboard`, unauthenticated users go to `/login`.

### Screen Reference

#### `/login`

- Email + password form
- On success: stores token + user in AsyncStorage and navigates to Dashboard
- Link to the registration screen

#### `/register`

- Full name, email, password, confirm password
- Client-side password validation: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one special character
- On success: navigates to Login

#### `/(authenticated)/dashboard`

- Displays today's date, day of the week, and the user's streak count (fire icon)
- Progress bar showing completed vs. total tasks
- Infinite-scroll `FlatList` of tasks (loads more on scroll)
- FAB (`+` button) to create a new task via `FormTaskModal`
- Each task card supports: toggle complete (optimistic), edit, delete

#### `/(authenticated)/library`

- Splits all tasks into four frequency sections: **Daily**, **Weekly**, **Monthly**, **Yearly**
- Each section has a **debounced search** field and **page-by-page pagination** (4 items per page)
- Data refreshes automatically when the tab receives focus (`useFocusEffect`)

#### `/(authenticated)/profile`

- Shows user initials avatar or uploaded image
- **Change Avatar**: opens the device photo library; uploads via `multipart/form-data` to `/users/avatar`; cache-busts the URL after upload
- **Edit Name**: inline text input + save via PATCH `/users/:id`
- **Sign Out**: clears token and user from AsyncStorage

---

## Architecture Overview

### Authentication Flow

```
App launch
  └── AuthContext.loadStorageData()
        ├── Token found → restore user, attach Bearer header → dashboard
        └── No token   → redirect to /login

Login
  └── POST /auth → receive { token, ...user }
        └── Store in AsyncStorage → set axios default header → update state

401 Response (any request)
  └── Axios response interceptor → remove token from AsyncStorage
```

### Axios Interceptors (`services/api.ts`)

- **Request interceptor:** Reads the token from `AsyncStorage` and injects `Authorization: Bearer <token>` on every request automatically — no per-call auth logic needed.
- **Response interceptor:** On `401 Unauthorized`, removes the stored token to force re-authentication.

### State Management

State is managed with React Context only (`AuthContext`). No external state library is used. Component-level state (`useState` + `useRef`) handles UI concerns like pagination, search, and loading flags.

### Key Patterns

| Pattern                          | Description                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Optimistic UI**                | `handleToggleComplete` in Dashboard updates the local task list immediately, then rolls back if the API call fails                  |
| **`isFetching` ref guard**       | A `useRef` boolean prevents concurrent fetch calls during infinite scroll — avoids stale closure issues that `useState` would cause |
| **`useFocusEffect`**             | Library screen refetches data whenever the tab gains focus, keeping content fresh without full remounts                             |
| **Platform-aware avatar upload** | Uses `Blob` + `fetch` on web, native URI on iOS/Android to handle the file differently per platform                                 |
| **Route group protection**       | The `(authenticated)` folder in Expo Router groups all protected routes; the index gate handles the actual redirect                 |

---

## API Reference

The app communicates with a REST backend. The base URL is configured in `config/api.config.ts`.

### Authentication

| Method | Endpoint | Body                            | Description                  |
| ------ | -------- | ------------------------------- | ---------------------------- |
| `POST` | `/auth`  | `{ email, password }`           | Login — returns user + token |
| `POST` | `/users` | `{ fullName, email, password }` | Register a new user          |

### Users

| Method  | Endpoint                | Body / Params                | Description                    |
| ------- | ----------------------- | ---------------------------- | ------------------------------ |
| `PATCH` | `/users/:id`            | `{ fullName }`               | Update the user's display name |
| `POST`  | `/users/avatar`         | `FormData` with `file` field | Upload a new avatar image      |
| `GET`   | `/users/streak/:userId` | —                            | Get the user's current streak  |

### Tasks

| Method   | Endpoint          | Query Params / Body                           | Description                         |
| -------- | ----------------- | --------------------------------------------- | ----------------------------------- |
| `GET`    | `/tasks`          | `limit`, `offset`, `status`, `frequency`, `q` | Fetch tasks (paginated, filterable) |
| `POST`   | `/tasks`          | `{ title, category, frequency }`              | Create a new task                   |
| `PATCH`  | `/tasks/:id`      | `{ title, category, frequency }`              | Update an existing task             |
| `DELETE` | `/tasks/:id`      | —                                             | Delete a task                       |
| `POST`   | `/tasks/complete` | `{ taskId }`                                  | Toggle task completion              |

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <token>
```

This is injected automatically by the Axios request interceptor — no manual setup needed per request.

---

## Types

Defined in `types/index.ts`:

```ts
type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse extends User {
  token: string;
}

interface UserStreakResponse {
  streak: number;
  lastStreakAt: Date | null;
}

interface Task {
  id: string;
  title: string;
  category: string | null;
  frequency: Frequency;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
```

---

## Design System

Centralized design tokens are exported from `constants/theme.ts` and used throughout all screens and components — no inline magic numbers.

| Token Group    | Examples                                                          |
| -------------- | ----------------------------------------------------------------- |
| `colors`       | `green` (primary action), `background`, `text`, `border`, `white` |
| `spacing`      | Consistent margin/padding scale                                   |
| `borderRadius` | Rounded corners scale                                             |
| `fontSize`     | Typography scale                                                  |

---

## License

See [LICENSE](LICENSE) for details.
