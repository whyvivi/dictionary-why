import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';

/**
 * 主布局组件
 * 包含固定的 Header、底部 TabBar 和中间可滚动的内容区域
 */
function MainLayout() {
    return (
        <div className="min-h-screen sky-gradient">
            {/* 顶部 Header(固定) */}
            <Header />

            {/* 中间内容区域(可滚动) */}
            <main className="pt-16 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Outlet />
                </div>
            </main>

            {/* 底部导航栏(固定) */}
            <TabBar />
        </div>
    );
}

export default MainLayout;
