"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, Search, Download, Building2, Map as MapIcon, 
  ListFilter, RotateCcw, Star, Navigation, Loader2, 
  FileText, Globe, Briefcase, MessageCircle,
  X, ExternalLink, Phone, Target, Sparkles, Activity, Zap
} from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'react-hot-toast';

// Dynamically import the map to avoid SSR errors
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-emerald-500/70 font-medium space-y-4 bg-zinc-950">
      <div className="relative flex justify-center items-center">
        <div className="absolute w-12 h-12 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
        <div className="w-8 h-8 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin z-10"></div>
      </div>
      <p className="animate-pulse tracking-widest text-xs uppercase">Establishing Satellite Link...</p>
    </div>
  )
});

// --- Dynamic Map Network Background Component ---
const DynamicMapNetwork = () => {
  const [routes, setRoutes] = useState<{id: number, x1: number, y1: number, x2: number, y2: number, active: boolean}[]>([]);

  useEffect(() => {
    // Generate random map coordinate nodes
    const nodes = Array.from({ length: 30 }).map(() => ({
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    }));

    // Connect nodes to simulate map roads
    const initialRoutes = [];
    for (let i = 0; i < 45; i++) {
      const n1 = nodes[Math.floor(Math.random() * nodes.length)];
      const n2 = nodes[Math.floor(Math.random() * nodes.length)];
      initialRoutes.push({ id: i, x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y, active: false });
    }
    setRoutes(initialRoutes);

    // Animate map roads lighting up like live traffic data every 2 seconds
    const interval = setInterval(() => {
      setRoutes(prev => prev.map(route => ({
        ...route,
        active: Math.random() > 0.75 // 25% chance for a route to light up
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-zinc-950 overflow-hidden">
      {/* Ambient Radial Map Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-zinc-950 to-zinc-950"></div>
      
      {/* Dynamic Animated Map Roads (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {routes.map((route) => (
          <line
            key={route.id}
            x1={`${route.x1}%`} y1={`${route.y1}%`}
            x2={`${route.x2}%`} y2={`${route.y2}%`}
            stroke={route.active ? "#10b981" : "#042f2e"} 
            strokeWidth={route.active ? "2" : "0.5"}
            className="transition-all duration-[1500ms] ease-in-out"
            filter={route.active ? "url(#neon-glow)" : ""}
          />
        ))}
        {routes.map((route) => (
          <circle
            key={`node-${route.id}`}
            cx={`${route.x1}%`} cy={`${route.y1}%`}
            r={route.active ? "3" : "1.5"}
            fill={route.active ? "#34d399" : "#022c22"}
            className="transition-all duration-[1500ms] ease-in-out"
          />
        ))}
      </svg>

      {/* Cyber Radar Sweep Overlay */}
      <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,rgba(16,185,129,0.06)_100%)] animate-[spin_10s_linear_infinite] rounded-full"></div>
    </div>
  );
};

// --- Complete Sri Lanka Geographical Data ---
const sriLankaLocations: Record<string, Record<string, string[]>> = {
  "Western": { "Colombo": ["Colombo 01", "Colombo 02", "Colombo 03", "Colombo 04", "Colombo 05", "Colombo 06", "Colombo 07", "Colombo 08", "Dehiwala", "Mount Lavinia", "Moratuwa", "Maharagama", "Nugegoda", "Homagama", "Kottawa", "Battaramulla", "Avissawella", "Padukka", "Hanwella", "Kotte"], "Gampaha": ["Gampaha", "Negombo", "Kelaniya", "Kadawatha", "Ja-Ela", "Wattala", "Minuwangoda", "Nittambuwa", "Veyangoda", "Peliyagoda", "Katunayake", "Ragama", "Kandana"], "Kalutara": ["Kalutara", "Panadura", "Horana", "Beruwala", "Matugama", "Bandaragama", "Wadduwa", "Aluthgama", "Agalawatta", "Ingiriya"] },
  "Central": { "Kandy": ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya", "Katugastota", "Kadugannawa", "Wattegama", "Akurana", "Kundasale", "Digana", "Gelioya"], "Matale": ["Matale", "Dambulla", "Sigiriya", "Galewela", "Ukuwela", "Rattota", "Naula"], "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Nanu Oya", "Norwood", "Dickoya", "Kotagala", "Dayagama"] },
  "Southern": { "Galle": ["Galle", "Ambalangoda", "Hikkaduwa", "Elpitiya", "Karapitiya", "Baddegama", "Ahangama", "Batapola", "Koggala", "Habaraduwa"], "Matara": ["Matara", "Weligama", "Dikwella", "Akuressa", "Deniyaya", "Kamburupitiya", "Hakmana", "Morawaka"], "Hambantota": ["Hambantota", "Tangalle", "Tissamaharama", "Beliatta", "Ambalantota", "Walasmulla", "Middeniya", "Katuwana"] },
  "Sabaragamuwa": { "Ratnapura": ["Ratnapura", "Balangoda", "Pelmadulla", "Embilipitiya", "Rakwana", "Kuruwita", "Eheliyagoda", "Kahawatta", "Godakawela", "Opanayake"], "Kegalle": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana", "Ruwanwella", "Yatiyantota", "Deraniyagala", "Galigamuwa", "Dehiowita"] },
  "North Western": { "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Polgahawela", "Narammala", "Pannala", "Wariyapola", "Giriulla", "Mawathagama", "Alawwa", "Ibbagamuwa"], "Puttalam": ["Puttalam", "Chilaw", "Wennappuwa", "Nattandiya", "Dankotuwa", "Marawila", "Madampe", "Anamaduwa"] },
  "North Central": { "Anuradhapura": ["Anuradhapura", "Kekirawa", "Tambuttegama", "Medawachchiya", "Eppawala", "Galenbindunuwewa", "Mihintale", "Nochchiyagama", "Talawa", "Padaviya"], "Polonnaruwa": ["Polonnaruwa", "Kaduruwela", "Medirigiriya", "Hingurakgoda", "Welikanda", "Dimbulagala", "Bakamuna"] },
  "Uva": { "Badulla": ["Badulla", "Bandarawela", "Haputale", "Welimada", "Mahiyanganaya", "Passara", "Hali-Ela", "Diyatalawa", "Ella", "Haldummulla"], "Monaragala": ["Monaragala", "Bibile", "Wellawaya", "Kataragama", "Buttala", "Medagama", "Siyambalanduwa"] },
  "Eastern": { "Trincomalee": ["Trincomalee", "Kinniya", "Muttur", "Kantalai", "Nilaveli", "Gomarankadawala", "Kuchchaveli"], "Batticaloa": ["Batticaloa", "Kattankudy", "Eravur", "Valachchenai", "Kalkudah", "Vakarai", "Kaluwanchikudy"], "Ampara": ["Ampara", "Kalmunai", "Sammanthurai", "Akkaraipattu", "Pottuvil", "Sainthamaruthu", "Maha Oya", "Dehiattakandiya", "Nintavur"] },
  "Northern": { "Jaffna": ["Jaffna", "Point Pedro", "Chavakachcheri", "Nallur", "Kankesanthurai", "Karainagar", "Velanai", "Chunnakam", "Kopay"], "Kilinochchi": ["Kilinochchi", "Pooneryn", "Pallai", "Karachchi", "Kandavalai"], "Mannar": ["Mannar", "Murunkan", "Pesalai", "Nanaddan", "Madhu"], "Vavuniya": ["Vavuniya", "Nedunkeni", "Cheddikulam", "Vengalacheddikulam"], "Mullaitivu": ["Mullaitivu", "Puthukkudiyiruppu", "Oddusuddan", "Mankulam", "Thunukkai"] }
};

type Lead = {
  id: number; name: string; address: string; contact: string; rating: number;
  lat?: number; lon?: number; google_maps_url?: string; website?: string; linkedin?: string; isEnriching?: boolean;
};

export default function Home() {
  const [searchMode, setSearchMode] = useState<"map" | "region">("map");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [centerLocation, setCenterLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [businessType, setBusinessType] = useState("Restaurants & Cafes");
  const [province, setProvince] = useState("Sabaragamuwa");
  const [district, setDistrict] = useState("Ratnapura");
  const [city, setCity] = useState("Balangoda");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value; setProvince(selectedProvince);
    const firstDistrict = Object.keys(sriLankaLocations[selectedProvince])[0]; setDistrict(firstDistrict);
    setCity(sriLankaLocations[selectedProvince][firstDistrict][0]);
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value; setDistrict(selectedDistrict);
    setCity(sriLankaLocations[province][selectedDistrict][0]);
  };
  const handleReset = () => {
    setCenterLocation(""); setRadius(5); setProvince("Sabaragamuwa"); setDistrict("Ratnapura"); setCity("Balangoda");
    setBusinessType("Restaurants & Cafes"); setMapCenter([6.9271, 79.8612]); setLeads([]);
  };

  const searchCityLocation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && centerLocation.trim() !== "") {
      setIsSearchingCity(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/geocode?q=${encodeURIComponent(centerLocation + ", Sri Lanka")}`);
        if (!response.ok) throw new Error("Location not found");
        const data = await response.json();
        if (data && data.lat && data.lon) { setMapCenter([data.lat, data.lon]); toast.success("Coordinates Locked."); }
      } catch (error) { toast.error("Location invalid. Scanning failed."); } 
      finally { setIsSearchingCity(false); }
    }
  };

  const handleGenerate = async () => {
    if (searchMode === "region" && !city.trim()) return toast.error("Target city required."); 
    setIsGenerating(true); 
    try {
      let endpoint = searchMode === "map" ? "http://127.0.0.1:8000/api/leads/radius" : "http://127.0.0.1:8000/api/leads/region";
      let payload: any = { business_type: businessType };
      if (searchMode === "map") { payload.lat = mapCenter[0]; payload.lon = mapCenter[1]; payload.radius_km = radius; } 
      else { payload.city = city.trim(); if (province) payload.province = province; if (district) payload.district = district; }

      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || "Extraction failed"); }
      const data = await response.json();
      setLeads(data.leads || []);
      if (data.leads && data.leads.length > 0) toast.success(`Extraction Complete: ${data.leads.length} targets acquired.`);
      else toast.error("Zero targets detected in this sector.");
    } catch (error: any) { toast.error(error.message || "Uplink failed. Check backend connection."); } 
    finally { setIsGenerating(false); }
  };

  const handleEnrichLead = async (leadId: number, name: string, address: string) => {
    setLeads(current => current.map(l => l.id === leadId ? { ...l, isEnriching: true } : l));
    try {
      const locationParts = address.split(",");
      let searchLocation = locationParts[locationParts.length - 1].trim();
      if (searchLocation.includes("Address missing")) searchLocation = city; 

      const response = await fetch(`http://127.0.0.1:8000/api/enrich?name=${encodeURIComponent(name)}&location=${encodeURIComponent(searchLocation)}`);
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || "Enrichment failed"); }
      const enrichedData = await response.json();

      setLeads(current => current.map(l => l.id === leadId ? { ...l, website: enrichedData.website, linkedin: enrichedData.linkedin, isEnriching: false } : l));
      toast.success(`${name} profile enriched.`);
    } catch (error: any) {
      toast.error(`Neural search failed for ${name}`);
      setLeads(current => current.map(l => l.id === leadId ? { ...l, isEnriching: false } : l));
    }
  };

  const getSearchDescription = () => searchMode === "map" ? `${centerLocation || "Map Coordinates"} (${radius}km Radius)` : [city, district, province].filter(Boolean).join(", ");

  const exportToExcel = () => { /* Same logic */
    if (leads.length === 0) return toast("No data available for export.");
    const wsData = [ ["LeadGeo Pro - Target Export"], [`Sector:`, businessType], [`Zone:`, getSearchDescription()], [`Timestamp:`, new Date().toLocaleString()], [`Count:`, leads.length], [], ["Business Name", "Address", "Contact No", "Rating", "Google Maps Link"], ...leads.map(lead => [lead.name, lead.address, lead.contact, lead.rating, lead.google_maps_url || "N/A"]) ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData); worksheet['!cols'] = [{ wch: 35 }, { wch: 55 }, { wch: 18 }, { wch: 10 }, { wch: 50 }];
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `LeadGeo_Targets_${businessType.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToPDF = () => { /* Same logic */
    if (leads.length === 0) return toast("No data available for export.");
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(16, 185, 129); doc.text(`LeadGeo Pro`, 14, 20); // Emerald color
    doc.setFontSize(12); doc.setTextColor(82, 82, 91); doc.text(`Sector: ${businessType}`, 14, 28);
    doc.setFontSize(10); doc.setTextColor(113, 113, 122); doc.text(`Zone: ${getSearchDescription()}`, 14, 38); doc.text(`Timestamp: ${new Date().toLocaleString()}`, 14, 44); doc.text(`Targets: ${leads.length}`, 14, 50);
    autoTable(doc, { head: [["Business Name", "Address", "Contact No", "Rating"]], body: leads.map(l => [l.name, l.address, l.contact, l.rating.toString()]), startY: 55, styles: { fontSize: 9, cellPadding: 4, fillColor: [24, 24, 27], textColor: [228, 228, 231] }, headStyles: { fillColor: [16, 185, 129], textColor: [9, 9, 11] }, alternateRowStyles: { fillColor: [39, 39, 42] } });
    doc.save(`LeadGeo_Targets_${businessType.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 relative selection:bg-emerald-500/30">
      
      {/* Dynamic Background Animation */}
      <DynamicMapNetwork />
      
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, className: 'text-sm font-bold !bg-zinc-900 !text-emerald-400 !border !border-emerald-900/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' }} />
      
      {/* Cyber Navbar */}
      <nav className="sticky top-0 z-40 bg-zinc-950/60 backdrop-blur-xl border-b border-emerald-900/40 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Activity className="text-emerald-400 w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 uppercase">
            LeadGeo <span className="font-light">Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 rounded-full border border-emerald-900/50 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-ping" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Uplink Active</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full pb-10 relative z-10">
        
        {/* Command Interface (Search Controls) */}
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-emerald-900/30 p-2 shrink-0">
          
          {/* Toggle Tabs */}
          <div className="flex bg-zinc-950/50 p-1.5 rounded-xl gap-2 mb-2 border border-zinc-800/50">
            <button 
              onClick={() => setSearchMode("map")}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                searchMode === "map" 
                  ? "bg-emerald-600 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.01]" 
                  : "text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800/50"
              }`}
            >
              <MapIcon className="w-4 h-4" /> Radar Sweep
            </button>
            <button 
              onClick={() => setSearchMode("region")}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                searchMode === "region" 
                  ? "bg-emerald-600 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.01]" 
                  : "text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800/50"
              }`}
            >
              <Target className="w-4 h-4" /> Sector Scan
            </button>
          </div>

          <div className="p-4 flex flex-wrap items-end gap-5">
            {searchMode === "map" && (
              <>
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">Coordinates / City</label>
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-3 text-emerald-500/50 w-4 h-4 group-focus-within:text-emerald-400 transition-colors" />
                    <input 
                      type="text" value={centerLocation} onChange={(e) => setCenterLocation(e.target.value)} onKeyDown={searchCityLocation}
                      placeholder={isSearchingCity ? "Triangulating..." : "Enter location & press Enter"}
                      className="w-full bg-zinc-950/80 border border-zinc-800 text-emerald-50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2 flex justify-between">
                    <span>Scan Radius</span>
                    <span className="text-emerald-400 font-extrabold shadow-emerald-500 drop-shadow-md">{radius} km</span>
                  </label>
                  <input 
                    type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 my-4" 
                  />
                </div>
              </>
            )}

            {searchMode === "region" && (
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Province', 'District', 'City'].map((label, idx) => (
                  <div key={label}>
                    <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">{label}</label>
                    <select 
                      value={idx === 0 ? province : idx === 1 ? district : city} 
                      onChange={idx === 0 ? handleProvinceChange : idx === 1 ? handleDistrictChange : (e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 text-emerald-50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      {idx === 0 && Object.keys(sriLankaLocations).map(p => <option key={p} value={p}>{p} Province</option>)}
                      {idx === 1 && Object.keys(sriLankaLocations[province] || {}).map(d => <option key={d} value={d}>{d} District</option>)}
                      {idx === 2 && (sriLankaLocations[province]?.[district] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">Target Profile</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full bg-zinc-950/80 border border-zinc-800 text-emerald-50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer">
                <optgroup label="Sectors">
                  <option value="IT & Software Companies">IT & Software</option>
                  <option value="Healthcare & Clinics">Healthcare</option>
                  <option value="Restaurants & Cafes">Food & Beverage</option>
                  <option value="Retail Stores">Retail</option>
                  <option value="Grocery & Food">Grocery</option>
                  <option value="Hotel">Hospitality</option>
                  <option value="Bank">Finance</option>
                  <option value="School">Education</option>
                </optgroup>
              </select>
            </div>

            <div className="flex gap-3 mt-4 lg:mt-0">
              <button onClick={handleReset} title="Clear Coordinates" className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-900/50 rounded-xl transition-all shadow-sm active:scale-95">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleGenerate} disabled={isGenerating}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black tracking-widest uppercase py-2.5 px-6 rounded-xl text-[11px] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Zap className="w-4 h-4" />}
                {isGenerating ? "Extracting..." : "Execute Scan"}
              </button>
            </div>
          </div>
        </div>

        {searchMode === "map" && (
          <div className="w-full h-[380px] shrink-0 bg-zinc-950 rounded-2xl border border-emerald-900/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col z-0">
            <MapComponent radius={radius} center={mapCenter} setCenter={setMapCenter} leads={leads} />
          </div>
        )}
        
        {/* Data Grid Section */}
        <div className="w-full flex-1 bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-emerald-900/30 shadow-2xl flex flex-col overflow-hidden min-h-[400px]">
          
          <div className="p-5 border-b border-zinc-800/80 flex flex-wrap justify-between items-center bg-zinc-950/40 shrink-0 gap-4">
            <h2 className="font-bold text-emerald-50 flex items-center gap-2 text-lg uppercase tracking-wider">
              <Target className="w-5 h-5 text-emerald-500" />
              Acquired Targets
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-black ml-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                {leads.length} MATCHES
              </span>
            </h2>
            <div className="flex gap-3">
              <button onClick={exportToPDF} className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 text-rose-400 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-900 hover:border-rose-900/50 transition-all active:scale-95">
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button onClick={exportToExcel} className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 text-emerald-400 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-900 hover:border-emerald-900/50 transition-all active:scale-95">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>
              
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-emerald-500/70 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest w-1/4">Entity Name</th>
                  <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest w-1/4">Location Data</th>
                  <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Comm Link</th>
                  <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-center">Data Enrichment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                
                {isGenerating ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="bg-zinc-900/20">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 animate-pulse shrink-0 border border-zinc-700/50"></div>
                        <div className="h-4 bg-zinc-800 animate-pulse rounded w-40"></div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-800 animate-pulse rounded w-full max-w-[200px]"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-800 animate-pulse rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-zinc-800 animate-pulse rounded-md w-16 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-zinc-800 animate-pulse rounded-xl w-32 mx-auto"></div></td>
                    </tr>
                  ))
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-emerald-900/10 transition-colors group cursor-default">
                      <td className="px-6 py-4 font-semibold text-emerald-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-emerald-900/50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <button onClick={() => setSelectedLead(lead)} className="text-left font-bold text-zinc-200 hover:text-emerald-400 transition-colors truncate max-w-[200px]" title="Inspect Data">
                          {lead.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-medium truncate max-w-[220px]" title={lead.address}>
                        {lead.address}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">
                        {lead.contact}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 px-2.5 py-1 rounded-md font-bold text-xs">
                          {lead.rating} <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        {lead.google_maps_url && (
                          <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition-colors border border-transparent hover:border-emerald-900/50" title="Satellite View">
                            <Navigation className="w-4 h-4" />
                          </a>
                        )}

                        {(() => {
                          const digits = (lead.contact || "").replace(/\D/g, "");
                          let waNum = null;
                          if (digits.startsWith("07") && digits.length === 10) waNum = "94" + digits.substring(1);
                          else if (digits.startsWith("947") && digits.length === 11) waNum = digits;
                          
                          if (waNum) return (
                            <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name} team,`)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition-colors border border-transparent hover:border-emerald-900/50" title="Direct Comms">
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          );
                          return null;
                        })()}
                        
                        <div className="w-px h-6 bg-zinc-800 mx-1"></div>

                        {lead.website || lead.linkedin ? (
                          <div className="flex gap-1.5">
                            {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 bg-zinc-950 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/20 rounded-lg transition-all" title="Web Profile"><Globe className="w-4 h-4" /></a>}
                            {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 bg-zinc-950 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/20 rounded-lg transition-all" title="Corporate Network"><Briefcase className="w-4 h-4" /></a>}
                          </div>
                        ) : (
                          <button onClick={() => handleEnrichLead(lead.id, lead.name, lead.address)} disabled={lead.isEnriching} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 group">
                            {lead.isEnriching ? <span className="animate-pulse">Mining...</span> : <><Search className="w-3.5 h-3.5 group-hover:animate-ping" /> AI Mine</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute inset-2 rounded-full border border-emerald-500/40 animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="relative w-full h-full bg-zinc-950 rounded-full flex items-center justify-center border border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                           <Activity className="w-8 h-8 text-emerald-500/50" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Awaiting Parameters</p>
                      <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">Input coordinates or sector to initialize data extraction.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Cyberpunk Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] border border-emerald-900/50 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header Banner */}
            <div className="absolute top-0 left-0 w-full h-28 bg-[linear-gradient(45deg,rgba(16,185,129,0.1)_25%,transparent_25%,transparent_50%,rgba(16,185,129,0.1)_50%,rgba(16,185,129,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] border-b border-emerald-900/50 z-0 opacity-20" />
            <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-emerald-900/40 to-transparent z-0" />

            <div className="relative z-10 pt-8 px-8 pb-6 flex flex-col items-center text-center mt-10">
              <div className="w-20 h-20 bg-zinc-950 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/30 flex items-center justify-center absolute -top-20 left-1/2 -translate-x-1/2">
                 <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute -top-16 right-4 text-zinc-500 hover:text-emerald-400 bg-zinc-950 border border-zinc-800 hover:border-emerald-900/50 p-2 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="text-2xl font-black text-emerald-50 leading-tight mt-2 uppercase tracking-wide">{selectedLead.name}</h3>
              <div className="flex items-center gap-1.5 mt-3 bg-emerald-950/50 px-4 py-1.5 rounded-full border border-emerald-900/50">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Target Rating: {selectedLead.rating}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-4 bg-zinc-950/50 relative z-10 border-t border-zinc-800/50">
              
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-900/50 transition-colors">
                <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-emerald-500 shrink-0"><MapPin className="w-4 h-4" /></div>
                <div className="text-left w-full">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Physical Sector</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1 leading-snug">{selectedLead.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-900/50 transition-colors">
                <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-emerald-500 shrink-0"><Phone className="w-4 h-4" /></div>
                <div className="text-left w-full">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Comm Frequency</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1">{selectedLead.contact}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-emerald-500"><Globe className="w-4 h-4" /></div>
                  <div className="text-left w-full">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Web Link</p>
                    {selectedLead.website ? (
                      <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 truncate w-full block">Access <ExternalLink className="w-3 h-3" /></a>
                    ) : <p className="text-xs text-zinc-600 mt-1 font-medium italic">Unreachable</p>}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-emerald-500"><Briefcase className="w-4 h-4" /></div>
                  <div className="text-left w-full">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Network</p>
                    {selectedLead.linkedin ? (
                      <a href={selectedLead.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 truncate w-full block">Profile <ExternalLink className="w-3 h-3" /></a>
                    ) : <p className="text-xs text-zinc-600 mt-1 font-medium italic">Unreachable</p>}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between z-10 relative">
              {selectedLead.google_maps_url ? (
                <a href={selectedLead.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 border border-emerald-900/50 px-4 py-3 rounded-xl transition-colors">
                  <Navigation className="w-4 h-4" /> Geo-Locate
                </a>
              ) : <div />}
              <button onClick={() => setSelectedLead(null)} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all shadow-md active:scale-95">
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}

      </div>
    </div>
  );
}