# Agro Connect — Full Project (Frontend + Backend)

Ye ek hi zip mein hai, lekin andar **do alag projects** hain — ye combine
isliye nahi kiye ki ek hi cheez ban jaaye, balki sirf isliye ki tumhe ek hi
baar download/extract karna pade. Dono ko **alag-alag terminal** mein,
**ek saath** chalana hoga — tabhi app poora kaam karega.

```
agro-connect-fullstack/
├── agro-connect-react/      ← Frontend (React + Vite) — browser mein khulta hai
└── agro-connect-backend/    ← Backend (FastAPI + SQLite) — data yahan save hota hai
```

## Chalane ka tareeka (dono terminal khulne chahiye)

### Terminal 1 — Backend pehle chalao

```
cd agro-connect-fullstack/agro-connect-backend
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

Jab tak terminal mein `Uvicorn running on http://127.0.0.1:8000` na dikhe,
tab tak wait karo. Ye terminal **khula rehna chahiye**.

`python seed.py` se 4 ready-made login mil jaate hain (sab ka password
`Password123`):
- farmer@example.com
- buyer@example.com
- expert@example.com
- admin@example.com

### Terminal 2 — Ab frontend chalao (naya/alag terminal window)

```
cd agro-connect-fullstack/agro-connect-react
npm install
npm run dev
```

Jab `Local: http://localhost:5173/` dikhe, browser mein wahi URL kholo.

## Zaroori baat

- Backend ka terminal **band mat karna** jab tak app use kar rahe ho.
- Agar backend band ho jaaye, frontend chalta rahega but login/register/data
  wapas "server se connect nahi ho paya" wala error dega — bas backend
  terminal dubara start kar dena, koi setup dobara nahi karna padega.
- Har project ke apne README/detail hain: `agro-connect-react/README.md`
  aur `agro-connect-backend/README.md` (backend wala zyada detailed hai).
