import React, { useState, useEffect } from 'react';
import type { GroundingChunk } from '@google/genai';
import type { ChatMessage } from '../types';
import { UserIcon, FileIcon, CopyIcon, LinkIcon, SPSSAcademyLogo } from './icons';

interface MessageProps {
    message: ChatMessage;
    isLastMessage: boolean;
    isLoading: boolean;
}

const PulsingDots = () => (
    <div className="flex items-center space-x-1.5">
        <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0s' }}></span>
        <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
        <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

// Component to render a table with a copy button
const TableWithCopyButton: React.FC<{ tableHtml: string }> = ({ tableHtml }) => {
    const [copyText, setCopyText] = useState('Kopjo');

    const handleCopy = () => {
        try {
            const blob = new Blob([tableHtml], { type: 'text/html' });
            const data = [new ClipboardItem({ 'text/html': blob })];
            
            navigator.clipboard.write(data).then(() => {
                setCopyText('Kopjuar!');
                setTimeout(() => setCopyText('Kopjo'), 2000);
            }, (err) => {
                 console.error('Nuk u arrit të kopjohet tabela: ', err);
                 setCopyText('Gabim');
                 setTimeout(() => setCopyText('Kopjo'), 2000);
            });
        } catch (error) {
            console.error('Clipboard API nuk mbështetet ose dështoi:', error);
            const plainText = new DOMParser().parseFromString(tableHtml, 'text/html').body.textContent || '';
            navigator.clipboard.writeText(plainText).then(() => {
                 setCopyText('Kopjuar (tekst)!');
                 setTimeout(() => setCopyText('Kopjo'), 2000);
            });
        }
    };

    return (
        <div className="relative group my-4">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-slate-200 text-slate-800 text-xs font-semibold py-1 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-300 hover:bg-slate-300 flex items-center space-x-1.5"
                aria-label="Kopjo tabelën"
            >
                <CopyIcon className="w-3.5 h-3.5" />
                <span>{copyText}</span>
            </button>
            <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: tableHtml }} />
        </div>
    );
};

// Helper function to format plain text segments (handles bold and line breaks)
const formatPlainText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
        if (part.startsWith('**')) {
            return <strong key={index} className="font-semibold text-slate-900">{part.replace(/\*\*/g, '')}</strong>;
        }
        return part.split('\n').map((line, i, arr) => (
            <React.Fragment key={`${index}-${i}`}>
                {line}
                {i < arr.length - 1 && <br />}
            </React.Fragment>
        ));
    });
};

// Main function to format the entire message content
const formatText = (text: string) => {
    const sections = text.split(/(```[\s\S]*?```|(?:\n|^)(?:\|[^\n\r]*\|(?:\r?\n|\r?))+)/g).filter(Boolean);

    return sections.map((part, index) => {
        if (part.startsWith('```')) {
            const code = part.replace(/```/g, '').trim();
            return (
                <pre key={index} className="bg-slate-800 text-white p-4 rounded-lg my-3 overflow-x-auto text-sm font-mono shadow-inner">
                    <code>{code}</code>
                </pre>
            );
        }

        if (part.trim().startsWith('|')) {
            const rows = part.trim().split('\n').map(r => r.trim()).filter(r => r.startsWith('|') && r.endsWith('|'));
            if (rows.length < 2 || !rows[1].includes('---')) {
                 return <div key={index}>{formatPlainText(part)}</div>;
            }

            const tableStyles = "width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em; text-align: left; border-top: 2px solid #333; border-bottom: 2px solid #333;";
            const thTdStyles = "padding: 0.6em 0.8em; text-align: left;";
            const theadStyles = "border-bottom: 1.5px solid #333;";

            const headerCells = rows[0].split('|').slice(1, -1).map(cell => `<th style="${thTdStyles}">${cell.trim()}</th>`).join('');
            const bodyRows = rows.slice(2).map(row => {
                 const cells = row.split('|').slice(1, -1).map(cell => `<td style="${thTdStyles}">${cell.trim()}</td>`).join('');
                 return `<tr>${cells}</tr>`;
            }).join('');
            
            const tableHtml = `<table style="${tableStyles}"><thead style="${theadStyles}"><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
            
            return <TableWithCopyButton key={index} tableHtml={tableHtml} />;
        }
        
        return <React.Fragment key={index}>{formatPlainText(part)}</React.Fragment>;
    });
};

const Sources: React.FC<{ sources: GroundingChunk[] }> = ({ sources }) => (
    <div className="mt-4 pt-3 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            Burimet
        </h4>
        <ul className="space-y-1.5 text-xs">
            {sources.map((source, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-slate-500 mr-2">{index + 1}.</span>
                    <a
                        href={source.web?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline truncate"
                        title={source.web?.title}
                    >
                        {source.web?.title || source.web?.uri}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);


export const Message: React.FC<MessageProps> = ({ message, isLastMessage, isLoading }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const isUser = message.role === 'user';
    const showTypingIndicator = !isUser && isLastMessage && isLoading;
    
    const containerClasses = isUser ? "flex justify-end items-end space-x-3" : "flex justify-start items-end space-x-3";
    const bubbleClasses = isUser
        ? "bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl rounded-br-none shadow-lg"
        : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-none shadow-md";
    const errorClasses = message.isError ? "bg-red-100 border-red-500 text-red-800" : "";
    
    const Icon = isUser ? UserIcon : SPSSAcademyLogo;
    const iconContainerClasses = isUser
      ? "flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center order-2 shadow-sm"
      : "flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center order-1 shadow-sm";

    const animationClasses = `transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`;

    return (
        <div className={`${containerClasses} ${animationClasses}`}>
            {!isUser && (
                 <div className={iconContainerClasses}>
                    <Icon className="w-7 h-7 text-green-700" />
                </div>
            )}
            <div className={`p-4 max-w-2xl ${bubbleClasses} ${errorClasses} order-1`}>
                {message.file && (
                    <div className="mb-2 p-2 bg-black/10 rounded-lg flex items-center space-x-2 text-sm border border-white/20">
                        <FileIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{message.file.name}</span>
                    </div>
                )}
                 {isUser ? (
                    <div className="whitespace-pre-wrap">{message.text}</div>
                 ) : (
                    <>
                        {showTypingIndicator && message.text.length === 0 ? (
                            <PulsingDots />
                        ) : (
                            <>
                                <div className="text-[15px] leading-relaxed max-w-none prose prose-slate">{formatText(message.text)}</div>
                                {message.sources && message.sources.length > 0 && <Sources sources={message.sources} />}
                            </>
                        )}
                    </>
                 )}
            </div>
             {isUser && (
                 <div className={iconContainerClasses}>
                    <Icon className="w-6 h-6 text-slate-600" />
                </div>
            )}
        </div>
    );
};