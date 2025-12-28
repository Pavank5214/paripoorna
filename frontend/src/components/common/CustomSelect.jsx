import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    icon: Icon,
    required = false,
    className = ""
}) => {
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

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        // Create a synthetic event to be compatible with standard onChange handlers if needed, 
        // or just pass the value directly depending on usage. 
        // Here we'll pass the simple value to keep it flexible, but for form handlers that expect events:
        // onChange({ target: { name: ???, value: optionValue } }) - this is tricky without name prop.
        // So we will assume the parent handles `onChange(value)` or we pass `name`.
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between bg-slate-50 border ${isOpen ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium transition-all group focus:outline-none`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {Icon && (
                            <Icon className={`h-5 w-5 ${isOpen ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`} />
                        )}
                        <span className={`truncate ${selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${value === option.value
                                        ? 'bg-amber-50 text-amber-900 font-bold'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                    }`}
                            >
                                <span className="uppercase tracking-wide text-xs">{option.label}</span>
                                {value === option.value && <Check className="h-4 w-4 text-amber-500" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
