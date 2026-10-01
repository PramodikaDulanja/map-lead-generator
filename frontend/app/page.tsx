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
  Loader2,
  FileText,
  Globe, 
  Briefcase,
  MessageCircle,
} from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'react-hot-toast';

// Dynamically import the map to avoid SSR errors
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-500 font-medium">Loading interactive map...</div>
});



// --- Complete Sri Lanka Geographical Data (9 Provinces, 25 Districts) ---
const sriLankaLocations: Record<string, Record<string, string[]>> = {
  "Western": {
    "Colombo": ["Colombo 01", "Colombo 02", "Colombo 03", "Colombo 04", "Colombo 05", "Colombo 06", "Colombo 07", "Colombo 08", "Dehiwala", "Mount Lavinia", "Moratuwa", "Maharagama", "Nugegoda", "Homagama", "Kottawa", "Battaramulla", "Avissawella", "Padukka", "Hanwella", "Kotte"],
    "Gampaha": ["Gampaha", "Negombo", "Kelaniya", "Kadawatha", "Ja-Ela", "Wattala", "Minuwangoda", "Nittambuwa", "Veyangoda", "Peliyagoda", "Katunayake", "Ragama", "Kandana"],
    "Kalutara": ["Kalutara", "Panadura", "Horana", "Beruwala", "Matugama", "Bandaragama", "Wadduwa", "Aluthgama", "Agalawatta", "Ingiriya"]
  },
  "Central": {
    "Kandy": ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya", "Katugastota", "Kadugannawa", "Wattegama", "Akurana", "Kundasale", "Digana", "Gelioya"],
    "Matale": ["Matale", "Dambulla", "Sigiriya", "Galewela", "Ukuwela", "Rattota", "Naula"],
    "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Nanu Oya", "Norwood", "Dickoya", "Kotagala", "Dayagama"]
  },
  "Southern": {
    "Galle": ["Galle", "Ambalangoda", "Hikkaduwa", "Elpitiya", "Karapitiya", "Baddegama", "Ahangama", "Batapola", "Koggala", "Habaraduwa"],
    "Matara": ["Matara", "Weligama", "Dikwella", "Akuressa", "Deniyaya", "Kamburupitiya", "Hakmana", "Morawaka"],
    "Hambantota": ["Hambantota", "Tangalle", "Tissamaharama", "Beliatta", "Ambalantota", "Walasmulla", "Middeniya", "Katuwana"]
  },
  "Sabaragamuwa": {
    "Ratnapura": ["Ratnapura", "Balangoda", "Pelmadulla", "Embilipitiya", "Rakwana", "Kuruwita", "Eheliyagoda", "Kahawatta", "Godakawela", "Opanayake"],
    "Kegalle": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana", "Ruwanwella", "Yatiyantota", "Deraniyagala", "Galigamuwa", "Dehiowita"]
  },
  "North Western": {
    "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Polgahawela", "Narammala", "Pannala", "Wariyapola", "Giriulla", "Mawathagama", "Alawwa", "Ibbagamuwa"],
    "Puttalam": ["Puttalam", "Chilaw", "Wennappuwa", "Nattandiya", "Dankotuwa", "Marawila", "Madampe", "Anamaduwa"]
  },
  "North Central": {
    "Anuradhapura": ["Anuradhapura", "Kekirawa", "Tambuttegama", "Medawachchiya", "Eppawala", "Galenbindunuwewa", "Mihintale", "Nochchiyagama", "Talawa", "Padaviya"],
    "Polonnaruwa": ["Polonnaruwa", "Kaduruwela", "Medirigiriya", "Hingurakgoda", "Welikanda", "Dimbulagala", "Bakamuna"]
  },
  "Uva": {
    "Badulla": ["Badulla", "Bandarawela", "Haputale", "Welimada", "Mahiyanganaya", "Passara", "Hali-Ela", "Diyatalawa", "Ella", "Haldummulla"],
    "Monaragala": ["Monaragala", "Bibile", "Wellawaya", "Kataragama", "Buttala", "Medagama", "Siyambalanduwa"]
  },
  "Eastern": {
    "Trincomalee": ["Trincomalee", "Kinniya", "Muttur", "Kantalai", "Nilaveli", "Gomarankadawala", "Kuchchaveli"],
    "Batticaloa": ["Batticaloa", "Kattankudy", "Eravur", "Valachchenai", "Kalkudah", "Vakarai", "Kaluwanchikudy"],
    "Ampara": ["Ampara", "Kalmunai", "Sammanthurai", "Akkaraipattu", "Pottuvil", "Sainthamaruthu", "Maha Oya", "Dehiattakandiya", "Nintavur"]
  },
  "Northern": {
    "Jaffna": ["Jaffna", "Point Pedro", "Chavakachcheri", "Nallur", "Kankesanthurai", "Karainagar", "Velanai", "Chunnakam", "Kopay"],
    "Kilinochchi": ["Kilinochchi", "Pooneryn", "Pallai", "Karachchi", "Kandavalai"],
    "Mannar": ["Mannar", "Murunkan", "Pesalai", "Nanaddan", "Madhu"],
    "Vavuniya": ["Vavuniya", "Nedunkeni", "Cheddikulam", "Vengalacheddikulam"],
    "Mullaitivu": ["Mullaitivu", "Puthukkudiyiruppu", "Oddusuddan", "Mankulam", "Thunukkai"]
  }
};

