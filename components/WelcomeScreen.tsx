import React from 'react';
import { BookIcon, CheckCircleIcon, QuestionIcon } from './icons';

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/80 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300">
        <div className="mb-4 text-white bg-gradient-to-br from-green-600 to-teal-600 p-3 rounded-full shadow-lg">{icon}</div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600">{children}</p>
    </div>
);

export const WelcomeScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-main-gradient p-4 md:p-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-slate-800 mb-3">Mirë se vini te <span className="text-gradient">Mentori!</span></h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">Për herë të parë në gjuhën shqipe, mentori juaj virtual për SPSS dhe kërkime shkencore. <br/> <span className="font-semibold text-slate-700">Gjithmonë i saktë, gjithmonë i disponueshëm, gjithmonë me integritet akademik.</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                <InfoCard icon={<QuestionIcon className="h-8 w-8" />} title="Si të më pyesni?">
                    Më trajtoni si mentorin tuaj. Më jepni kontekst për studimin tuaj: specifikoni variablat, shkallën e matjes dhe analizën që kërkoni.
                </InfoCard>
                <InfoCard icon={<CheckCircleIcon className="h-8 w-8" />} title="Çfarë mund të mësoni?">
                    Më pyesni: "Më trego si të llogaris Cronbach’s Alpha" ose "Cilat janë hapat për një analizë faktoriale eksploruese në SPSS?"
                </InfoCard>
                <InfoCard icon={<BookIcon className="h-8 w-8" />} title="Baza ime e njohurive: Gabim Zero">
                    Unë nuk shpik përgjigje. Njohuritë e mia bazohen rreptësisht në literaturën më të mirë akademike (Field, Pallant, etj.) për të garantuar saktësi absolute.
                </InfoCard>
            </div>
            <p className="text-center text-slate-500 text-sm mt-12">
                Shkruani pyetjen tuaj më poshtë për të filluar leksionin tonë.
            </p>
        </div>
    );
};