import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, UserX, UserCheck,
  MoreVertical, Edit, Shield, Trash2, Mail,
  Phone, Building, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { userApi } from '../../services/api';

import UserModal from '../common/UserModal';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('active'); // active, pending, rejected, suspended
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search,
        status: activeTab
      };
      const res = await userApi.getUsers(params);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    await userApi.createUser(userData);
    fetchUsers();
  };

  const handleUpdateUser = async (userData) => {
    if (!selectedUser) return;
    await userApi.updateUser(selectedUser._id, userData);
    fetchUsers();
  };

  const handleApprove = async (userId) => {
    if (!window.confirm("Approve this user account?")) return;
    try {
      await userApi.activateUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Reject this user registration?")) return;
    try {
      await userApi.rejectUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user");
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("Deactivate (Suspend) this user?")) return;
    try {
      await userApi.deleteUser(userId); // Use soft delete endpoint for suspension
      fetchUsers();
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend user");
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (window.confirm('WARNING: This will PERMANENTLY delete the user and all associated data. This action cannot be undone. \n\nAre you sure you want to proceed?')) {
      try {
        await userApi.deleteUserPermanent(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error permanently deleting user:', err);
        alert('Failed to delete user permanently');
      }
    }
  };


  const TabButton = ({ id, label, icon: Icon, color }) => (
    <button
      onClick={() => { setActiveTab(id); setPage(1); }}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold uppercase tracking-wider text-xs ${activeTab === id
        ? `border-${color}-500 text-${color}-600 bg-${color}-50/50`
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-500" />
              User Management
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Control center for system access and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 font-bold uppercase tracking-wide text-xs"
          >
            <Plus className="w-4 h-4" />
            Manually Add User
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border-b border-slate-200 flex overflow-x-auto">
          <TabButton id="active" label="Active Staff" icon={CheckCircle} color="emerald" />
          <TabButton id="suspended" label="Suspended / Inactive" icon={UserX} color="slate" />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-b-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No users found</h3>
            <p className="text-slate-500 text-sm mt-1">There are no {activeTab} users matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">User Profile</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Dept</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-lg" /> : user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 font-mono">ID: {user._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                            {user.role.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Building className="w-3 h-3" /> {user.department || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" /> {user.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === 'active' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active</span>}
                        {user.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-100"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Requested</span>}
                        {user.status === 'suspended' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide border border-slate-200">Suspended</span>}
                        {user.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wide border border-rose-100">Rejected</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Actions based on Status */}

                          {/* ACTIVE: Edit, Suspend */}
                          {activeTab === 'active' && (
                            <>
                              <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200" title="Edit User">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeactivate(user._id)} className="p-2 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200" title="Suspend User">
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* SUSPENDED: Reactivate */}
                          {activeTab === 'suspended' && (
                            <>
                              <button onClick={() => handleApprove(user._id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200" title="Reactivate Account">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* ALL: Permanent Delete (Trash) */}
                          <button
                            onClick={() => handlePermanentDelete(user._id)}
                            className="p-2 bg-white text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <UserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
        />

        <UserModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          onSave={handleUpdateUser}
          initialData={selectedUser}
        />

      </div>
    </div>
  );
};

export default UserManagement;