// Define what a Lead looks like
type Lead = {
  id: number;
  name: string;
  address: string;
  contact: string;
  rating: number;
  lat?: number;             
  lon?: number;             
  google_maps_url?: string; 
  website?: string;
  linkedin?: string;
  isEnriching?: boolean;
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
  // const [province, setProvince] = useState("");
  // const [district, setDistrict] = useState("");
  // const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("Restaurants & Cafes");
  const [province, setProvince] = useState("Sabaragamuwa");
  const [district, setDistrict] = useState("Ratnapura");
  const [city, setCity] = useState("Balangoda");

  


  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value;
    setProvince(selectedProvince);
    
    // Automatically select the first district and city of the new province
    const firstDistrict = Object.keys(sriLankaLocations[selectedProvince])[0];
    setDistrict(firstDistrict);
    setCity(sriLankaLocations[selectedProvince][firstDistrict][0]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    
    // Automatically select the first city of the new district
    setCity(sriLankaLocations[province][selectedDistrict][0]);
  };


  // Reset Function
  const handleReset = () => {
    setCenterLocation("");
    setRadius(5);
    setProvince("Sabaragamuwa");
    setDistrict("Ratnapura");
    setCity("Balangoda");
    setBusinessType("Restaurants & Cafes");
    setMapCenter([7.8731, 80.7718]);
    setLeads([]); // Clear the table
  };


// Search City Location (Now routed through our Python Backend Proxy!)
const searchCityLocation = async (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter" && centerLocation.trim() !== "") {
    setIsSearchingCity(true);
    try {
      // Call our own FastAPI backend instead of the public API directly
      const response = await fetch(
        `http://127.0.0.1:8000/api/geocode?q=${encodeURIComponent(centerLocation + ", Sri Lanka")}`
      );
      
      if (!response.ok) {
        throw new Error("Location not found");
      }
      
      const data = await response.json();
      
      if (data && data.lat && data.lon) {
        setMapCenter([data.lat, data.lon]);
        toast.success("Location found!");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Could not find that location. Try a different spelling.");
    } finally {
      setIsSearchingCity(false);
    }
  }
};




// Real API Call for "Generate Leads" Button
  const handleGenerate = async () => {
    // Validate Region Search
    if (searchMode === "region" && !city.trim()) {
      toast.error("Please select a city."); // Upgraded from alert()
      return;
    }

    setIsGenerating(true); // Turns ON the Skeleton Loader
    
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

      // Make the API call to your FastAPI backend
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data.leads || []);

      // Trigger beautiful Toast notifications instead of alerts
      if (data.leads && data.leads.length > 0) {
        toast.success(`Successfully found ${data.leads.length} leads!`);
      } else {
        toast.error("No businesses found in this area.");
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate leads. Is the backend running?");
    } finally {
      setIsGenerating(false); // Turns OFF the Skeleton Loader
    }
  };

