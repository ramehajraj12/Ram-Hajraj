import React, { useState } from 'react';
import { XIcon } from './icons';
import * as authService from '../services/authService';
import type { User } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const user = isLoginView 
                ? authService.signIn(email, password) 
                : authService.signUp(email, password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isLoginView ? 'Hyni në profil' : 'Regjistrohuni'}</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Mbyll">
                            <XIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                required
                                placeholder="emri@shembull.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Fjalëkalimi</label>
                             <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                required
                                minLength={6}
                                placeholder="******"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                             <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {isLoginView ? 'Hyr' : 'Regjistrohu'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
                            className="text-sm text-green-600 hover:underline"
                        >
                            {isLoginView ? 'Nuk keni llogari? Regjistrohuni' : 'Keni llogari? Hyni'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};