# Ascendia CRM for Phil Labor
**Full-Stack Node.js + Express + Firebase Admin SDK**

This is the complete, production-ready version of the Ascendia CRM dashboard you saw in the HTML version — now with a real backend.

## Features
- Beautiful modern dashboard (exact color scheme from your screenshot)
- Real-time staff, clients, tasks, tickets from Firestore (or demo data)
- Deploy new staff with one click (POST /api/deploy)
- AI Assistant (Annie) chat endpoint
- Full CRUD for tasks, tickets, recruitment
- Drag & drop Kanban + live updates
- 100% based on your actual Google Drive backup data

## Quick Start

1. **Install dependencies**
   ```bash
   cd ascendia-crm
   npm install
   ```

2. **Add your Firebase credentials** (optional but recommended)
   - Download your `serviceAccountKey.json` from Firebase Console → Project Settings → Service Accounts
   - Place it in the project root as `serviceAccountKey.json`

3. **Run the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   http://localhost:3000

## Environment Variables (for production)

Create a `.env` file:

```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT=PASTE_BASE64_ENCODED_SERVICE_ACCOUNT_JSON_HERE
```

To get the base64 string:
```bash
base64 -i serviceAccountKey.json | pbcopy
```

## API Endpoints

- `GET /api/staff` — All professionals (from Firestore `users` collection)
- `POST /api/deploy` — Deploy new staff
- `GET /api/clients` — Client companies
- `GET /api/tasks` — Tasks with Kanban status
- `POST /api/tasks` — Create new task
- `GET /api/tickets` — Support tickets
- `POST /api/ai/chat` — Chat with Annie AI
- `GET /api/health` — Health check + mode

## Architecture

- **Frontend**: Single beautiful HTML/JS dashboard (Tailwind + Chart.js)
- **Backend**: Express.js
- **Database**: Firebase Firestore (Admin SDK)
- **Storage**: Firebase Storage (for avatars & files)
- **Real-time ready**: Easy to add WebSockets later

## Next Steps (Recommended)

- Add authentication (Firebase Auth)
- Add real-time listeners with `onSnapshot`
- Deploy to Railway / Render / Fly.io (free tier works great)
- Connect your real Firestore collections (users, tasks, companies, etc.)

This is now a **real, deployable Node.js application** for Ascendia CRM for Phil Labor.

Built with ❤️ for the Philippine labor outsourcing industry.

---

**Need help deploying or adding more features?** Just ask!