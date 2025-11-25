/**
 * 记忆联想图卡片组件(功能占位)
 * 将来会对接词生图 API 生成记忆辅助图片
 */
interface MemoryImageCardProps {
    word: string;
}

function MemoryImageCard({ word }: MemoryImageCardProps) {
    // 重新生成图片(占位功能)
    const handleRegenerate = () => {
        // TODO: 将来对接词生图 API(如 DALL-E、Stable Diffusion 等)
        console.log(`重新生成单词 "${word}" 的记忆联想图功能待实现`);
        alert(`单词 "${word}" 的图片生成功能即将上线!`);
    };

    return (
        <div className="glass-strong rounded-3xl shadow-glass p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                记忆联想图
                <span className="text-sm font-normal text-gray-500">(功能占位)</span>
            </h2>

            {/* 占位图片区域 */}
            <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-20 h-20 text-white mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white text-lg font-medium">
                            AI 生成的记忆联想图
                        </p>
                        <p className="text-white text-sm opacity-80 mt-2">
                            将来会根据单词含义自动生成辅助记忆的图片
                        </p>
                    </div>
                </div>

                {/* 重新生成按钮 */}
                <button
                    onClick={handleRegenerate}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                >
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-gray-700 font-medium">重新生成</span>
                </button>
            </div>

            <p className="text-gray-500 text-sm mt-4 text-center">
                💡 提示:此功能将对接 AI 图片生成 API,帮助你通过视觉联想加深单词记忆
            </p>
        </div>
    );
}

export default MemoryImageCard;
