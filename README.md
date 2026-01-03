# Autism-Friendly Daily Challenges App

A simple, high-contrast, visual daily challenges application designed specifically for neurodivergent users (autism-friendly). Features bold visuals, clear interaction flows, and extreme simplicity.

## Features

### User Mode (Challenge Completion)
- **Large, clear challenge display** with emoji icons (250x250px minimum)
- **Timer system** with START/STOP functionality
- **Visual feedback** with celebratory fireworks animation on completion
- **Progress tracking** showing current challenge and overall progress
- **Summary screen** displaying all completed challenges with times
- **Best time highlighting** to celebrate achievements

### Admin Panel (Management Mode)
- **Add challenges** with custom text and emoji icons
- **Edit challenges** - modify text and change icons
- **Delete challenges** with confirmation dialog
- **Reorder challenges** using up/down arrows
- **Import/Export** functionality for backup and restore
- **Character counter** (100 character limit for clarity)

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
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **LocalStorage** for data persistence (no backend needed)
- **Mobile-first** responsive design

## Getting Started

### Installation

```bash
npm install
```

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
2. **Add new challenges**: Enter text, choose emoji icon, click Add
3. **Edit challenges**: Click Edit button, modify, and Save
4. **Reorder**: Use ↑ ↓ buttons to change order
5. **Delete**: Click 🗑️ and confirm
6. **Backup**: Click Export Data to download JSON file
7. **Restore**: Click Import Data to restore from backup

## Data Storage

All data is stored locally in your browser's LocalStorage:
- No account required
- No internet connection needed (after first load)
- Data persists between sessions
- Easy backup/restore via JSON export/import

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
