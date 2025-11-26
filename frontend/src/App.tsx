import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';
import SearchPage from './pages/SearchPage';
import WordbookPage from './pages/WordbookPage';
import FlashcardListPage from './pages/FlashcardListPage';
import FlashcardReviewPage from './pages/FlashcardReviewPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 登录/注册页面 */}
                <Route path="/auth" element={<AuthPage />} />

                {/* 受保护的主应用路由 */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* 默认重定向到查词页 */}
                    <Route index element={<Navigate to="/search" replace />} />
                    {/* 查词页 */}
                    <Route path="search" element={<SearchPage />} />
                    {/* 单词本页 */}
                    <Route path="wordbook" element={<WordbookPage />} />
                    {/* 闪卡列表页 */}
                    <Route path="flashcards/list" element={<FlashcardListPage />} />
                    {/* 闪卡复习页 */}
                    <Route path="flashcards/review" element={<FlashcardReviewPage />} />
                    {/* 兼容旧路由，重定向到列表 */}
                    <Route path="flashcard" element={<Navigate to="/flashcards/list" replace />} />
                </Route>

                {/* 404 重定向 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
