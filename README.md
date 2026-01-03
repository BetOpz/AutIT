# Autism-Friendly Daily Challenges App

A simple, high-contrast, visual daily challenges application designed specifically for neurodivergent users (autism-friendly). Features bold visuals, clear interaction flows, extreme simplicity, **real-time cloud sync**, and **AI-generated custom icons**.

## Features

### User Mode (Challenge Completion)
- **Large, clear challenge display** with emoji or AI-generated icons (250x250px minimum)
- **Timer system** with START/STOP functionality
- **Visual feedback** with celebratory fireworks animation on completion
- **Progress tracking** showing current challenge and overall progress
- **Summary screen** displaying all completed challenges with times
- **Best time highlighting** to celebrate achievements
- **Real-time sync** across all your devices

### Admin Panel (Management Mode)
- **Add challenges** with custom text and choice of emoji or AI-generated icons
- **AI Icon Generation** - Create custom, realistic icons using FLUX AI model
- **Edit challenges** - modify text and change icons
- **Delete challenges** with confirmation dialog
- **Reorder challenges** using up/down arrows
- **Import/Export** functionality for backup and restore
- **Character counter** (100 character limit for clarity)
- **Real-time cloud sync** - changes appear instantly on all devices

### Cloud Sync (Firebase Realtime Database)
- **Automatic synchronization** across all your devices
- **Real-time updates** - changes made on one device appear instantly on others
- **Offline support** - app works offline with LocalStorage fallback
- **Sync status indicator** - always know your sync status (✓ Synced, 🔄 Syncing, ⚠️ Error, 📱 Local Only)
- **Conflict-free** - Firebase ensures data consistency

### AI Icon Generation (Replicate FLUX)
- **Custom AI-generated icons** for each challenge
- **Simple, clear illustrations** optimized for autism-friendly design
- **High contrast, bold visuals** - automatically generated
- **Instant preview** - see your icon before saving
- **Regenerate option** - don't like it? Generate a new one
- **Fallback to emoji** - always have the emoji option available

## Design Principles

### Autism-Friendly Features
- ✓ High contrast colors (white background, bold accent colors)
- ✓ Large, bold text (minimum 24px for challenges)
- ✓ Generous spacing between elements (40px padding)
- ✓ Clear, simple language
- ✓ No flashing (except celebratory fireworks)
- ✓ Touch-friendly buttons (minimum 60px height)
- ✓ Visual icons for immediate recognition
- ✓ Predictable interaction patterns

### Accessibility
- High contrast throughout
- Large touch targets (60px+ buttons)
- Clear focus states
- No hover-only interactions
- Reduced motion support
- Screen reader friendly

## Tech Stack

- **React 18** with TypeScript for type safety
- **Firebase Realtime Database** for cloud sync and real-time updates
- **Replicate FLUX** for AI-generated custom icons
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **LocalStorage** for offline support and caching
- **Mobile-first** responsive design

## Getting Started

### Prerequisites

1. **Firebase Project** (for cloud sync):
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Realtime Database
   - Copy your config credentials

2. **Replicate API Key** (for AI icon generation):
   - Sign up at [Replicate](https://replicate.com/)
   - Get your API token from account settings

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_DATABASE_URL=your_database_url_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Replicate API Configuration
VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
```

See `.env.example` for a template.

**Note:** The app will work without these credentials, but will use LocalStorage only (no cloud sync or AI icons).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Usage

### First Launch
The app comes with 5 sample challenges ready to use:
1. Make your bed 🛏️
2. Drink a glass of water 💧
3. Do 5 push-ups 💪
4. Take deep breaths for 1 minute 🧘
5. Organize your desk 📚

### Completing Challenges
1. Click **START** to begin the timer
2. Complete the challenge
3. Click **DONE** when finished
4. Enjoy the celebration! 🎉
5. Click **NEXT CHALLENGE** to continue
6. After all challenges, view your summary with times and best performance

### Managing Challenges (Admin Panel)
1. Click **⚙️ Admin** button in top-right corner
2. **Add new challenges**:
   - Enter challenge text (max 100 characters)
   - Choose icon type:
     - **Emoji**: Select from 30 pre-made emoji icons
     - **AI Generated**: Click "Generate AI Icon" to create custom illustration
   - Click Add Challenge
3. **Generate AI Icons**:
   - Enter your challenge text first
   - Switch to "AI Generated" tab
   - Click "🎨 Generate AI Icon"
   - Wait 10-30 seconds for generation
   - Preview the generated icon
   - Click "🔄 Regenerate" if you want a different version
   - Or switch back to emoji if needed
4. **Edit challenges**: Click Edit button, modify text/icon, and Save
5. **Reorder**: Use ↑ ↓ buttons to change order
6. **Delete**: Click 🗑️ and confirm
7. **Backup**: Click Export Data to download JSON file
8. **Restore**: Click Import Data to restore from backup

### Sync Status Indicator
Watch the sync status in the top-right corner:
- **✓ Synced** - All changes saved to cloud
- **🔄 Syncing...** - Currently saving changes
- **⚠️ Sync Error** - Connection issue, will retry
- **📱 Local Only** - No Firebase configured, using LocalStorage only

## Data Storage

Data is stored using a **hybrid approach**:

### With Firebase (Recommended)
- **Cloud sync** - Data automatically syncs across all your devices in real-time
- **Offline support** - Works offline, syncs when connection returns
- **LocalStorage cache** - Fast local access with cloud backup
- **No account required** - Just configure Firebase and go
- **Persistent** - Data never lost, even if you clear browser cache

### Without Firebase (LocalStorage Only)
- **Local only** - Data stored in browser's LocalStorage
- **No internet needed** - Works completely offline
- **Device-specific** - Data doesn't sync between devices
- **Backup/restore** - Manual export/import via JSON files

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Mobile Support

Optimized for mobile devices:
- Works on screens as small as 375px width
- Touch-friendly interactions
- Tablet optimized (common for neurodivergent users)
- No hover states required

## Customization

The app uses Tailwind CSS with custom theme colors:
- **Primary**: Bright blue (#2563eb)
- **Success**: Bright green (#10b981)
- **Warning**: Bright orange (#f59e0b)
- **Danger**: Bright red (#ef4444)

Modify `tailwind.config.js` to change colors or add new themes.

## File Structure

```
AutIT/
├── src/
│   ├── components/
│   │   ├── UserMode.tsx       # Challenge completion interface
│   │   ├── AdminPanel.tsx     # Management interface
│   │   └── Fireworks.tsx      # Celebration animation
│   ├── utils/
│   │   └── storage.ts         # LocalStorage utilities
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind config
├── vite.config.ts             # Vite config
└── README.md                  # This file
```

## Development Notes

- Uses React hooks for state management
- TypeScript for type safety
- No external dependencies beyond React and Tailwind
- Fully client-side - can be deployed to any static hosting
- Production-ready with error handling

## Deployment

Deploy to any static hosting service:

**Netlify / Vercel:**
```bash
npm run build
# Upload dist/ folder
```

**GitHub Pages:**
```bash
npm run build
# Copy dist/ contents to gh-pages branch
```

**Local Server:**
```bash
npm run build
npx serve dist
```

## Future Enhancements (Optional)

- Custom themes (dark mode, different color schemes)
- Sound effects for completion (toggle on/off)
- Statistics dashboard (weekly/monthly trends)
- Challenge categories/tags
- Multi-user support (profiles)
- Cloud sync (optional, maintains local-first approach)

## License

MIT License - Feel free to use and modify for personal or commercial projects.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Made with ❤️ for neurodivergent users**
