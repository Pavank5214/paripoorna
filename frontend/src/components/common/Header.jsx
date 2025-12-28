

import React, { useState, useEffect, useRef, useContext } from "react";
import { Menu, Bell, User, X, Shield, Settings, Users, Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../private/AuthContext";
import NotificationBell from "./NotificationBell";
import NotificationCenter from "./NotificationCenter";


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Projects", to: "/projects" },
    { name: "Materials", to: "/materials" },
    { name: "Costs", to: "/costs" },
    { name: "Map View", to: "/projects/map" },
  ];

  // Add admin links for admin users
  const adminNavLinks = [
    { name: "Admin Dashboard", to: "/admin/dashboard", icon: Shield },
    { name: "User Management", to: "/admin/users", icon: Users },
    { name: "Audit Logs", to: "/admin/audit-logs", icon: Database },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md px-6 py-3 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
          <h1 className="text-xl font-bold text-blue-700">BuildTrack</h1>
        </div>


        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.to} className="hover:text-blue-600">
              {link.name}
            </Link>
          ))}
          {/* Show admin links for admin users */}
          {user && (user.role === 'admin' || user.role === 'super_admin') && adminNavLinks.map((link) => (
            <Link key={link.name} to={link.to} className="hover:text-purple-600 flex items-center gap-1">
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell className="h-6 w-6 text-gray-700" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {/* Profile Button */}
          <div className="relative" ref={profileRef}>
            {user ? (
              <>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <User className="h-6 w-6 text-gray-700" />
                  <span className="hidden sm:inline text-gray-700">{user.name}</span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded-xl p-4 z-50">
                    <div className="flex items-center gap-3">

                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <hr className="my-3" />
                    {/* <Link
                      to="/profile"
                      className="block w-full text-left text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="w-full py-2 px-3 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
