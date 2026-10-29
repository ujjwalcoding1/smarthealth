import React, { useState } from 'react';
import { UserCheck, Phone, Calendar, Star, MapPin, Search, Award, MessageCircle } from 'lucide-react';

export function DoctorsDirectory({ doctors, onSelectDoctorForBooking, lang }) {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  const specialties = ['ALL', 'Cardiology', 'General Medicine', 'Pulmonology', 'Neurology'];

  const filtered = doctors?.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          doc.hospital_clinic_name.toLowerCase().includes(search.toLowerCase());
    if (selectedSpecialty === 'ALL') return matchesSearch;
    return matchesSearch && doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
  }) || [];

  return (
    <div className="health-card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'hi' ? 'विशेषज्ञ चिकित्सक एवं परामर्श' : 'Verified Specialist Doctors Directory'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'हृदय रोग, सामान्य चिकित्सा, फेफड़े और न्यूरोलॉजी विशेषज्ञ' : 'Direct appointments, verified qualifications, and instant consultation booking.'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'hi' ? 'डॉक्टर या स्पेशलिटी खोजें...' : 'Search doctor or specialty...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Specialties Pills */}
      <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSpecialty === spec
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor header */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={doc.photo_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300"}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-teal-500/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {doc.name}
                    </h4>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {doc.rating || 4.9}
                    </span>
                  </div>

                  <p className="text-teal-700 dark:text-teal-300 font-semibold text-xs truncate">
                    {doc.specialty}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">
                    {doc.qualification} • {doc.experience_years}+ Yrs Exp
                  </p>
                </div>
              </div>

              {/* Hospital & Fee info */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Hospital / Clinic:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                    {doc.hospital_clinic_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Consultation Fee:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{doc.consultation_fee}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Available:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {doc.available_days}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons (Direct Call + Book Consultation Form) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${doc.phone}`}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                title={`Call ${doc.name}`}
              >
                <Phone className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href={`https://wa.me/${doc.whatsapp_number}?text=${encodeURIComponent(`Hello ${doc.name}, I would like to inquire about an appointment consultation via SmartHealth.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </a>

              <button
                onClick={() => onSelectDoctorForBooking && onSelectDoctorForBooking(doc)}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