// --- AI Lead Enrichment ---
  const handleEnrichLead = async (leadId: number, name: string, address: string) => {
    // Set this specific lead to "loading"
    setLeads(currentLeads => 
      currentLeads.map(l => l.id === leadId ? { ...l, isEnriching: true } : l)
    );

    try {
      const locationParts = address.split(",");
      let searchLocation = locationParts[locationParts.length - 1].trim();

      // FIXED: If the address is missing, just use the city they searched for!
      if (searchLocation.includes("Address missing")) {
        searchLocation = city; 
      }

      const response = await fetch(`http://127.0.0.1:8000/api/enrich?name=${encodeURIComponent(name)}&location=${encodeURIComponent(searchLocation)}`);
      
      if (!response.ok) {
        // FIXED: Extract the actual Python error message so we can see it in the Toast
        const errorData = await response.json();
        throw new Error(errorData.detail || "Enrichment failed");
      }
      
      const enrichedData = await response.json();

      // Update the specific lead in the table with the new links
      setLeads(currentLeads => 
        currentLeads.map(l => l.id === leadId ? { 
          ...l, 
          website: enrichedData.website, 
          linkedin: enrichedData.linkedin,
          isEnriching: false 
        } : l)
      );
      
      toast.success(`${name} enriched successfully!`);

    } catch (error: any) {
      console.error(error);
      // FIXED: Display the exact error message in the red popup
      toast.error(error.message || `Failed to enrich ${name}`);
      
      setLeads(currentLeads => 
        currentLeads.map(l => l.id === leadId ? { ...l, isEnriching: false } : l)
      );
    }
  };



