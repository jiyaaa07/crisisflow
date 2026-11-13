# 🚨 CrisisFlow — AI-Powered Emergency Coordination Dashboard

CrisisFlow is an AI-powered emergency incident management and coordination dashboard designed to help organize emergency reports, assess incident severity, and support faster response planning.

It uses Google's Gemini AI to analyze incoming emergency reports and provides a centralized dashboard for incident monitoring and prioritization.

## 🎯 Problem Statement

During emergencies, information can arrive from multiple sources and may be incomplete, unstructured, or difficult to prioritize. Delays in understanding the situation can affect response coordination.

## 💡 Our Solution

CrisisFlow transforms unstructured emergency reports into structured incident information, calculates priority scores, and presents incidents through an interactive dashboard.

## ✨ Key Features

- **AI-Powered Report Analysis:** Uses Gemini AI to extract incident details from natural-language reports.
- **Incident Prioritization:** Calculates priority scores based on urgency and impact.
- **Interactive Map:** Displays incidents geographically using Leaflet and OpenStreetMap.
- **Incident Management:** Create, merge, monitor, and resolve incidents.
- **Resource Recommendations:** Suggests response resources based on incident categories and severity.
- **Persistent Data:** Stores incident information in browser local storage.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| Mapping | Leaflet, OpenStreetMap |
| Styling | CSS |
| Version Control | Git, GitHub |

## 🏗️ Project Structure

```text
crisisflow/
├── backend/
│   └── main.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## ⚙️ Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/jiyaaa07/crisisflow.git
cd crisisflow
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv google-genai pydantic
```

Create a `.env` file inside the backend folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend API documentation:

`http://localhost:8000/docs`

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL displayed in your terminal, usually:

`http://localhost:5173`

## 🔮 Future Enhancements

- Real-time emergency alerts and notifications.
- Live resource availability and dispatch tracking.
- Integration with verified emergency service data.
- Multi-user access and role-based coordination.
- More advanced incident analytics and reporting.

## ⚠️ Disclaimer

CrisisFlow is a prototype developed for demonstration and educational purposes. Its AI-generated assessments and resource recommendations require human verification and should not be used as a substitute for official emergency response systems.

## 👩‍💻 Author

**Jiya Kumar**

GitHub: [@jiyaaa07](https://github.com/jiyaaa07)

---

*Built to explore how AI can support smarter emergency coordination.*