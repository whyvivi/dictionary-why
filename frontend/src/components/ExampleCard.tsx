import { useState } from 'react';
import { WordSense } from '../utils/wordApi';

interface ExampleCardProps {
    senses: WordSense[];
}

/**
 * 例句卡片组件
 * 显示单词的例句(英文 + 中文翻译)
 */
function ExampleCard({ senses }: ExampleCardProps) {
    const [showAll, setShowAll] = useState(false);

    // 收集所有例句
    const allExamples = senses.flatMap(sense =>
        sense.examples.map(ex => ({
            ...ex,
            pos: sense.pos,
        }))
    );

    // 默认显示前 2 条
    const displayedExamples = showAll ? allExamples : allExamples.slice(0, 2);

    if (allExamples.length === 0) {
        return null; // 没有例句就不显示这个卡片
    }

    return (
        <div className="glass-strong rounded-3xl shadow-glass p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                例句
            </h2>

            <div className="space-y-4">
                {displayedExamples.map((example, index) => (
                    <div key={index} className="bg-white bg-opacity-50 rounded-2xl p-4">
                        {/* 英文例句 */}
                        {example.en && (
                            <p className="text-gray-800 text-lg mb-2 leading-relaxed">
                                "{example.en}"
                            </p>
                        )}

                        {/* 中文翻译 */}
                        {example.cn ? (
                            <p className="text-gray-600">
                                "{example.cn}"
                            </p>
                        ) : (
                            example.en && (
                                <p className="text-gray-400 text-sm italic">
                                    中文翻译待补充
                                </p>
                            )
                        )}
                    </div>
                ))}
            </div>

            {/* 查看更多按钮 */}
            {allExamples.length > 2 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        {showAll ? '收起' : `查看更多 (${allExamples.length - 2} 条)`}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ExampleCard;
