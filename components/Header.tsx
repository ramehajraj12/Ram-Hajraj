
import React from 'react';
import { SPSSAcademyLogo, InfoIcon, QuestionIcon } from './icons';

interface HeaderProps {
    onOpenAbout: () => void;
    onOpenFaq: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout, onOpenFaq }) => {
    return (
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                    <SPSSAcademyLogo className="h-10 w-10 text-green-700" />
                    <div>
                         <h1 className="text-xl font-bold text-gray-800">SPSS Talk</h1>
                         <p className="text-sm text-gray-500">SPSS Academy</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onOpenAbout}
                        className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-green-700 transition-colors p-2 rounded-md hover:bg-slate-100"
                        aria-label="Rreth nesh dhe udhëzime"
                    >
                        <InfoIcon className="h-5 w-5" />
                        <span className="hidden md:inline">Rreth Nesh</span>
                    </button>
                    <button 
                        onClick={onOpenFaq} 
                        className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-green-700 transition-colors p-2 rounded-md hover:bg-slate-100"
                        aria-label="Pyetjet më të shpeshta"
                    >
                        <QuestionIcon className="h-5 w-5" />
                        <span className="hidden md:inline">FAQ</span>
                    </button>
                </div>
            </div>
        </header>
    );
}