import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ChatTeardropDots, 
  X, 
  PaperPlaneTilt, 
  Sparkle, 
  Robot, 
  ArrowsClockwise, 
  Minus
} from '@phosphor-icons/react'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  time: string
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Xin chào chiến hữu! 🤖 Tôi là Trợ lý AI của GearTech. Tôi có thể hỗ trợ bạn tìm cấu hình PC, kiểm tra linh kiện chính hãng, chính sách bảo hành 1 đổi 1 hoặc hướng dẫn mua sắm. Bạn cần hỗ trợ gì hôm nay?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const quickQuestions = [
    '🖥️ Tư vấn cấu hình PC Gaming 25 triệu',
    '🛡️ Chính sách bảo hành 1 đổi 1',
    '🏪 Làm sao để mở shop trên GearTech?',
    '⚡ GPU RTX 40/50 series có sẵn hàng không?'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate smart AI reply for initial prototype (sẽ phát triển LLM backend sau)
    setTimeout(() => {
      let replyText = 'Cảm ơn câu hỏi của bạn! Tính năng Chatbot AI đang trong giai đoạn thử nghiệm (Beta). Bạn có thể liên hệ hotline 1900 6868 hoặc duyệt danh mục thiết bị để được tư vấn nhanh nhất.'
      
      const q = query.toLowerCase()
      if (q.includes('pc') || q.includes('cấu hình') || q.includes('build')) {
        replyText = '🔥 Với phân khúc tầm trung từ 20-30 triệu, GearTech khuyến nghị cấu hình: CPU Intel Core i5 14600KF / AMD Ryzen 5 7600, RAM 32GB DDR5, VGA RTX 4060Ti / 4070 Super và nguồn 750W chuẩn Gold để chiến mượt mọi game AAA!'
      } else if (q.includes('bảo hành') || q.includes('đổi trả')) {
        replyText = '🛡️ GearTech cam kết bảo hành 1 ĐỔI 1 trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất. Mọi sản phẩm đều được kích hoạt bảo hành điện tử chính hãng từ NPP.'
      } else if (q.includes('mở shop') || q.includes('bán hàng') || q.includes('đối tác')) {
        replyText = '🏪 Bạn có thể dễ dàng mở shop bằng cách truy cập mục "Cửa hàng & Shop" hoặc vào Hồ sơ cá nhân > Đăng ký mở shop. Đội ngũ kiểm duyệt GearTech sẽ phản hồi trong 24h.'
      } else if (q.includes('vga') || q.includes('rtx') || q.includes('40') || q.includes('50')) {
        replyText = '⚡ Toàn bộ dòng card đồ họa ASUS ROG, MSI Gaming X, Gigabyte AORUS đều đang sẵn hàng tại kho với chính sách trả góp 0% và bảo hiểm vận chuyển 100%!'
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      
      {/* 1. Chat Window Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff4655] text-white flex items-center justify-center shadow-[0_0_12px_rgba(255,70,85,0.4)]">
                  <Robot size={20} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider">GEARTECH AI</h3>
                    <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-bold bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/40 uppercase">
                      BETA
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Trực tuyến • Sẵn sàng hỗ trợ
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center transition-colors"
                  title="Thu nhỏ"
                >
                  <Minus size={14} weight="bold" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center transition-colors"
                  title="Đóng chat"
                >
                  <X size={15} weight="bold" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/60 dark:bg-zinc-900/30">
              {messages.map((m) => {
                const isAI = m.sender === 'ai'
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-7 h-7 rounded-lg bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0 mt-0.5 border border-[#ff4655]/20 text-xs">
                        <Sparkle size={14} weight="fill" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-sm ${
                      isAI 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-sm'
                        : 'bg-[#ff4655] text-white rounded-tr-sm font-medium'
                    }`}>
                      <p>{m.text}</p>
                      <span className={`text-[8px] font-mono block text-right ${isAI ? 'text-zinc-400' : 'text-white/70'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-1">
                  <div className="w-6 h-6 rounded-lg bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0">
                    <ArrowsClockwise size={12} className="animate-spin" />
                  </div>
                  <span>Trợ lý AI đang phản hồi...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 3 && (
              <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex gap-1.5 overflow-x-auto scrollbar-none">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="shrink-0 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-[#ff4655]/10 hover:text-[#ff4655] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi đáp linh kiện, PC, bảo hành..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655] transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </button>
            </form>

            <div className="px-3 py-1 bg-zinc-100/70 dark:bg-zinc-900/60 text-center text-[8px] font-mono text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50">
              Giai đoạn thử nghiệm • Trí tuệ nhân tạo GearTech Copilot
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Action Button (Góc Phải Màn Hình) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#ff4655] to-red-600 hover:from-red-600 hover:to-[#ff4655] text-white p-3.5 rounded-full shadow-2xl shadow-[#ff4655]/40 border-2 border-white/20 transition-all cursor-pointer"
        aria-label="Trợ lý AI GearTech"
      >
        <span className="relative">
          <ChatTeardropDots size={24} weight="fill" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-950 animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-950"></span>
        </span>

        {/* Expandable Label on Hover */}
        <span className="text-xs font-black uppercase tracking-wider pr-1 hidden sm:inline-block">
          AI Trợ Lý
        </span>

        {/* Red Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-[#ff4655] blur-md opacity-40 group-hover:opacity-75 transition-opacity -z-10"></div>
      </motion.button>

    </div>
  )
}
