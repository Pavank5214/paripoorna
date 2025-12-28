import React from 'react'
import Sidebar from '../common/Sidebar'
import AIChatWidget from '../common/AIChatWidget'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-200 p-4">
          <Outlet />
        </main>
      </div>
      <AIChatWidget />
    </div>
  )
}

export default UserLayout