# 📍 Geospatial B2B Lead Generator

A full-stack, map-based web application designed to help sales teams and marketers find highly targeted local businesses within custom geographic boundaries. Users can search for a city, draw a custom radius on an interactive map, instantly fetch local business details, and export the leads to PDF or Excel.

Built with a 100% free, open-source mapping stack (No Google Cloud billing required).

## ✨ Features

* **Interactive Map UI:** Pan, zoom, and visually explore areas using Leaflet and OpenStreetMap tiles.
* **Smart City Search:** Instantly jump the map to any city using the Nominatim Geocoding API.
* **Custom Radius Selection:** Click anywhere on the map to drop an anchor and adjust a dynamic search radius using a slider.
* **Automated Data Fetching:** Queries the Overpass API to extract businesses (names, types, phone numbers, websites, and addresses).
* **Instant Export:** Download the generated lead list as a formatted `.pdf` or `.xlsx` file for immediate sales outreach.

## 🛠️ Tech Stack

**Frontend**
* [Next.js (App Router)](https://nextjs.org/) - React framework
* [TypeScript](https://www.typescriptlang.org/) - Type safety
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
* [React Leaflet](https://react-leaflet.js.org/) - Interactive map components
* [Lucide React](https://lucide.dev/) - UI Icons

**Backend & Data**
* [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework
* [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) - OpenStreetMap querying
* [Nominatim API](https://nominatim.org/) - Geocoding and search

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v18+)
* Python (3.9+)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/map-lead-generator.git](https://github.com/yourusername/map-lead-generator.git)
cd map-lead-generator


## Getting Started

First, run the development server:

```bash
npm run dev

```



```bash
cd backend
python -m venv venv

# Activate on Windows:
venv\Scripts\activate
# Activate on Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```