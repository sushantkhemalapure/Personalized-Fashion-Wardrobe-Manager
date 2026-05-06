# Personalized Fashion Wardrobe Manager

A stylish personalized wardrobe manager. It includes authentication, an animated home page, closet organization, saved wardrobe pieces, an outfit board, local wardrobe uploads, care reminders, and rule-based outfit planning for occasions and weather.

## Features

- Long fashion home page with looping background videos
- Scroll animations and 3D-style wardrobe cards
- Separate hash-based pages/views
- Responsive closet catalog layout
- Wardrobe item search and category filters
- Weather and occasion match scoring
- Saved pieces and outfit board stored locally
- Wardrobe care reminders for ironing, washing, polishing, and storage
- Liquid-glass and 3D hover UI system
- Wardrobe inventory grid with category filters
- Upload and manage clothing items in `localStorage`
- Signup and login page
- JSON-file user database with salted password hashes
- Occasion-based outfit planner
- Weather planner with live Open-Meteo current conditions
- Daily outfit planner timeline
- Clickable daily planner detail pages with images
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
- Node.js `http`, `fs`, and `crypto` modules
- JSON file database
- Browser `localStorage`

## Pages

The app uses hash-based routing:

- `#home` - animated fashion home page
- `#wardrobe` - wardrobe inventory and upload manager
- `#closet` - closet catalog with saved pieces and outfit board actions
- `#saved` - saved wardrobe pieces
- `#outfits` - outfit board summary
- `#care` - wardrobe care guide
- `#planner` - live weather and rule-based outfit planner
- `#suggestions` - feature overview
- `#profile` - daily planner timeline
- `#day-client-presentation` - daily planner detail page
- `#day-strategy-session` - daily planner detail page
- `#day-executive-networking` - daily planner detail page

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
        ClosetSection.jsx
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

Wardrobe planning features are handled in the frontend:

- Closet sample data is defined in `frontend/src/components/ClosetSection.jsx`
- Saved wardrobe pieces are stored in browser `localStorage`
- Outfit board items are stored in browser `localStorage`
- Weather planner uses browser location and Open-Meteo current conditions for hot, cold, and rainy outfit rules
- Care guide tracks readiness, fabric notes, and simple maintenance reminders

The outfit planner is rule-based only. It does not use AI.

Current weather rules:

- Hot: T-shirt and shorts
- Cold: jacket and jeans
- Rainy: hoodie and boots

Occasion options:

- Casual
- Office
- Party

Wardrobe uploads, saved looks, saved pieces, and outfit board items are stored in browser `localStorage`.

## API Routes

```text
POST /api/signup
POST /api/login
GET  /api/me
```

## Database

The app does not use MySQL, MongoDB, or SQLite. It uses a JSON file:

```text
backend/data/users.json
```

This file stores:

- Users
- Salted password hashes
- Login sessions

## Demo Accounts

The database includes demo users:

```text
maya.demo@example.com
rohan.demo@example.com
ananya.demo@example.com
```

Demo password:

```text
Demo@123
```

## Notes

- The real app entry file is `frontend/index.html`.
- Do not open `index.html` directly from the filesystem. Use the local server URL.
- Internet is required for CDN libraries, Google Fonts, background videos, Unsplash images, and live weather.
