import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Briefcase, Edit, Save, X, Shield } from "lucide-react";
import { userApi } from "../../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userApi.getProfile();
      setUser(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(formData);
      setUser(formData);
      setIsEditing(false);
      // Optionally notify user of success
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-200 pt-13 pb-8 px-4 sm:px-6 lg:px-8 font-sans md:py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Card 1: Identity/Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden pb-6 md:pb-8">
          {/* Cover */}
          <div className="h-32 bg-slate-900 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-slate-900 to-slate-900"></div>
          </div>

          <div className="px-4 md:px-8">
            <div className="relative flex flex-col items-center md:flex-row md:items-end -mt-16 md:-mt-12 gap-4 md:gap-6">

              {/* Avatar */}
              <div className="w-28 h-28 md:w-24 md:h-24 rounded-2xl bg-white p-1 shadow-xl shrink-0 z-10">
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl md:text-3xl font-black text-slate-300">{user.name.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center md:text-left pt-2 md:pt-0 md:pb-1 md:translate-y-3">
                <h1 className="text-2xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2 md:mb-1">
                  {user.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex-wrap">
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded shadow-sm border border-amber-100">{user.role.replace('_', ' ')}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="truncate">{user.department || 'No Department'}</span>
                </div>
              </div>

              {/* Edit Toggle */}
              <div className="w-full md:w-auto flex justify-center md:justify-end mt-2 md:mt-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${isEditing
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900'
                    }`}
                >
                  {isEditing ? (
                    <><X className="w-4 h-4" /> Cancel</>
                  ) : (
                    <><Edit className="w-4 h-4" /> Edit Profile</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Details Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Employee Details
            </h3>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm font-bold transition-all outline-none ${isEditing
                        ? 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                        }`}
                    />
                  </div>
                </div>

                {/* Email (Locked) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Email Address <Shield className="h-3 w-3" />
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-400 text-sm font-bold cursor-not-allowed select-none code"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="No phone number added"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm font-bold transition-all outline-none font-mono ${isEditing
                        ? 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                        }`}
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Department
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Not Assigned"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm font-bold transition-all outline-none uppercase ${isEditing
                        ? 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                        }`}
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(user);
                      setIsEditing(false);
                    }}
                    className="mr-3 px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
