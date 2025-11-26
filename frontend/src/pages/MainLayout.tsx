import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';

/**
 * 主布局组件
 * 应用新海诚风格主题：天空渐变背景 + 装饰图片
 */
function MainLayout() {
    return (
        <div className="min-h-screen relative overflow-hidden shinkai-bg">
            {/* 顶部 Header(固定) */}
            <Header />

            {/* 中间内容区域(可滚动) */}
            <main className="pt-16 pb-20 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Outlet />
                </div>
            </main>

            {/* 底部导航栏(固定) */}
            <TabBar />

            {/* 装饰云朵 - 使用 CSS 动画漂浮 */}
            <div className="fixed top-20 right-[10%] w-32 opacity-60 pointer-events-none select-none z-0 animate-float-slow">
                <img src={image2} alt="" className="w-full" />
            </div>
            <div className="fixed bottom-32 left-[5%] w-24 opacity-50 pointer-events-none select-none z-0 animate-float-slower">
                <img src={image3} alt="" className="w-full" />
            </div>

            {/* 光晕效果 - 纯 CSS 实现 */}
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-300/20 rounded-full blur-[120px] pointer-events-none z-0" />
        </div>
    );
}

export default MainLayout;
