import { useState, useRef, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { getUserSession } from '../auth/sessionController'
import { cmsRoles } from '../data/roleConfig'

const emptyForm = { name: '', company: '', role: '', package: '', status: 'Selected', date: '' }

const STATUS_FILTER_OPTIONS = [
  { id: 'Selected', label: 'Selected', dotClass: 'bg-emerald-500' },
  { id: 'Process', label: 'In Process', dotClass: 'bg-orange-500' },
  { id: 'Rejected', label: 'Rejected', dotClass: 'bg-red-500' },
]

const PACKAGE_FILTER_OPTIONS = [
  { id: 'below_10k', label: 'Below $10k' },
  { id: '10k_to_15k', label: '$10k - $15k' },
  { id: 'above_15k', label: 'Above $15k' },
]

const SORT_FILTER_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'date_desc', label: 'Date: Newest first' },
  { id: 'date_asc', label: 'Date: Oldest first' },
  { id: 'package_desc', label: 'Package: High to low' },
  { id: 'package_asc', label: 'Package: Low to high' },
  { id: 'company_asc', label: 'Company: A to Z' },
]

function parsePackageToNumber(value) {
  const text = String(value || '').toLowerCase().replace(/,/g, '').trim()
  const match = text.match(/\d+(\.\d+)?/)
  if (!match) return null

  let amount = Number(match[0])
  if (!Number.isFinite(amount)) return null
  if (text.includes('k')) amount *= 1000
  if (text.includes('m')) amount *= 1000000
  return amount
}

function matchesPackageBand(packageValue, bandId) {
  if (packageValue === null) return false
  if (bandId === 'below_10k') return packageValue < 10000
  if (bandId === '10k_to_15k') return packageValue >= 10000 && packageValue <= 15000
  if (bandId === 'above_15k') return packageValue > 15000
  return true
}

