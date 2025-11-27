import { WordSense } from '../utils/wordApi';

interface DefinitionCardProps {
    senses: WordSense[];
}

/**
 * 释义卡片组件
 * 显示单词的各个义项(词性、英文释义、中文释义)
 */
function DefinitionCard({ senses }: DefinitionCardProps) {
    return (
        <div className="glass-strong rounded-3xl shadow-glass p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                释义
            </h2>

            <div className="space-y-6">
                {senses.map((sense) => (
                    <div key={sense.id} className="border-l-4 border-blue-400 pl-4">
                        {/* 词性标签 */}
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {sense.pos}
                            </span>
                        </div>

                        {/* 英文释义 */}
                        <p className="text-gray-800 text-lg mb-2">
                            {sense.enDefinition}
                        </p>

                        {/* 中文释义 */}
                        {sense.cn ? (
                            <p className="text-gray-600">
                                {sense.cn}
                            </p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">
                                中文释义待补充
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {senses.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无释义信息</p>
            )}
        </div>
    );
}

export default DefinitionCard;
