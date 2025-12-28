import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Filter, Clock, AlertTriangle, CheckCircle2, XCircle,
    Shield, User, Database, Globe, Download, History, Trash2, ChevronDown, Check
} from 'lucide-react';
import { userApi } from '../../services/api';

const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full md:w-48 px-4 py-2.5 bg-slate-50 border ${isOpen ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'} rounded-lg hover:bg-slate-100 transition-all group`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {Icon && <Icon className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />}
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide truncate">
                        {selectedOption.label}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full md:w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                    <div className="px-3 py-2 mb-1 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${value === option.value
                                    ? 'bg-amber-50 text-amber-700 font-bold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                    }`}
                            >
                                <span className="uppercase tracking-tight text-xs">{option.label}</span>
                                {value === option.value && <Check className="h-3.5 w-3.5 text-amber-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const resourceOptions = [
        { value: '', label: 'All Resources' },
        { value: 'User', label: 'User' },
        { value: 'Project', label: 'Project' },
        { value: 'Task', label: 'Task' },
        { value: 'System', label: 'System' },
        { value: 'Security', label: 'Security' }
    ];

    useEffect(() => {
        fetchLogs();
    }, [currentPage, actionFilter, resourceFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                action: actionFilter,
                resource: resourceFilter
            };

            const response = await userApi.getAuditLogs(params);

            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
            setTotalLogs(response.data.totalLogs);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await userApi.exportAuditLogs();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting logs:', err);
            alert('Failed to export logs');
        }
    };

    const handleClear = async () => {
        if (window.confirm('WARNING: Are you sure you want to PERMANENTLY delete ALL audit logs? This action cannot be undone.')) {
            try {
                await userApi.clearAuditLogs();
                fetchLogs(); // Refresh list
                alert('All logs cleared successfully');
            } catch (err) {
                console.error('Error clearing logs:', err);
                alert('Failed to clear logs');
            }
        }
    };

    const getActionColor = (severity) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'HIGH':
                return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'MEDIUM':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'LOW':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (isError) => {
        if (isError) {
            return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
        }
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-slate-200 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center uppercase tracking-tight">
                    <History className="h-8 w-8 mr-3 text-amber-500" />
                    Audit Logs
                </h1>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="SEARCH ACTION..."
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-bold text-slate-700 uppercase placeholder:text-slate-400 placeholder:font-medium transition-all"
                            />
                        </div>

                        <FilterDropdown
                            label="Filter Resource"
                            value={resourceFilter}
                            options={resourceOptions}
                            onChange={setResourceFilter}
                            icon={Filter}
                        />

                        <div className="flex items-center gap-2 ml-auto w-full md:w-auto">
                            <button
                                onClick={handleExport}
                                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                                <Download className="h-4 w-4" />
                                <span>Export CSV</span>
                            </button>

                            <button
                                onClick={handleClear}
                                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-200 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Clear Logs</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {error ? (
                        <div className="p-8 text-center text-rose-500 bg-rose-50 border-b border-rose-100">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-bold">{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Resource
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wide">
                                                No logs found matching your criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-[11px] font-mono font-bold text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        {formatTime(log.timestamp)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.userName ? (
                                                        <div className="flex items-center">
                                                            <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-black mr-2">
                                                                {log.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{log.userName}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium">{log.userEmail}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400 italic">SYSTEM</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${getActionColor(log.severity)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700 uppercase tracking-tight">
                                                    {log.resource}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-medium text-slate-600 max-w-xs truncate" title={log.description}>
                                                        {log.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {getStatusIcon(log.isError)}
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${log.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {log.isError ? 'Failed' : 'Success'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">
                                    Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                                    <span className="font-bold text-slate-900">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 uppercase tracking-wide transition-all"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 uppercase tracking-wide transition-all"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default AdminAuditLogs;
