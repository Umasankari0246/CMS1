<<<<<<< HEAD
import { getUserSession } from '../auth/sessionController'
import { cmsRoles } from '../data/roleConfig'
import { getStudentById } from '../data/studentData'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title }) {
  const navigate = useNavigate()
  const session = getUserSession()
  const role = session?.role || 'student'
  const roleLabel = cmsRoles[role]?.label || 'Student'
  const roleQuery = `?role=${encodeURIComponent(role)}`

  function openNotifications() {
    navigate(`/notifications${roleQuery}`)
  }

  function openSettings() {
    navigate(`/settings${roleQuery}`)
  }

  function openProfileDetails() {
    if (role === 'student') {
      const studentId = session?.userId
      const knownStudent = studentId ? getStudentById(studentId) : null
      const targetStudentId = knownStudent ? studentId : 'STU-2024-1547'
      navigate(`/students/${encodeURIComponent(targetStudentId)}${roleQuery}`)
      return
    }

    navigate(`/students${roleQuery}`)
  }
=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';
import { getUserSession } from '../auth/sessionController';

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const session = getUserSession();
  const role = session?.role || 'student';
>>>>>>> 0eec7c31b0c5157183e14731cc9bfd7fe8fde4fe

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-4 flex-1">
        <div className="h-7" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-6">
<<<<<<< HEAD
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openNotifications}
            className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all relative"
            aria-label="Open notifications"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button
            type="button"
            onClick={openSettings}
            className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
            aria-label="Open settings"
=======
        <div className="flex items-center gap-2 relative">
          <NotificationBell 
            role={role} 
            onBellClick={() => setIsNotificationOpen(!isNotificationOpen)}
          />
          <NotificationDropdown 
            role={role} 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
          <button 
            className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
            onClick={() => navigate(`/settings?role=${encodeURIComponent(role)}`)}
>>>>>>> 0eec7c31b0c5157183e14731cc9bfd7fe8fde4fe
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        </div>
        <button
          type="button"
          onClick={openProfileDetails}
          className="flex items-center gap-4 border-l border-slate-100 pl-6 cursor-pointer group bg-transparent border-0"
          aria-label="Open profile details"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1e293b]">{roleLabel} User</p>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">{roleLabel} Access</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
            <img 
              src="https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  )
}
