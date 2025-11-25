import React from 'react';

interface FlashCardControllerProps {
    onReview: (result: 'good' | 'again') => void;
    remainingCount: number;
}

export const FlashCardController: React.FC<FlashCardControllerProps> = ({ onReview, remainingCount }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="flex justify-center gap-6">
                <button
                    onClick={() => onReview('again')}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg border border-red-200"
                >
                    <span className="block text-2xl mb-1">🤔</span>
                    没记住
                </button>
                <button
                    onClick={() => onReview('good')}
                    className="flex-1 py-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg border border-green-200"
                >
                    <span className="block text-2xl mb-1">😎</span>
                    记住了
                </button>
            </div>
            <div className="text-center mt-4 text-gray-500 text-sm">
                今日剩余待复习: {remainingCount}
            </div>
        </div>
    );
};
