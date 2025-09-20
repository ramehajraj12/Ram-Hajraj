import React, { useState } from 'react';
import { XIcon, BookIcon, UserIcon, QuestionIcon } from './icons';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'academy' | 'founder' | 'guide';

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center space-x-2 p-3 text-sm font-medium border-b-2 transition-colors ${
            isActive
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
        role="tab"
        aria-selected={isActive}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const AcademyContent: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Mirë se vini në SPSS Academy</h3>
        <p>
            SPSS Academy është qendra juaj e specializuar për të zotëruar softuerin SPSS dhe për të thelluar njohuritë në analizën statistikore dhe metodologjinë e hulumtimit shkencor.
        </p>
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">Misioni Ynë</h4>
            <p>
                Misioni i SPSS Academy është të ofrojë arsimim cilësor dhe mbështetje praktike për studentë, studiues dhe profesionistë, duke i fuqizuar ata me aftësitë e nevojshme për të kryer analiza statistikore të sakta dhe kërkime shkencore me integritet.
            </p>
        </div>
         <div>
            <h4 className="font-semibold text-gray-700 mb-2">Vizioni Ynë</h4>
            <p>
                Të bëhemi qendra lider në rajon për trajnimin në SPSS dhe metodologjinë e hulumtimit shkencor, duke vendosur standarde të reja të ekselencës akademike dhe profesionalizmit.
            </p>
        </div>
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">Vlerat Tona Themelore</h4>
            <p className="mb-2">Filozofia jonë udhëhiqet nga tri parime thelbësore:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Pragmatizëm:</strong> Fokusohemi në zgjidhje praktike dhe të aplikueshme që japin rezultate reale.</li>
                <li><strong>Profesionalizëm:</strong> Ofrojmë shërbime të nivelit më të lartë, duke respektuar standardet etike dhe akademike.</li>
                <li><strong>Integritet Akademik:</strong> Promovojmë ndershmëri, saktësi dhe përgjegjësi në të gjitha aspektet e punës kërkimore.</li>
            </ul>
        </div>
    </div>
);

const FounderContent: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Themeluesi: Ramë Hajraj</h3>
        <p>
            <strong>SPSS Academy</strong> është themeluar nga <strong>Ramë Hajraj</strong>, një ekspert me përvojë të gjatë dhe pasion të madh në menaxhim, statistikë dhe konsulencë akademike.
        </p>
        <p>
           Përvoja e tij e gjerë përfshin punë akademike, trajnime të specializuara statistikore dhe konsulenca kërkimore, duke e bërë SPSS Academy një pikë referimi serioze dhe të besueshme për përdorimin e SPSS-it dhe metodologjinë shkencore në rajon.
        </p>
        <p className="border-t pt-4 text-sm text-gray-600">
           <em>"Ky projekt është dëshmi se edhe ne, shqiptarët në diasporë, mund të krijojmë platforma të nivelit ndërkombëtar që i shërbejnë studentëve dhe studiuesve."</em>
        </p>
    </div>
);

const GuideContent: React.FC = () => (
     <div className="space-y-4">
        <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Si të bëni pyetje?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li>Formuloni pyetjen qartë dhe konkretisht, duke përfshirë: variablat që përdorni, shkallën e matjes (nominale, intervalore, etj.), dhe llojin e analizës që dëshironi.</li>
                <li>Nëse pyetja është shumë e përgjithshme, Mentori do t'ju kërkojë informacion shtesë për të dhënë një përgjigje të saktë.</li>
                <li>Mbani mend: Mentori <strong>nuk shpik përgjigje</strong>. Ai mbështetet vetëm në literaturë shkencore për të garantuar saktësi maksimale.</li>
                <li>Pyetjet duhet të fokusohen vetëm në: SPSS, statistika, metodologji shkencore dhe raportim akademik.</li>
            </ul>
        </section>
        <section>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Shembuj të pyetjeve të pranueshme:</h4>
            <ul className="list-disc list-inside space-y-1 pl-4 bg-green-50 p-3 rounded-md border border-green-200">
                <li>"Si të llogaris Cronbach’s Alpha për një pyetësor me 20 variabla në SPSS?"</li>
                <li>"Si të raportoj një ANOVA njëkahëshe sipas APA 7?"</li>
                <li>"Cilat janë hapat për të bërë një analizë faktoriale eksploruese?"</li>
            </ul>
        </section>
        <section>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Shembuj pyetjesh të papranueshme:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4 bg-red-50 p-3 rounded-md border border-red-200">
                <li>"Si të gatuaj darkë?" (jashtë fushës së SPSS-it dhe statistikës).</li>
                <li>"Më jep një këshillë personale për jetë" (jo në fushën e këtij chat-i).</li>
            </ul>
        </section>
    </div>
);


export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('academy');

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-modal-in"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Rreth SPSS Academy</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Mbyll">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                
                <div className="border-b border-gray-200 flex-shrink-0">
                    <nav className="flex" role="tablist" aria-label="Rreth Nesh">
                        <TabButton
                            label="SPSS Academy"
                            icon={<BookIcon className="w-5 h-5" />}
                            isActive={activeTab === 'academy'}
                            onClick={() => setActiveTab('academy')}
                        />
                        <TabButton
                            label="Themeluesi"
                            icon={<UserIcon className="w-5 h-5" />}
                            isActive={activeTab === 'founder'}
                            onClick={() => setActiveTab('founder')}
                        />
                        <TabButton
                            label="Udhëzime"
                            icon={<QuestionIcon className="w-5 h-5" />}
                            isActive={activeTab === 'guide'}
                            onClick={() => setActiveTab('guide')}
                        />
                    </nav>
                </div>
                
                <main className="p-6 text-gray-700 overflow-y-auto">
                    {activeTab === 'academy' && <AcademyContent />}
                    {activeTab === 'founder' && <FounderContent />}
                    {activeTab === 'guide' && <GuideContent />}
                </main>
            </div>
        </div>
    );
};