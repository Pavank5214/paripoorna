import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HardHat, Hammer, Ruler, CheckCircle2 } from "lucide-react";
import dashboardImg from "../../assets/dashboard.png";

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-900 p-1.5 rounded-lg">
                                <HardHat className="w-6 h-6 text-amber-500" />
                            </div>
                            <span className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                BuildTrack
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95 flex items-center gap-2"
                            >
                                Login to Portal <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background Blueprint Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 animate-blueprint-grid"></div>

            {/* Hero Section */}
            <div className="relative pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
                <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                            The #1 Construction Management Platform
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight animate-crane-drop">
                        Build Better, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Faster</span>, and Safer.
                    </h1>

                    <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        Streamline your construction projects with real-time tracking, AI-powered insights, and seamless resource management.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 hover-hammer-strike"
                        >
                            Access Dashboard
                        </Link>
                    </div>
                </div>

                {/* Dashboard Preview with Construction Animation */}
                <div className={`relative mx-auto max-w-5xl perspective-1000 transition-all duration-1000 md:mt-20 mt-12 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                    {/* The "Blueprint" Reveal Effect */}
                    <div className="relative rounded-2xl bg-slate-200/50 p-2 md:p-4 border border-slate-200 shadow-2xl overflow-hidden group">

                        {/* Construction Lines / Grid Overlay */}
                        <div className={`absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] transition-opacity duration-1000 ${isVisible ? 'opacity-0' : 'opacity-100'}`}></div>

                        {/* The Dashboard Image */}
                        <div className="relative rounded-xl overflow-hidden bg-white shadow-inner">
                            <img
                                src={dashboardImg}
                                alt="BuildTrack Dashboard"
                                className={`w-full h-auto rounded-xl shadow-lg transform transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] origin-bottom ${isVisible ? 'scale-100 rotate-x-0 filter-none translate-y-0' : 'scale-95 rotate-x-12 blur-sm translate-y-12'}`}
                            />

                            {/* "Construction" Mask with Hazard Stripes - Slides up to reveal */}
                            <div className={`absolute inset-0 bg-slate-100 z-10 transition-transform duration-[2s] ease-in-out origin-top ${isVisible ? 'scale-y-0' : 'scale-y-100'}`}>
                                <div className="absolute bottom-0 left-0 w-full h-4 animate-hazard-stripes shadow-2xl"></div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -left-4 -top-4 -z-10 animate-bounce-subtle delay-100">
                            <Hammer className="w-12 h-12 text-slate-300 -rotate-45" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 -z-10 animate-pulse delay-700">
                            <Ruler className="w-12 h-12 text-slate-300 rotate-12" />
                        </div>
                    </div>

                    {/* Floating Badges */}
                    <div className={`absolute -right-6 top-1/4 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-slow z-30 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Project Status</p>
                            <p className="text-xs font-black text-slate-900">Ahead of Schedule</p>
                        </div>
                    </div>

                    <div className={`absolute -left-6 bottom-1/3 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-reverse z-30 transition-all duration-700 delay-1200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <HardHat className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Safety Score</p>
                            <p className="text-xs font-black text-slate-900">98% Compliant</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <HardHat className="w-6 h-6 text-amber-500" />
                        <span className="text-xl font-black text-white uppercase tracking-tight">BuildTrack</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">© 2025 BuildTrack Construction Suite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
