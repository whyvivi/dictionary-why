import { useEffect, useState } from 'react';
import { imageApi } from '../utils/imageApi';

/**
 * 记忆联想图卡片组件：放在详情页下方，手动点击生成插画
 */
interface MemoryImageCardProps {
    word: string;
}

function MemoryImageCard({ word }: MemoryImageCardProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [debugMessage, setDebugMessage] = useState<string | null>(null);

    // 单词变化时重置状态
    useEffect(() => {
        setImageUrl(null);
        setImageError(null);
        setDebugMessage(null);
    }, [word]);

    // 手动生成或重新生成图片
    const handleGenerate = async () => {
        if (!word) {
            setImageError('单词不能为空');
            setDebugMessage('未提供有效单词，无法请求配图');
            return;
        }
        try {
            setIsImageLoading(true);
            setImageError(null);
            setDebugMessage(null);
            const url = await imageApi.generateWordImage(word);
            setImageUrl(url);
        } catch (error: any) {
            console.error('生成单词配图失败:', error);
            setImageError('生成单词配图失败，请稍后重试');
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                String(error);
            setDebugMessage(`错误详情：${message}`);
        } finally {
            setIsImageLoading(false);
        }
    };

    return (
        <div className="glass-strong rounded-3xl shadow-glass p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                记忆联想图
                <span className="text-sm font-normal text-gray-500">(图片由 AI 生成)</span>
            </h2>

            <div className="flex justify-end mb-3">
                <button
                    onClick={handleGenerate}
                    disabled={isImageLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full shadow-lg transition-all disabled:opacity-60 border border-purple-100"
                >
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-gray-700 font-medium">{isImageLoading ? '正在生成…' : imageUrl ? '重新生成' : '生成图片'}</span>
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/70 shadow-inner bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center min-h-[520px]">
                {isImageLoading && (
                    <div className="flex items-center justify-center text-gray-50 text-sm">
                        正在为单词生成插画…
                    </div>
                )}

                {!isImageLoading && imageError && (
                    <div className="flex flex-col items-center justify-center text-red-100 text-sm gap-2 px-6 text-center">
                        <span>{imageError}</span>
                        {debugMessage && (
                            <span className="text-xs text-red-100/80">
                                {debugMessage}
                            </span>
                        )}
                    </div>
                )}

                {!isImageLoading && !imageError && imageUrl && (
                    <img
                        src={imageUrl}
                        alt={`Illustration for ${word}`}
                        className="w-full h-full object-cover"
                    />
                )}

                {!isImageLoading && !imageError && !imageUrl && (
                    <div className="text-center text-white px-4">
                        <svg className="w-20 h-20 text-white mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white text-lg font-medium">AI 生成的记忆联想图</p>
                        <p className="text-white text-sm opacity-80 mt-2">点击右侧“生成图片”获取插画</p>
                    </div>
                )}
            </div>

            <p className="text-gray-500 text-sm mt-4 text-center">
                💡 提示: 点击“生成图片”即可调用图像生成 API，辅助你通过视觉联想加深单词记忆
            </p>
        </div>
    );
}

export default MemoryImageCard;
