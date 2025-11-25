import React, { useState } from 'react';
import { flashcardApi } from '../utils/flashcardApi';

interface FlashcardButtonProps {
    wordId?: number;
}

export const FlashcardButton: React.FC<FlashcardButtonProps> = ({ wordId }) => {
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!wordId) {
            alert('无法创建：缺少单词 ID');
            return;
        }

        setIsCreating(true);
        try {
            await flashcardApi.create(wordId);
            alert('已为该单词创建闪卡');
        } catch (error: any) {
            console.error('创建闪卡失败:', error);
            alert('创建失败，请重试');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span className="text-xl">🎴</span>
            {isCreating ? '创建中...' : '为该单词创建闪卡'}
        </button>
    );
};
