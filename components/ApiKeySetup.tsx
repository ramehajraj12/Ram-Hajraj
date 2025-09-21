import React, { useState } from 'react';

interface ApiKeySetupProps {
    onApiKeySubmit: (apiKey: string) => void;
    initialError: string | null;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySubmit, initialError }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState<string | null>(initialError);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError("Ju lutem, shkruani një API Key të vlefshëm.");
            return;
        }
        setError(null);
        onApiKeySubmit(apiKey);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-main-gradient p-4 md:p-8">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-xl border border-slate-200/80 shadow-lg max-w-lg w-full text-center animate-modal-in">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Konfigurimi i API Key</h2>
                <p className="text-slate-600 mb-6">
                    Për të përdorur Mentorin, ju lutem vendosni API Key-in tuaj nga Google AI Studio.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            if (error) setError(null); // Clear error on new input
                        }}
                        placeholder="Vendosni API Key-in tuaj këtu..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        aria-label="API Key Input"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-br from-green-600 to-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Ruaj dhe Fillo Bisedën</span>
                    </button>
                </form>
                 <p className="text-xs text-slate-500 mt-4">
                    Nuk keni një çelës? Merrni një falas te <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-medium">Google AI Studio</a>.
                </p>
            </div>
        </div>
    );
};