import React from 'react';

export const VerivoIcon = ({ className = "w-8 h-8", color = "currentColor" }: { className?: string; color?: string }) => (
    <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Verivo Logo"
    >
        {/* Shield/V Shape background */}
        <path
            d="M20 38C20 38 4 28 4 14V8L20 2L36 8V14C36 28 20 38 20 38Z"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-600 dark:text-purple-500"
        />
        {/* Checkmark inside */}
        <path
            d="M13 18L18 23L27 13"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const VerivoLogo = ({ className = "h-8", iconClassName = "w-8 h-8" }: { className?: string; iconClassName?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <VerivoIcon className={iconClassName} color="#7C3AED" />
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Verivo
        </span>
    </div>
);

export const VerifiedSeal = ({ className = "w-24 h-24" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-in fade-in zoom-in duration-500">
            {/* Circle Text Path */}
            <defs>
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            </defs>

            {/* Outer Rings */}
            <circle cx="50" cy="50" r="48" stroke="#4C1D95" strokeWidth="1" fill="none" className="opacity-20" />
            <circle cx="50" cy="50" r="45" stroke="#7C3AED" strokeWidth="2" fill="none" />

            {/* Text */}
            <text fill="#4C1D95" fontSize="10.5" fontWeight="bold" letterSpacing="1.2" className="uppercase font-mono">
                <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                    Verified • Immutable • Trusted
                </textPath>
            </text>

            {/* Center Icon */}
            <g transform="translate(30, 30) scale(1)">
                <path
                    d="M20 38C20 38 4 28 4 14V8L20 2L36 8V14C36 28 20 38 20 38Z"
                    stroke="#7C3AED"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <path
                    d="M13 18L18 23L27 13"
                    stroke="#7C3AED"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    </div>
);
