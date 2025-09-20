import React from 'react';
import { SPSSAcademyLogo } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <SPSSAcademyLogo className="h-10 w-10 text-green-700" />
                    <div>
                         <h1 className="text-xl font-bold text-gray-800">SPSS Academy Mentor</h1>
                         <p className="text-sm text-gray-500">Ju prezantojmë: Mentori</p>
                    </div>
                </div>
            </div>
        </header>
    );
}