import random
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

app = FastAPI(title="LeadGeo Pro API")

# Allow Next.js frontend (port 3000) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# OpenStreetMap & Nominatim configuration
OVERPASS_URLS = [
    "https://lz4.overpass-api.de/api/interpreter",   # Primary (Fastest)
    "https://overpass.kumi.systems/api/interpreter",  # Fallback 1
    "https://overpass-api.de/api/interpreter"        # Fallback 2
]
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {
    "User-Agent": "LeadGeoPro-B2BLeadGenerator/1.0 (contact: info@leadgeopro.local)"}


OSM_TAG_MAPPING = {
    # Original Broad Categories
    "Restaurants & Cafes": '"amenity"~"restaurant|cafe|fast_food"',
    "IT & Software Companies": '"office"~"it|company|telecommunication"',
    "Healthcare & Clinics": '"amenity"~"hospital|clinic|doctors|dentist|pharmacy"',

    # NEW: Split Retail and Grocery into separate broad searches
    "Retail Stores": '"shop"~"clothes|electronics|hardware|department_store|furniture|shoes"',
    "Grocery & Food": '"shop"~"supermarket|convenience|greengrocer|bakery|butcher"',

    # Specific Categories
    "Hospital": '"amenity"="hospital"',
    "Restaurant": '"amenity"="restaurant"',
    "Hotel": '"tourism"="hotel"',
    "Bank": '"amenity"="bank"',
    "Supermarket": '"shop"="supermarket"',
    "School": '"amenity"="school"',
    "Cafe": '"amenity"="cafe"',
    "Pharmacy": '"amenity"="pharmacy"',
}

# --- Request & Response Models ---


class RadiusSearchRequest(BaseModel):
    lat: float
    lon: float
    radius_km: float = 5.0
    business_type: str = "Restaurants & Cafes"


class RegionSearchRequest(BaseModel):
    province: Optional[str] = None
    district: Optional[str] = None
    city: str
    business_type: str = "Restaurants & Cafes"


class LeadItem(BaseModel):
    id: int | str
    name: str
    address: str
    contact: str
    rating: float
    lat: Optional[float] = None
    lon: Optional[float] = None


class LeadResponse(BaseModel):
    success: bool
    count: int
    leads: List[LeadItem]


# --- Helper: Query OpenStreetMap Overpass ---
async def fetch_leads_from_osm(lat: float, lon: float, radius_km: float, business_type: str) -> list[LeadItem]:
    radius_meters = int(radius_km * 1000)
    tag_selector = OSM_TAG_MAPPING.get(business_type, '"amenity"~"restaurant"')

    query = f"""
    [out:json][timeout:25];
    (
      node[{tag_selector}](around:{radius_meters},{lat},{lon});
      way[{tag_selector}](around:{radius_meters},{lat},{lon});
    );
    out center;
    """

    data = None
    last_error = None

    # Try each mirror one by one until one works
    async with httpx.AsyncClient(headers=HEADERS, timeout=30.0) as client:
        for url in OVERPASS_URLS:
            try:
                print(f"Trying Overpass mirror: {url}")
                res = await client.post(url, data={"data": query})
                # Raises an error if status is 504, 502, etc.
                res.raise_for_status()
                data = res.json()
                print("Success!")
                break  # Exit the loop because we got the data!
            except Exception as e:
                print(f"Failed on {url}: {str(e)}")
                last_error = e
                continue  # Try the next URL in the list

    # If all URLs failed, raise the error to the frontend
    if not data:
        raise HTTPException(
            status_code=502, detail=f"All Overpass servers are currently busy. Try a smaller radius. Last error: {str(last_error)}")

    leads = []
    for i, element in enumerate(data.get("elements", [])):
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        street = tags.get("addr:street", "")
        city = tags.get("addr:city", "")
        address = f"{street}, {city}".strip(", ") if (
            street or city) else "Address not specified"
        contact = tags.get("phone") or tags.get("contact:phone") or tags.get(
            "contact:mobile") or "No contact info"

        leads.append(
            LeadItem(
                id=element.get("id", i),
                name=name,
                address=address,
                contact=contact,
                rating=round(random.uniform(4.0, 5.0), 1),
                lat=element.get("lat") or element.get("center", {}).get("lat"),
                lon=element.get("lon") or element.get("center", {}).get("lon"),
            )
        )
        if len(leads) >= 100:
            break

    return leads

# --- API Endpoints ---


@app.post("/api/leads/radius", response_model=LeadResponse)
async def get_leads_by_radius(payload: RadiusSearchRequest):
    leads = await fetch_leads_from_osm(payload.lat, payload.lon, payload.radius_km, payload.business_type)
    return LeadResponse(success=True, count=len(leads), leads=leads)


@app.post("/api/leads/region", response_model=LeadResponse)
async def get_leads_by_region(payload: RegionSearchRequest):
    # Geocode city to coordinates using Nominatim
    query_parts = [payload.city]
    if payload.district:
        query_parts.append(payload.district)
    if payload.province:
        query_parts.append(payload.province)
    query_parts.append("Sri Lanka")

    query = ", ".join(query_parts)

    async with httpx.AsyncClient(headers=HEADERS, timeout=10.0) as client:
        res = await client.get(NOMINATIM_URL, params={"q": query, "format": "json", "limit": 1})
        data = res.json()
        if not data:
            raise HTTPException(
                status_code=404, detail=f"Location '{payload.city}' not found.")
        lat, lon = float(data[0]["lat"]), float(data[0]["lon"])

    leads = await fetch_leads_from_osm(lat, lon, 6.0, payload.business_type)
    return LeadResponse(success=True, count=len(leads), leads=leads)
