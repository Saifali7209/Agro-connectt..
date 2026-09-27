 # Agro Connect — Full Project (Frontend + Backend)

This project is provided in a single ZIP file, but it contains **two separate projects** inside. They are not combined into one project; they are kept together only so that you need to download and extract a single ZIP file.

Both projects need to be run **separately in two different terminals at the same time**. Only then will the complete application work properly.

```text
agro-connect-fullstack/

├── agro-connect-react/       ← Frontend (React + Vite) — runs in the browser
└── agro-connect-backend/     ← Backend (FastAPI + SQLite) — stores application data
```

## How to Run the Project

Both terminals need to remain open while using the application.

### Terminal 1 — Start the Backend First

```bash
cd agro-connect-fullstack/agro-connect-backend

pip install -r requirements.txt

python seed.py

uvicorn app.main:app --reload
```

Wait until you see the following in the terminal:

```text
Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal **open and running** while using the application.

The `python seed.py` command provides 4 ready-made login accounts.
The password for all accounts is:

```text
Password123
```

Available accounts:

* `farmer@example.com`
* `buyer@example.com`
* `expert@example.com`
* `admin@example.com`

### Terminal 2 — Start the Frontend

Open a **new and separate terminal window** and run:

```bash
cd agro-connect-fullstack/agro-connect-react

npm install

npm run dev
```

When you see:

```text
Local: http://localhost:5173/
```

open that URL in your browser.

## Important Notes

* **Do not close the backend terminal** while you are using the application.
* If the backend stops running, the frontend may continue to open, but login, registration, and other data-related features may show a **"Unable to connect to server"** error.
* If this happens, simply start the backend again. You do **not** need to repeat the complete setup.
* Each project also has its own README file with additional details:

  * `agro-connect-react/README.md`
  * `agro-connect-backend/README.md`
* The backend README contains more detailed information about the backend setup.
