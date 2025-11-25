import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';
import SearchPage from './pages/SearchPage';
import WordbookPage from './pages/WordbookPage';
import FlashcardPage from './pages/FlashcardPage';
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
                    {/* 闪卡页 */}
                    <Route path="flashcard" element={<FlashcardPage />} />
                </Route>

                {/* 404 重定向 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
