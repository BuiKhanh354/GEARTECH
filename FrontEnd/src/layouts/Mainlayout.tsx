import React from 'react'
import Header from '../components/layouts/Header'
import Footer from '../components/layouts/Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors duration-200">
      {/* Header dùng chung */}
      <Header />

      {/* Nội dung thay đổi theo từng trang */}
      <main className="flex-grow w-full">
        {children}
      </main>

      <Footer />
    </div>
  )
}
