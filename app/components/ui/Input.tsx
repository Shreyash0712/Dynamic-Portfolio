'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export default function Input({ label, className = '', id, ...rest }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium mb-2">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
                {...rest}
            />
        </div>
    );
}
