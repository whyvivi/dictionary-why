import React from 'react';
import { Notebook } from '../utils/notebookApi';

interface NotebookListProps {
    notebooks: Notebook[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({ notebooks, selectedId, onSelect }) => {
    return (
        <div className="space-y-3">
            {notebooks.map((notebook) => (
                <div
                    key={notebook.id}
                    onClick={() => onSelect(notebook.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${selectedId === notebook.id
                            ? 'bg-white/40 border-blue-300 shadow-lg scale-[1.02]'
                            : 'bg-white/20 border-white/30 hover:bg-white/30'
                        }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                {notebook.name}
                                {notebook.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">默认</span>
                                )}
                            </h3>
                            {notebook.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{notebook.description}</p>
                            )}
                        </div>
                        <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded-lg text-gray-500">
                            {notebook.wordCount || 0} 词
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
