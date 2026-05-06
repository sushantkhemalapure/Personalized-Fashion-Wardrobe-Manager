# Personalized Fashion Wardrobe Manager

A cinematic single-page landing web app for a personalized fashion wardrobe manager. It helps users organize clothes, save wardrobe items locally, and get rule-based outfit suggestions based on occasion and weather.

## Features

- Full-screen fashion landing page with looping background videos
- Liquid-glass and 3D hover UI system
- Draggable wardrobe carousel
- Upload and manage clothing items in `localStorage`
- Signup and login page
- JSON-file user database with salted password hashes
- Occasion-based outfit planner
- Weather-based outfit filtering
- Live weather support using Open-Meteo
- Daily outfit planner timeline
- Framer Motion scroll and entrance animations
- CDN-only React setup, no build step required

## Tech Stack

- HTML
- CSS
- JavaScript
- React 18 CDN
- ReactDOM CDN
- Babel Standalone CDN
- Tailwind CSS CDN
- Framer Motion CDN
- Node.js static server

## Project Structure

```text
Personalized-Fashion-Wardrobe-Manager/
  package.json
  package-lock.json
  server.js
  start.bat
  README.md
  backend/
    data/
      users.json
  frontend/
    index.html
    src/
      App.jsx
      components/
        AuthPage.jsx
        DailyPlanner.jsx
        FadingVideo.jsx
        FeaturesSection.jsx
        Footer.jsx
        HeroSection.jsx
        Navbar.jsx
        OutfitPlanner.jsx
        WardrobeCarousel.jsx
      styles/
        global.css
```

## How To Run

Open PowerShell or Command Prompt in the project root:

```powershell
cd C:\Users\admin\Desktop\Hackthon\Personalized-Fashion-Wardrobe-Manager
```

Run the app:

```powershell
npm.cmd start
```

Or run directly with Node:

```powershell
node server.js
```

Or use the Windows launcher:

```powershell
.\start.bat
```

Then open:

```text
http://localhost:5173
```

If port `5173` is already busy, the server will automatically try the next port, such as:

```text
http://localhost:5174
```

## PowerShell Note

If `npm start` shows this error:

```text
npm.ps1 cannot be loaded because running scripts is disabled
```

Use this instead:

```powershell
npm.cmd start
```

This avoids changing your Windows execution policy.

## App Logic

Signup and login are handled by the Node server:

- `POST /api/signup`
- `POST /api/login`
- `GET /api/me`

User records are stored in:

```text
backend/data/users.json
```

Passwords are stored as salted hashes, not plain text.

The outfit planner is rule-based only. It does not use AI.

Current weather rules:

- Hot: T-shirt and shorts
- Cold: jacket and jeans
- Rainy: hoodie and boots

Occasion options:

- Casual
- Office
- Party

Wardrobe uploads and saved looks are stored in browser `localStorage`.

## Notes

- The real app entry file is `frontend/index.html`.
- Do not open `index.html` directly from the filesystem. Use the local server URL.
- Internet is required for CDN libraries, Google Fonts, background videos, Unsplash images, and live weather.
