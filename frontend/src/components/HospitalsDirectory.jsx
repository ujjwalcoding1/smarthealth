import React, { useState } from 'react';
import { Building2, Phone, MapPin, Navigation, ShieldAlert, Search, Star, CheckCircle } from 'lucide-react';

export function HospitalsDirectory({ hospitals, lang }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = hospitals?.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
                          h.city.toLowerCase().includes(search.toLowerCase()) ||
                          h.address.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'EMERGENCY') return matchesSearch && h.emergency_24x7;
    return matchesSearch;
  }) || [];

  return (
    <div className="health-card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'hi' ? 'स्थानीय अस्पताल एवं ट्रॉमा सेंटर' : 'Verified Local Hospitals & Emergency Centers'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? '24x7 आपातकालीन नंबर, आईसीयू, एम्बुलेंस और लाइव मैप्स' : 'Direct emergency dispatch lines, 24/7 ICU beds, and live Google Maps directions.'}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'hi' ? 'अस्पताल खोजें...' : 'Search hospital or city...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => setFilterType(filterType === 'ALL' ? 'EMERGENCY' : 'ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'EMERGENCY'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {filterType === 'EMERGENCY' ? '24/7 Only' : 'All Centers'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {filtered.map((hosp) => (
          <div
            key={hosp.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="relative h-36 w-full bg-slate-900">
                <img
                  src={hosp.photo_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600"}
                  alt={hosp.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-500 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{hosp.rating || 4.8}</span>
                </div>
                {hosp.emergency_24x7 && (
                  <span className="absolute bottom-2.5 left-2.5 bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    24/7 Emergency
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">
                  {hosp.name}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{hosp.address}, {hosp.city} - {hosp.pincode}</span>
                </p>

                {/* Facilities Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {hosp.facilities?.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions (Call Emergency & Maps) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <a
                href={`tel:${hosp.emergency_phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Emergency</span>
              </a>

              <a
                href={hosp.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(hosp.name + ' ' + hosp.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                title="Open Google Maps Directions"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Directions</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
