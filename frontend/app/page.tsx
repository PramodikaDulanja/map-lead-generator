"use client";

import { useState } from "react";
import { 
  MapPin, 
  Search, 
  Download, 
  Building2, 
  Map as MapIcon, 
  ListFilter,
  RotateCcw
} from "lucide-react";

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

export default function Home() {
  // UI State
  const [searchMode, setSearchMode] = useState<"map" | "region">("map");
  
  // Form State
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
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2">
          <Building2 className="text-blue-400 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wide">LeadGeo Pro</h1>
        </div>
        <div className="text-sm font-medium text-slate-300">
          Professional Lead Generation
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        
        {/* Search Controls Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          
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
                      placeholder="Type a city to center map..." 
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
                      setDistrict(""); // Reset district when province changes
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
                    disabled={!province} // Disable if no province selected
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
                <option>Restaurants & Cafes</option>
                <option>IT & Software Companies</option>
                <option>Retail & Grocery</option>
                <option>Healthcare & Clinics</option>
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
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Generate Leads
              </button>
            </div>
          </div>
        </div>

        {/* Map and Table Area */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Map Section */}
          <div className="flex-[2] bg-slate-200 rounded-xl border border-slate-300 relative overflow-hidden flex items-center justify-center flex-col shadow-inner">
             <MapPin className="text-slate-400 w-12 h-12 mb-2" />
             <p className="text-slate-500 font-medium">Interactive Map rendering area</p>
             <p className="text-slate-400 text-sm mt-1">Leaflet.js will mount here</p>
          </div>

          {/* Results Table Section */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">Generated Leads <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-xs ml-2">0</span></h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors">
                  <Download className="w-3.5 h-3.5" /> Excel
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-md transition-colors">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
              <Building2 className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-600">No leads found yet.</p>
              <p className="text-xs text-slate-400 mt-1">Adjust your search criteria and click Generate.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}