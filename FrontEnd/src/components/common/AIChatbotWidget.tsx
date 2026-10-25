import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { 
  ChatTeardropDots, 
  X, 
  PaperPlaneTilt, 
  Sparkle, 
  Robot, 
  ArrowsClockwise, 
  Minus,
  Lightbulb,
  ArrowRight,
  Cpu
} from '@phosphor-icons/react'
import aiService from '../../services/aiService'
import type { AIChatMessage, SuggestedProduct } from '../../services/aiService'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  time: string
  thinking?: string | null
  suggestedProducts?: SuggestedProduct[]
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiOnline, setAiOnline] = useState(true)
  const [aiModel, setAiModel] = useState('Qwen 2.5 (1.5B)')
  const [showThinkingId, setShowThinkingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Xin chào bạn! 🤖 Tôi là GearTech AI (chạy trên mô hình Qwen 2.5 siêu tốc). Tôi có thể tư vấn chọn bàn phím cơ, chuột gaming, màn hình, cấu hình PC theo đúng tầm giá và nhu cầu của bạn. Bạn đang quan tâm sản phẩm nào hôm nay?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const quickQuestions = [
    '⌨️ Bàn phím cơ gõ êm văn phòng',
    '🖱️ Chuột gaming bắn FPS chuẩn',
    '🖥️ Tư vấn màn hình gaming tần số cao',
    '⚡ Phân biệt switch Linear và Tactile'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Kiểm tra kết nối AI khi mở widget
    if (isOpen) {
      aiService.getStatus().then(status => {
        setAiOnline(status.available)
        if (status.currentModel) {
          setAiModel(status.currentModel.toUpperCase())
        }
      }).catch(() => setAiOnline(false))
      scrollToBottom()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Chuẩn bị payload lịch sử tin nhắn
    const historyPayload: AIChatMessage[] = [...messages, userMsg].slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    try {
      const response = await aiService.chat(historyPayload)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        thinking: response.thinking,
        suggestedProducts: response.suggestedProducts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      // Fallback thông minh nếu Ollama tạm thời bận
      let fallbackText = 'Dạ hiện tại máy chủ AI đang tải thêm dữ liệu. Bạn có thể tham khảo danh mục Bàn phím cơ hoặc Chuột gaming trên thanh menu để chọn thiết bị phù hợp nhất nhé!'
      const q = query.toLowerCase()
      if (q.includes('phím') || q.includes('switch') || q.includes('keyboard')) {
        fallbackText = '⌨️ Với nhu cầu gõ êm văn phòng, bạn nên chọn bàn phím dùng switch Linear (như Red Switch hoặc Silent Switch) kết hợp foam tiêu âm để không gây tiếng ồn cho đồng nghiệp.'
      } else if (q.includes('chuột') || q.includes('mouse') || q.includes('fps')) {
        fallbackText = '🖱️ Với game bắn súng FPS, bạn nên chọn chuột trọng lượng siêu nhẹ (< 65g), cảm biến quang học PixArt và switch quang học để có tốc độ vẩy đạn chuẩn xác nhất.'
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      
      {/* 1. Cửa sổ Chat Pop-up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] sm:w-[410px] h-[550px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4655] to-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,70,85,0.5)]">
                  <Robot size={22} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">GEARTECH AI</h3>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/40 flex items-center gap-0.5">
                      <Cpu size={10} weight="bold" />
                      {aiModel}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {aiOnline ? 'Ollama Trực tuyến • Tư vấn 24/7' : 'Đang kết nối lại'}
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

            {/* Thân danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/70 dark:bg-zinc-900/40">
              {messages.map((m) => {
                const isAI = m.sender === 'ai'
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4655]/20 to-purple-500/20 text-[#ff4655] flex items-center justify-center shrink-0 mt-0.5 border border-[#ff4655]/30 text-xs">
                        <Sparkle size={14} weight="fill" />
                      </div>
                    )}
                    <div className={`max-w-[85%] space-y-2`}>
                      <div className={`rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                        isAI 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-sm'
                          : 'bg-gradient-to-r from-[#ff4655] to-red-600 text-white rounded-tr-sm font-medium'
                      }`}>
                        <div className="whitespace-pre-line">{m.text}</div>

                        {/* Suy nghĩ của AI (Collapsible Thinking Process) */}
                        {m.thinking && (
                          <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <button
                              onClick={() => setShowThinkingId(showThinkingId === m.id ? null : m.id)}
                              className="text-[10px] text-amber-500 hover:text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1 transition-colors"
                            >
                              <Lightbulb size={12} weight="fill" />
                              {showThinkingId === m.id ? 'Ẩn suy nghĩ của AI' : 'Xem quá trình suy nghĩ của AI'}
                            </button>
                            {showThinkingId === m.id && (
                              <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200/80 text-[10px] font-mono leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap border border-amber-500/20">
                                {m.thinking}
                              </div>
                            )}
                          </div>
                        )}

                        <span className={`text-[8px] font-mono block text-right ${isAI ? 'text-zinc-400' : 'text-white/70'}`}>
                          {m.time}
                        </span>
                      </div>

                      {/* Gợi ý sản phẩm liên quan (Mini Cards) */}
                      {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            Sản phẩm đề xuất trên GearTech:
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {m.suggestedProducts.map(prod => (
                              <Link
                                key={prod._id}
                                to={prod.slug ? `/product/${prod.slug}` : `/product/${prod._id}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655] transition-all group"
                              >
                                {prod.image && (
                                  <img 
                                    src={prod.image} 
                                    alt={prod.name} 
                                    className="w-10 h-10 object-cover rounded-lg shrink-0 border border-zinc-100 dark:border-zinc-800"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[11px] font-semibold text-zinc-800 dark:text-white truncate group-hover:text-[#ff4655] transition-colors">
                                    {prod.name}
                                  </h4>
                                  <span className="text-[10px] font-mono font-bold text-[#ff4655]">
                                    {new Intl.NumberFormat('vi-VN').format(prod.discountPrice || prod.price)}₫
                                  </span>
                                </div>
                                <ArrowRight size={12} className="text-zinc-400 group-hover:text-[#ff4655] group-hover:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2 bg-white/70 dark:bg-zinc-900/70 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
                  <div className="w-6 h-6 rounded-lg bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0">
                    <ArrowsClockwise size={13} className="animate-spin" />
                  </div>
                  <span>GearTech AI đang đối chiếu dữ liệu sản phẩm (1 - 3s)...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Gợi ý câu hỏi nhanh */}
            {messages.length <= 3 && (
              <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-1.5 overflow-x-auto scrollbar-none">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isTyping}
                    className="shrink-0 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-[#ff4655]/10 hover:text-[#ff4655] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Thanh nhập tin nhắn */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi tư vấn chuột, bàn phím, màn hình..."
                disabled={isTyping}
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655] transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#ff4655] to-red-600 hover:from-red-600 hover:to-[#ff4655] disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </button>
            </form>

            <div className="px-3 py-1 bg-zinc-100/70 dark:bg-zinc-900/60 text-center text-[8px] font-mono text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center gap-1">
              <span>Trợ lý AI nội bộ</span> • <span>Mô hình Qwen 3 (Ollama)</span> • <span>Dữ liệu thực tế sàn GearTech</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Action Button Nổi bật (Góc Phải Màn Hình) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#ff4655] via-purple-600 to-[#ff4655] text-white p-3.5 rounded-full shadow-2xl shadow-[#ff4655]/40 border-2 border-white/20 transition-all cursor-pointer"
        aria-label="Trợ lý AI GearTech"
      >
        <span className="relative">
          <ChatTeardropDots size={24} weight="fill" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-950 animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-950"></span>
        </span>

        {/* Nhãn mở rộng khi hover */}
        <span className="text-xs font-black uppercase tracking-wider pr-1 hidden sm:inline-block">
          GearTech AI
        </span>

        {/* Hiệu ứng hào quang phát sáng */}
        <div className="absolute inset-0 rounded-full bg-[#ff4655] blur-md opacity-40 group-hover:opacity-75 transition-opacity -z-10"></div>
      </motion.button>

    </div>
  )
}
