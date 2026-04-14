'use client';

import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    label?: string;
    options: SelectOption[];
    value: string | undefined;
    onChange: (value: string) => void;
}

export default function Select({ label, options, value, onChange, className = '', id, ...rest }: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium mb-2">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
                {...rest}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
