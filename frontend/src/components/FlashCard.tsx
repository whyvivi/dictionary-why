import React from 'react';
import { Flashcard } from '../utils/flashcardApi';

interface FlashCardProps {
    card: Flashcard;
    onFlip: () => void;
    isFlipped: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({ card, onFlip, isFlipped }) => {
    return (
        <div className="w-full max-w-2xl mx-auto aspect-[3/2] perspective-1000">
            <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''
                    }`}
                onClick={onFlip}
            >
                {/* 正面 */}
                <div className="absolute w-full h-full backface-hidden bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl flex flex-col items-center justify-center p-8">
                    <div className="text-sm text-gray-500 uppercase tracking-widest mb-4">Word</div>
                    <h2 className="text-5xl font-bold text-gray-800 mb-4">{card.spelling}</h2>
                    <div className="flex gap-4 text-gray-600 font-mono text-lg">
                        {card.phoneticUk && <span>UK /{card.phoneticUk}/</span>}
                        {card.phoneticUs && <span>US /{card.phoneticUs}/</span>}
                    </div>
                    <div className="absolute bottom-8 text-gray-400 text-sm animate-pulse">
                        点击翻面查看释义
                    </div>
                </div>

                {/* 反面 */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl flex flex-col p-8 overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">{card.spelling}</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        {card.senses.map((sense, index) => (
                            <div key={index} className="bg-white/40 rounded-xl p-4 border border-white/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-bold italic">
                                        {sense.partOfSpeech}
                                    </span>
                                </div>
                                <p className="text-gray-800 font-medium mb-1">{sense.definitionEn}</p>
                                {sense.definitionZh && (
                                    <p className="text-gray-600 text-sm mb-2">{sense.definitionZh}</p>
                                )}
                                {sense.examples && sense.examples.length > 0 && (
                                    <div className="mt-2 pl-3 border-l-2 border-blue-200">
                                        <p className="text-gray-600 italic text-sm">
                                            "{sense.examples[0].sentenceEn}"
                                        </p>
                                        {sense.examples[0].sentenceZh && (
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {sense.examples[0].sentenceZh}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
