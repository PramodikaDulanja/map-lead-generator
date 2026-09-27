export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Controls */}
      <aside className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📍 Lead Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">Select an area to find businesses.</p>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City or Area</label>
            <div className="flex bg-gray-100 p-2 rounded-md border border-gray-200">
              <span className="text-gray-400 mr-2">🔍</span>
              <input 
                type="text" 
                placeholder="Search location..." 
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius: 5km</label>
            <input type="range" min="1" max="20" defaultValue="5" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <select className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md text-sm outline-none">
              <option>Restaurants</option>
              <option>Coffee Shops</option>
              <option>Retail Stores</option>
              <option>IT Companies</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors mt-auto">
            Generate Leads
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
            <span className="text-4xl mb-2">🗺️</span>
            <p>Interactive Map will render here</p>
          </div>
        </div>

        <div className="h-64 bg-white border-t p-4 overflow-y-auto hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Results (0)</h2>
            <div className="flex gap-2">
              <button className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                📥 Excel
              </button>
              <button className="text-sm bg-red-600 text-white px-3 py-1 rounded">
                📥 PDF
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">No leads generated yet.</p>
        </div>
      </main>
    </div>
  );
}