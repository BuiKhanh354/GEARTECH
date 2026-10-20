import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layouts/Header'
import Footer from '../components/layouts/Footer'
import AIChatbotWidget from '../components/common/AIChatbotWidget'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const pathname = location.pathname.toLowerCase()

  // Ẩn Header và Footer khi vào trang profile, admin hoặc kênh shop
  const hideHeaderFooter = 
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/shop-manager') ||
    pathname.startsWith('/quan-ly-shop') ||
    pathname === '/shop' ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/settings')

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors duration-200">
      {/* Header dùng chung (ẩn khi vào trang profile/quản trị) */}
      {!hideHeaderFooter && <Header />}

      {/* Nội dung thay đổi theo từng trang */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* Footer (ẩn khi vào trang profile/quản trị) */}
      {!hideHeaderFooter && <Footer />}

      {/* Trợ lý Chatbot AI góc trái màn hình */}
      <AIChatbotWidget />
    </div>
  )
}
