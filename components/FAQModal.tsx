
import React, { useState } from 'react';
import { XIcon, ChevronDownIcon } from './icons';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const faqData = [
    {
        question: "Cili është qëllimi kryesor i SPSS Academy Mentor?",
        answer: "Qëllimi kryesor është të shërbejë si një asistent virtual dhe mentor për përdoruesit e softuerit SPSS. Ai ofron udhëzime hap pas hapi për analiza statistikore, metodologji kërkimore dhe raportim akademik profesional sipas stilit APA 7."
    },
    {
        question: "A mund t'i analizojë të dhënat e mia direkt ky chatbot?",
        answer: "Jo, Mentori nuk mund të analizojë drejtpërdrejt skedarët tuaj të të dhënave (.sav). Roli i tij është t'ju udhëzojë se SI ta kryeni JU analizën në SPSS. Ai mund t'ju ofrojë syntax-in e nevojshëm, t'ju shpjegojë hapat dhe t'ju ndihmojë të interpretoni dhe raportoni rezultatet. Ju mund të ngarkoni skedarë si PDF ose CSV për t'i dhënë kontekst."
    },
    {
        question: "Sa të sakta janë përgjigjet e Mentor-it?",
        answer: "Përgjigjet bazohen në literaturë të njohur akademike (si Field, Pallant, Tabachnick) dhe materialet zyrtare të SPSS Academy. Megjithatë, ai mbetet një mjet ndihmës. Për vendime finale dhe punime akademike, gjithmonë verifikoni informacionin dhe konsultohuni me mentorin ose mbikëqyrësin tuaj akademik."
    },
    {
        question: "A mund të më ndihmojë me tema jashtë statistikës?",
        answer: "Jo. Fokusi i Mentor-it është rreptësisht i kufizuar në SPSS, statistika, metodologji shkencore dhe raportim akademik. Çdo pyetje jashtë këtij kuadri do të refuzohet me mirësjellje, duke shpjeguar fushën e tij të ekspertizës."
    },
    {
        question: "Si t'i ruaj bisedat e mia?",
        answer: "Të gjitha bisedat tuaja ruhen automatikisht në shfletuesin tuaj (browser). Ju mund t'i aksesoni, modifikoni ose fshini ato nga paneli anësor në çdo kohë, për sa kohë që përdorni të njëjtin shfletues në të njëjtin kompjuter."
    }
];

const AccordionItem: React.FC<{
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-200">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-4 focus:outline-none hover:bg-gray-50"
            aria-expanded={isOpen}
        >
            <span className="font-semibold text-gray-800">{question}</span>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <div className="p-4 pt-0 text-gray-600">
                <p>{answer}</p>
            </div>
        )}
    </div>
);

export const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                    <h2 className="text-xl font-bold text-gray-800">Pyetjet më të shpeshta (FAQ)</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Mbyll">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                <main className="overflow-y-auto">
                    {faqData.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </main>
            </div>
        </div>
    );
};
