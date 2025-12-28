import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { projectsApi } from '../../services/api';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Map, Navigation, Globe } from 'lucide-react';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ProjectMap = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await projectsApi.getProjects();
            // Filter projects that have valid coordinates
            const mappedProjects = res.data.filter(
                p => p.coordinates && p.coordinates.lat && p.coordinates.lng
            );
            setProjects(mappedProjects);
        } catch (error) {
            console.error("Failed to load projects for map", error);
        } finally {
            setLoading(false);
        }
    };

    // Default center (India)
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-2">
                <Globe className="w-8 h-8 text-slate-300 animate-pulse" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading map data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-200 flex flex-col font-sans px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="bg-transparent pb-4 mb-2 sticky top-0 z-[1000]">
                <div className="flex items-center gap-3 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
                        <Map className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            Project Map
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                            Geospatial Overview
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow mt-4">
                <div className="h-[650px] w-full bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 relative z-0">
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {projects.map((project) => (
                            <Marker
                                key={project._id}
                                position={[project.coordinates.lat, project.coordinates.lng]}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[200px] font-sans">
                                        <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight mb-1">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-3 flex items-start gap-1 font-bold">
                                            <Navigation className="w-3 h-3 mt-0.5 text-amber-500" />
                                            {project.location}
                                        </p>

                                        <div className="flex items-center justify-between mb-4 border-t border-slate-100 pt-2">
                                            <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider border
                                                ${project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    project.status === 'delayed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {project.status || 'ACTIVE'}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-700">
                                                {project.progress}%
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/projects/${project._id}`)}
                                            className="w-full bg-slate-900 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                                        >
                                            View Project
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default ProjectMap;
