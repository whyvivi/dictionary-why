import { useState, useEffect } from 'react';
import { NotebookList } from '../components/NotebookList';
import { NotebookDetail } from '../components/NotebookDetail';
import { CreateNotebookDialog } from '../components/CreateNotebookDialog';
import { GeneratedArticle } from '../components/GeneratedArticle';
import { notebookApi, Notebook, NotebookDetail as NotebookDetailType, ArticleDetail } from '../utils/notebookApi';

function WordbookPage() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [currentDetail, setCurrentDetail] = useState<NotebookDetailType | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState<ArticleDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // 加载单词本列表
    const loadNotebooks = async () => {
        try {
            const list = await notebookApi.getAll();
            setNotebooks(list);
            // 如果没有选中项且列表不为空，默认选中第一个（通常是默认单词本）
            if (!selectedId && list.length > 0) {
                setSelectedId(list[0].id);
            }
        } catch (error) {
            console.error('加载单词本失败:', error);
        }
    };

    // 加载单词本详情
    const loadDetail = async (id: number) => {
        setIsLoading(true);
        try {
            const detail = await notebookApi.getDetail(id);
            setCurrentDetail(detail);
            setGeneratedArticle(null); // 切换单词本时清空文章
        } catch (error) {
            console.error('加载详情失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 初始化加载
    useEffect(() => {
        loadNotebooks();
    }, []);

    // 监听选中变化
    useEffect(() => {
        if (selectedId) {
            loadDetail(selectedId);
        }
    }, [selectedId]);

    // 创建单词本
    const handleCreateNotebook = async (name: string, description: string) => {
        try {
            await notebookApi.create(name, description);
            await loadNotebooks(); // 刷新列表
        } catch (error) {
            console.error('创建单词本失败:', error);
            alert('创建失败，请重试');
        }
    };

    // 移除单词
    const handleRemoveWord = async (wordId: number) => {
        if (!selectedId) return;
        try {
            await notebookApi.removeWord(selectedId, wordId);
            // 刷新详情
            await loadDetail(selectedId);
            // 刷新列表（更新计数）
            loadNotebooks();
        } catch (error) {
            console.error('移除单词失败:', error);
            alert('移除失败，请重试');
        }
    };

    // 生成文章
    const handleGenerateArticle = async () => {
        if (!selectedId) return;
        setIsGenerating(true);
        try {
            const article = await notebookApi.generateArticle(selectedId);
            setGeneratedArticle(article);
        } catch (error) {
            console.error('生成文章失败:', error);
            alert('生成文章失败，请重试');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex gap-6">
            {/* 左侧列表区域 */}
            <div className="w-1/3 flex flex-col bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/20">
                    <h2 className="font-bold text-gray-800 text-lg">我的单词本</h2>
                    <button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="p-2 bg-white/50 hover:bg-white/80 rounded-lg transition-colors text-blue-600"
                        title="新建单词本"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <NotebookList
                        notebooks={notebooks}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>
            </div>

            {/* 右侧详情区域 */}
            <div className="w-2/3 flex flex-col bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden relative">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                        加载中...
                    </div>
                ) : currentDetail ? (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <NotebookDetail
                            detail={currentDetail}
                            onRemoveWord={handleRemoveWord}
                            onGenerateArticle={handleGenerateArticle}
                            isGenerating={isGenerating}
                        />
                        {generatedArticle && (
                            <GeneratedArticle
                                title={generatedArticle.title}
                                content={generatedArticle.content}
                                onClose={() => setGeneratedArticle(null)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        选择一个单词本查看详情
                    </div>
                )}
            </div>

            <CreateNotebookDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateNotebook}
            />
        </div>
    );
}

export default WordbookPage;
