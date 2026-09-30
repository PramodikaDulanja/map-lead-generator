"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Search, 
  Download, 
  Building2, 
  Map as MapIcon, 
  ListFilter,
  RotateCcw,
  Star,
  Navigation,
  Loader2
} from "lucide-react";

// Dynamically import the map to avoid SSR errors
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-500 font-medium">Loading interactive map...</div>
});

// Sri Lanka Province & District Data
const locationData: Record<string, string[]> = {
  "Western": ["Colombo", "Gampaha", "Kalutara"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
  "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Uva": ["Badulla", "Monaragala"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle"]
};

// Define what a Lead looks like
type Lead = {
  id: number;
  name: string;
  address: string;
  contact: string;
  rating: number;
};

export default function Home() {
  // === ALL STATE MUST BE INSIDE THIS FUNCTION ===
  
  // UI & Loading State
  const [searchMode, setSearchMode] = useState<"map" | "region">("map");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Map & Form State
  // const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]);
  // Change from [7.8731, 80.7718] to Colombo coordinates:
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [centerLocation, setCenterLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("Restaurants & Cafes");

  // Reset Function
  const handleReset = () => {
    setCenterLocation("");
    setRadius(5);
    setProvince("");
    setDistrict("");
    setCity("");
    setBusinessType("Restaurants & Cafes");
    setMapCenter([7.8731, 80.7718]);
    setLeads([]); // Clear the table
  };


// Search City Location (Nominatim API)
  const searchCityLocation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && centerLocation.trim() !== "") {
      setIsSearchingCity(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(centerLocation + ", Sri Lanka")}&limit=1`,
          {
            headers: {
              "Accept": "application/json",
              "Accept-Language": "en-US,en;q=0.9"
            }
          }
        );
        
        if (!response.ok) throw new Error("Network blocked");
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          alert("Location not found. Try a different spelling.");
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        alert("Failed to reach the map search server. Please try again in a moment.");
      } finally {
        setIsSearchingCity(false);
      }
    }
  };


// Real API Call for "Generate Leads" Button
const handleGenerate = async () => {
  // Validate Region Search
  if (searchMode === "region" && !city.trim()) {
    alert("Please enter a city name.");
    return;
  }

  setIsGenerating(true);
  
  try {
    let endpoint = "";
    let payload: any = { business_type: businessType };

    // Determine which endpoint and payload to use based on the active tab
    if (searchMode === "map") {
      endpoint = "http://127.0.0.1:8000/api/leads/radius";
      payload.lat = mapCenter[0];
      payload.lon = mapCenter[1];
      payload.radius_km = radius;
    } else {
      endpoint = "http://127.0.0.1:8000/api/leads/region";
      payload.city = city.trim();
      if (province) payload.province = province;
      if (district) payload.district = district;
    }

    // Call the FastAPI Backend
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch leads");
    }

    const data = await response.json();
    
    // Update the table with the real data
    setLeads(data.leads || []);
    
    if (data.leads.length === 0) {
      alert("No businesses found in this area. Try expanding the radius or changing the business type.");
    }
    
  } catch (error: any) {
    console.error("API Error:", error);
    alert(`Error generating leads: ${error.message}. Make sure your Python backend is running.`);
    setLeads([]);
  } finally {
    setIsGenerating(false);
  }
};

return (
    // 1. CHANGED: h-screen is now min-h-screen
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="text-blue-400 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wide">LeadGeo Pro</h1>
        </div>
        <div className="text-sm font-medium text-slate-300">
          Professional Lead Generation
        </div>
      </nav>

      {/* Main Workspace */}
      {/* 2. CHANGED: replaced overflow-hidden with overflow-auto pb-10 */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-auto max-w-7xl mx-auto w-full pb-10">
        
        {/* TOP: Search Controls Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 shrink-0">
          
          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-100 p-2 gap-2">
            <button 
              onClick={() => setSearchMode("map")}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                searchMode === "map" 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Radius Map Search
            </button>
            <button 
              onClick={() => setSearchMode("region")}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                searchMode === "region" 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              Region Dropdown Search
            </button>
          </div>

          {/* Input Fields Area */}
          <div className="p-4 flex flex-wrap items-end gap-4">
            
            {/* CONDITIONAL RENDER: Map Search Fields */}
            {searchMode === "map" && (
              <>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Center Location</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      value={centerLocation}
                      onChange={(e) => setCenterLocation(e.target.value)}
                      onKeyDown={searchCityLocation}
                      placeholder={isSearchingCity ? "Locating..." : "Type a city and press Enter..."}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Search Radius</span>
                    <span className="text-blue-600">{radius} km</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 my-3" 
                  />
                </div>
              </>
            )}

            {/* CONDITIONAL RENDER: Region Search Fields */}
            {searchMode === "region" && (
              <>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Province</label>
                  <select 
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict(""); 
                    }}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Province...</option>
                    {Object.keys(locationData).map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!province}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Select District...</option>
                    {province && locationData[province].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Balangoda" 
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ALWAYS RENDERED: Business Category & Action Buttons */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Type</label>
              <select 
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <optgroup label="Specific Categories">
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Retail Stores">Retail Stores (Clothes, Electronics, etc.)</option>
                  <option value="Grocery & Food">Grocery & Food (Markets, Bakeries, etc.)</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Bank">Bank</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Healthcare & Clinics">Healthcare & Clinics</option>
                  <option value="School">School</option>
                  <option value="IT & Software Companies">IT & Software Companies</option>
                  </optgroup>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                title="Reset Filters"
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-3 rounded-lg text-sm transition-colors shadow-sm border border-slate-200 flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isGenerating ? "Searching..." : "Generate Leads"}
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE: Conditional Map Section */}
        {searchMode === "map" && (
          <div className="w-full h-[350px] shrink-0 bg-slate-200 rounded-xl border border-slate-300 relative overflow-hidden flex items-center justify-center flex-col shadow-inner z-0">
            <MapComponent 
                radius={radius} 
                center={mapCenter} 
                setCenter={setMapCenter} 
            />
          </div>
        )}

        {/* BOTTOM: Results Table Section (Always Visible) */}
        <div className="w-full flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
          
          {/* Table Header / Action Bar */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <h2 className="font-bold text-slate-800 flex items-center">
              Generated Leads 
              <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-xs ml-2">
                {leads.length}
              </span>
            </h2>
            <div className="flex gap-2">
              <button 
                disabled={leads.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button 
                disabled={leads.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-semibold w-1/4">Business Name</th>
                  <th className="p-4 font-semibold w-1/3">Address</th>
                  <th className="p-4 font-semibold">Contact No</th>
                  <th className="p-4 font-semibold text-center">Rating</th>
                  <th className="p-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        {lead.name}
                      </td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]" title={lead.address}>
                        {lead.address}
                      </td>
                      <td className="p-4 text-slate-600">
                        {lead.contact}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium text-xs">
                          {lead.rating} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="inline-flex items-center justify-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">
                          <Navigation className="w-3.5 h-3.5" /> Show Map
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">No leads found yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Adjust your search criteria and click Generate.</p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}