function parseDateToTimestamp(value) {
  const timestamp = Date.parse(String(value || ''))
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export default function PlacementPage({ noLayout = false }) {
  const session = getUserSession()
  const role = session?.role || 'student'
  const isAdmin = role === 'admin'
  const isStudent = role === 'student'
  const sessionUserId = session?.userId || ''
  const studentDefaultName = cmsRoles.student.name

  const [entries, setEntries] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [selectedPackageBands, setSelectedPackageBands] = useState([])
  const [sortBy, setSortBy] = useState('default')
  const [activeFilterTab, setActiveFilterTab] = useState('status')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  const loadPlacements = async (overrides = {}) => {
    try {
      const params = new URLSearchParams()
      const effectiveSearch = overrides.searchQuery ?? searchQuery

      if (isStudent && sessionUserId) params.set('person_id', sessionUserId)
      if (effectiveSearch?.trim()) params.set('search', effectiveSearch.trim())

      const query = params.toString()
      const res = await fetch(`/api/academics/placement${query ? `?${query}` : ''}`)
      const json = await res.json().catch(() => null)
      if (json?.success && Array.isArray(json.data)) {
        setEntries(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch placements:', err)
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    loadPlacements({ searchQuery: '' })
  }, [isStudent, sessionUserId])

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadPlacements()
    }, 250)

    return () => clearTimeout(debounce)
  }, [searchQuery, isStudent, sessionUserId])

  const visibleEntries = isStudent
    ? entries.filter((p) => p.ownerId === sessionUserId)
    : entries

  const companyOptions = useMemo(() => (
    Array.from(new Set(visibleEntries.map((entry) => entry.company).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  ), [visibleEntries])

  const activeFilterCount =
    selectedStatuses.length +
    selectedCompanies.length +
    selectedPackageBands.length +
    (sortBy !== 'default' ? 1 : 0)

  const filterTabs = [
    { id: 'status', label: 'Status' },
    { id: 'company', label: 'Company' },
    { id: 'package', label: 'Package' },
    { id: 'sort', label: 'Sort' },
  ]

  function toggleSelection(value, setter) {
    setter((prev) => (
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    ))
  }

  function clearAllFilters() {
    setSelectedStatuses([])
    setSelectedCompanies([])
    setSelectedPackageBands([])
    setSortBy('default')
    setActiveFilterTab('status')
  }

  useEffect(() => {
    setSelectedCompanies((prev) => {
      const next = prev.filter((company) => companyOptions.includes(company))
      return next.length === prev.length ? prev : next
    })
  }, [companyOptions])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    let rows = visibleEntries.filter((entry) => {
      const matchSearch = !normalizedSearch ||
        entry.name.toLowerCase().includes(normalizedSearch) ||
        entry.company.toLowerCase().includes(normalizedSearch)

      const matchStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(entry.status)

      const matchCompany =
        selectedCompanies.length === 0 || selectedCompanies.includes(entry.company)

      const packageValue = parsePackageToNumber(entry.package)
      const matchPackage =
        selectedPackageBands.length === 0 ||
        selectedPackageBands.some((bandId) => matchesPackageBand(packageValue, bandId))

      return matchSearch && matchStatus && matchCompany && matchPackage
    })

    if (sortBy === 'date_desc') {
      rows = [...rows].sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date))
    } else if (sortBy === 'date_asc') {
      rows = [...rows].sort((a, b) => parseDateToTimestamp(a.date) - parseDateToTimestamp(b.date))
    } else if (sortBy === 'package_desc') {
      rows = [...rows].sort((a, b) => (parsePackageToNumber(b.package) || 0) - (parsePackageToNumber(a.package) || 0))
    } else if (sortBy === 'package_asc') {
      rows = [...rows].sort((a, b) => (parsePackageToNumber(a.package) || 0) - (parsePackageToNumber(b.package) || 0))
    } else if (sortBy === 'company_asc') {
      rows = [...rows].sort((a, b) => a.company.localeCompare(b.company))
    }

    return rows
  }, [visibleEntries, searchQuery, selectedStatuses, selectedCompanies, selectedPackageBands, sortBy])

  const hasStudentEntry = isStudent && visibleEntries.length > 0
  const hasAnyVisibleRecord = visibleEntries.length > 0

  function openAddModal() {
    setEditingEntry(null)
    setForm(isStudent ? { ...emptyForm, name: studentDefaultName } : emptyForm)
    setShowModal(true)
  }

  function openEditModal(entry) {
    setEditingEntry(entry)
    setForm({ name: entry.name, company: entry.company, role: entry.role, package: entry.package, status: entry.status, date: entry.date })
    setShowModal(true)
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    const payload = isStudent
      ? { ...form, name: studentDefaultName, ownerId: sessionUserId }
      : form
    try {
      if (editingEntry) {
        const id = editingEntry.id || editingEntry._id
        const res = await fetch(`/api/academics/placement/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json().catch(() => null)
        if (json?.success) await loadPlacements()
      } else {
        const res = await fetch('/api/academics/placement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json().catch(() => null)
        if (json?.success) await loadPlacements()
      }
    } catch (err) {
      console.error('Failed to save placement:', err)
    }
    setEditingEntry(null)
    setForm(emptyForm)
    setShowModal(false)
  }

  async function handleDelete(entry) {
    const id = entry.id || entry._id
    if (!window.confirm('Delete this placement record?')) return
    try {
      const res = await fetch(`/api/academics/placement/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => null)
      if (json?.success) await loadPlacements()
    } catch (err) {
      console.error('Failed to delete placement:', err)
    }
  }

  const inputClasses = "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1162d4]/10 focus:border-[#1162d4] outline-none transition-all text-sm text-slate-700 bg-white";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5 ml-0.5";

  const inner = (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[
          { icon: 'attach_money',label: 'Avg. Package',       value: '$10.2k',                                                color: 'text-emerald-600 bg-emerald-100' },
          { icon: 'business',    label: isStudent ? 'Companies Applied' : 'Companies Visited', value: new Set(visibleEntries.map(e => e.company)).size, color: 'text-purple-600 bg-purple-100' },
          { icon: 'emoji_events', label: isStudent ? 'My Selections' : 'Students Placed', value: visibleEntries.filter(e => e.status === 'Selected').length, color: 'text-[#1162d4] bg-[#1162d4]/10' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {(isAdmin || isStudent) && hasAnyVisibleRecord && (
        <div className="mb-4">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#1162d4] text-white rounded-lg text-sm font-semibold hover:bg-[#1162d4]/90 transition-all shadow-sm active:scale-95 w-fit"
          >
            <span className="material-symbols-outlined text-lg">add</span>Add Placement Record
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder={isStudent ? 'Search company...' : 'Search student or company...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1162d4]/30 focus:border-[#1162d4] transition-all duration-200"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
              activeFilterCount > 0
                ? 'bg-[#1162d4] text-white border-[#1162d4] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-20 animate-dropIn origin-top-right overflow-hidden">
              <div className="border-b border-slate-100 px-2 pt-1.5">
                <div className="grid grid-cols-4 gap-1">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilterTab(tab.id)}
                      className={`px-2 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                        activeFilterTab === tab.id
                          ? 'text-[#1162d4] border-b-2 border-[#1162d4]'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 max-h-56 overflow-y-auto">
                {activeFilterTab === 'status' && (
                  <div className="space-y-1">
                    {STATUS_FILTER_OPTIONS.map((option) => {
                      const checked = selectedStatuses.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleSelection(option.id, setSelectedStatuses)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            checked ? 'bg-[#1162d4]/10 text-[#1162d4] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${option.dotClass}`} />
                            {option.label}
                          </span>
                          {checked && <span className="material-symbols-outlined text-base">check</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeFilterTab === 'company' && (
                  <div className="space-y-1">
                    {companyOptions.length === 0 && (
                      <p className="px-3 py-2 text-sm text-slate-400">No companies available</p>
                    )}
                    {companyOptions.map((company) => {
                      const checked = selectedCompanies.includes(company)
                      return (
                        <button
                          key={company}
                          onClick={() => toggleSelection(company, setSelectedCompanies)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            checked ? 'bg-[#1162d4]/10 text-[#1162d4] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate text-left">{company}</span>
                          {checked && <span className="material-symbols-outlined text-base">check</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeFilterTab === 'package' && (
                  <div className="space-y-1">
                    {PACKAGE_FILTER_OPTIONS.map((option) => {
                      const checked = selectedPackageBands.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleSelection(option.id, setSelectedPackageBands)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            checked ? 'bg-[#1162d4]/10 text-[#1162d4] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{option.label}</span>
                          {checked && <span className="material-symbols-outlined text-base">check</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {activeFilterTab === 'sort' && (
                  <div className="space-y-1">
                    {SORT_FILTER_OPTIONS.map((option) => {
                      const checked = sortBy === option.id
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            checked ? 'bg-[#1162d4]/10 text-[#1162d4] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{option.label}</span>
                          {checked && <span className="material-symbols-outlined text-base">check</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-3 py-2.5 flex items-center justify-between bg-slate-50/70">
                <p className="text-xs text-slate-500">{activeFilterCount} filter(s) applied</p>
                <button
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Placement Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">{isStudent ? 'Candidate' : 'Student'}</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              {(isAdmin || isStudent) && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={(isAdmin || isStudent) ? 7 : 6} className="px-6 py-10 text-center text-sm">
                  {hasAnyVisibleRecord ? (
                    <span className="text-slate-400">No records found</span>
                  ) : (
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1162d4] text-white rounded-lg text-sm font-semibold hover:bg-[#1162d4]/90 transition-all shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>Add Placement Record
                    </button>
                  )}
                </td>
              </tr>
            )}
            {filteredEntries.map((p, i) => (
              <tr key={p.id || p._id || i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{p.company}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.role}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.package}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{p.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'Selected'
                      ? 'bg-emerald-50 text-emerald-600'
                      : p.status === 'Rejected'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-orange-50 text-orange-600'
                  }`}>{p.status}</span>
                </td>
                {(isAdmin || isStudent) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#1162d4] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingEntry(null) }}
        title={editingEntry ? 'Edit Placement Record' : 'Add Placement Record'}
        icon="work"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              onClick={() => { setShowModal(false); setEditingEntry(null) }}
              className="px-6 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#1162d4] text-white rounded-lg text-sm font-semibold hover:bg-[#1162d4]/90 transition-all shadow-sm active:scale-95"
            >
              {editingEntry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClasses}>Student Name *</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange} required disabled={isStudent}
              placeholder="e.g., John Doe" className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Company *</label>
            <input
              type="text" name="company" value={form.company} onChange={handleChange} required
              placeholder="e.g., Google" className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Role *</label>
            <input
              type="text" name="role" value={form.role} onChange={handleChange} required
              placeholder="e.g., SWE Intern" className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Package *</label>
            <input
              type="text" name="package" value={form.package} onChange={handleChange} required
              placeholder="e.g., $12,000/yr" className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Date *</label>
            <input
              type="date" name="date" value={form.date} onChange={handleChange} required
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Status *</label>
            <select
              name="status" value={form.status} onChange={handleChange} required
              className={inputClasses}
            >
              <option value="Selected">Selected</option>
              <option value="Process">In Process</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
  return noLayout ? inner : <Layout title="Placement">{inner}</Layout>
}