// --- Helper to figure out what location to print on the documents ---
  const getSearchDescription = () => {
    if (searchMode === "map") {
      return `${centerLocation || "Map Coordinates"} (${radius}km Radius)`;
    } else {
      return [city, district, province].filter(Boolean).join(", ");
    }
  };

  // --- Professional Export to Excel ---
  const exportToExcel = () => {
    if (leads.length === 0) {
      toast("No leads to export. Please generate leads first.");
      return;
    }
    
    const searchDesc = getSearchDescription();
    const timestamp = new Date().toLocaleString();

    // Create an Array of Arrays so we can add custom title rows at the top
    const wsData = [
      ["LeadGeo Pro - B2B Lead Export"],
      [`Category:`, businessType],
      [`Target Area:`, searchDesc],
      [`Generated On:`, timestamp],
      [`Total Leads:`, leads.length],
      [], // Empty row for spacing
      // Table Headers
      ["Business Name", "Address", "Contact No", "Rating", "Google Maps Link"],
      // Data Rows
      ...leads.map(lead => [
        lead.name, 
        lead.address, 
        lead.contact, 
        lead.rating, 
        lead.google_maps_url || "N/A"
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-size the columns so the text isn't cut off
    worksheet['!cols'] = [
      { wch: 35 }, // Name
      { wch: 55 }, // Address
      { wch: 18 }, // Contact
      { wch: 10 }, // Rating
      { wch: 50 }  // Maps Link
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
    XLSX.writeFile(workbook, `LeadGeo_Pro_${businessType.replace(/\s+/g, '_')}.xlsx`);
  };

  // --- Professional Export to PDF ---
  const exportToPDF = () => {
    if (leads.length === 0) {
      toast("No leads to export. Please generate leads first.");
      return;
    }

    const doc = new jsPDF();
    const searchDesc = getSearchDescription();
    const timestamp = new Date().toLocaleString();
    
    // Add Professional Header Text
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Dark Slate
    doc.text(`LeadGeo Pro`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); 
    doc.text(`Business Leads: ${businessType}`, 14, 28);

    // Add Search Metadata (Location, Time, Count)
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Target Area: ${searchDesc}`, 14, 38);
    doc.text(`Generated: ${timestamp}`, 14, 44);
    doc.text(`Total Records: ${leads.length}`, 14, 50);

    // Prepare table data
    const tableColumn = ["Business Name", "Address", "Contact No", "Rating"];
    const tableRows = leads.map(lead => [
      lead.name,
      lead.address,
      lead.contact,
      lead.rating.toString()
    ]);

    // Draw the styled table further down the page (startY: 55)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }, 
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 }
      }
    });
    
    doc.save(`LeadGeo_Pro_${businessType.replace(/\s+/g, '_')}.pdf`);
  };




return (
    // 1. CHANGED: h-screen is now min-h-screen
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, className: 'text-sm font-medium text-slate-800' }} />
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

          {searchMode === "region" && (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-center shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-slate-800">Target Specific Region</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Province Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Province</label>
                    <select 
                      value={province} 
                      onChange={handleProvinceChange}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {Object.keys(sriLankaLocations).map((prov) => (
                        <option key={prov} value={prov}>{prov} Province</option>
                      ))}
                    </select>
                  </div>

        {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                  <select 
                    value={district} 
                    onChange={handleDistrictChange}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {/* FIXED: Added || {} to prevent crashes if province is out of sync */}
                    {Object.keys(sriLankaLocations[province] || {}).map((dist) => (
                      <option key={dist} value={dist}>{dist} District</option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City / Town</label>
                  <select 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {/* FIXED: Added optional chaining and || [] to prevent crashes */}
                    {(sriLankaLocations[province]?.[district] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                </div>
              </div>
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
                leads={leads}
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
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-rose-500" /> Export PDF
            </button>

            <button 
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Export Excel
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
                
                {/* STATE 1: SKELETON LOADER (Shows while fetching) */}
                {isGenerating ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse bg-white">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-200 shrink-0"></div>
                        <div className="h-4 bg-slate-200 rounded w-40"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-slate-200 rounded w-full max-w-[250px]"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-slate-200 rounded-md w-16 mx-auto"></div>
                      </td>
                      <td className="p-4">
                        <div className="h-8 bg-slate-200 rounded-md w-28 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : 
                
                /* STATE 2: REAL DATA (Shows when fetching is done) */
                leads.length > 0 ? (
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
                      <td className="p-4 text-center flex items-center justify-center gap-2">
                        
                        {/* 1. Google Maps Button */}
                        {lead.google_maps_url ? (
                          <a 
                            href={lead.google_maps_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                            title="Open Map"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Map
                          </a>
                        ) : (
                          <button disabled className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md cursor-not-allowed">
                            <Navigation className="w-3.5 h-3.5" /> No Map
                          </button>
                        )}

                        {/* 2. NEW: Smart WhatsApp Button (Only shows for valid Mobile Numbers) */}
                        {(() => {
                          const digits = (lead.contact || "").replace(/\D/g, ""); // Extract only numbers
                          let waNum = null;
                          
                          // Check for Sri Lankan mobile formats (07X or 947X) to filter out landlines
                          if (digits.startsWith("07") && digits.length === 10) {
                            waNum = "94" + digits.substring(1);
                          } else if (digits.startsWith("947") && digits.length === 11) {
                            waNum = digits;
                          }
                          
                          if (waNum) {
                            // Pre-drafted outreach message
                            const msg = encodeURIComponent(`Hi ${lead.name} team, I noticed your business in our recent search and wanted to connect!`);
                            return (
                              <a 
                                href={`https://wa.me/${waNum}?text=${msg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Chat
                              </a>
                            );
                          }
                          return null; // Don't render anything if it's a landline or missing
                        })()}

                        
                        {/* 3. Enrichment Results or Button */}
                              {lead.website || lead.linkedin ? (
                                <div className="flex gap-1">
                                  {lead.website && (
                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Visit Website">
                                      <Globe className="w-4 h-4" />
                                    </a>
                                  )}
                                  {lead.linkedin && (
                                    <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" title="View LinkedIn">
                                      <Briefcase className="w-4 h-4" /> {/* <-- Updated Icon here */}
                                    </a>
                                  )}

                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEnrichLead(lead.id, lead.name, lead.address)}
                            disabled={lead.isEnriching}
                            className="inline-flex items-center justify-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                          >
                            {lead.isEnriching ? (
                              <span className="animate-pulse">Searching...</span>
                            ) : (
                              <><Search className="w-3.5 h-3.5" /> Enrich</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : 
                
                /* STATE 3: EMPTY STATE (Shows before they click generate) */
                (
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