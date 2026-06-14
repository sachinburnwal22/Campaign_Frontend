'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ArrowUpDown, Shield, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  date_of_birth: string;
  total_spent: number;
  last_order_date: string | null;
  engagement_score: number;
}

export default function CustomersDirectory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newDob, setNewDob] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = async (page = 1, query = '', city = '') => {
    setIsLoading(true);
    try {
      let url = `/api/customers?page=${page}`;
      if (query) url += `&name=${encodeURIComponent(query)}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Laravel paginator returns data inside the 'data' array
        setCustomers(data.data || []);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
      } else {
        toast.error('Failed to load customers from database');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      loadCustomers(1, search, cityFilter);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, cityFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      loadCustomers(page, search, cityFilter);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone || !newCity || !newDob) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          city: newCity,
          gender: newGender,
          date_of_birth: newDob,
          total_spent: 0.00,
          engagement_score: Math.floor(Math.random() * 40) + 50 // Default engagement score 50-90
        })
      });

      if (res.ok) {
        toast.success('🎉 Customer added successfully!');
        setShowAddModal(false);
        // Clear inputs
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewCity('');
        setNewDob('');
        // Reload list
        loadCustomers(1, search, cityFilter);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to create customer');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating customer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Customer Directory</h2>
          <p className="text-slate-400 mt-2">Manage your core customer base and profiles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Filter by city (e.g. Delhi, Mumbai)..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="card-gradient p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Contact</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Location</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Birthdate</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">LTV</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold text-center">Engagement</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">No customers found</td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-semibold">{cust.name}</td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {cust.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> {cust.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {cust.city}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{cust.date_of_birth}</td>
                    <td className="py-4 px-4 text-emerald-400 font-bold">₹{Number(cust.total_spent).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="w-24 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full"
                            style={{ width: `${cust.engagement_score}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{cust.engagement_score}% Score</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      {cust.last_order_date ? cust.last_order_date : 'No orders yet'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Page {currentPage} of {lastPage}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6">Add New Customer</h3>

              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sachin Kumar"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Kolkata"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 border border-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
