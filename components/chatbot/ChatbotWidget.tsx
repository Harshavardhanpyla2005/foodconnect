"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  ChevronDown,
  Leaf,
  Truck,
  Building2,
  Users,
  BarChart3,
  MapPin,
  UtensilsCrossed,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface QuickAction {
  label: string
  href?: string
  question?: string
  icon?: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested questions (shown before any conversation starts)
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  { label: "🥗 How do I donate food?", q: "How do I donate food?" },
  { label: "🏢 How can an NGO create a food need?", q: "How can an NGO create a food need?" },
  { label: "🚚 How does collection work?", q: "How does collection work?" },
  { label: "📍 How does live tracking work?", q: "How does live tracking work?" },
  { label: "📊 How is impact verified?", q: "How is impact verified?" },
  { label: "❓ What is FoodConnect?", q: "What is FoodConnect?" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Role-specific quick actions
// ─────────────────────────────────────────────────────────────────────────────

function getQuickActions(role: string | null): QuickAction[] {
  if (role === "DONOR") {
    return [
      { label: "Create Donation", href: "/dashboard/donor", icon: <UtensilsCrossed className="size-3" /> },
      { label: "My Donations", href: "/dashboard/donor", icon: <BarChart3 className="size-3" /> },
      { label: "Track Collection", href: "/dashboard/donor", icon: <MapPin className="size-3" /> },
    ]
  }
  if (role === "NGO") {
    return [
      { label: "Create Need", href: "/dashboard/ngo", icon: <Building2 className="size-3" /> },
      { label: "View Matches", href: "/dashboard/ngo", icon: <Leaf className="size-3" /> },
      { label: "Record Distribution", href: "/dashboard/ngo", icon: <Users className="size-3" /> },
    ]
  }
  if (role === "VOLUNTEER") {
    return [
      { label: "Available Pickups", href: "/dashboard/volunteer", icon: <Truck className="size-3" /> },
      { label: "My Pickup", href: "/dashboard/volunteer", icon: <MapPin className="size-3" /> },
      { label: "Open Tracking", href: "/dashboard/volunteer", icon: <BarChart3 className="size-3" /> },
    ]
  }
  // Public / unauthenticated
  return [
    { label: "Register", href: "/register", icon: <Users className="size-3" /> },
    { label: "Donate Food", href: "/register?role=donor", icon: <UtensilsCrossed className="size-3" /> },
    { label: "How It Works", href: "/how-it-works", icon: <HelpCircle className="size-3" /> },
    { label: "View Impact", href: "/impact", icon: <BarChart3 className="size-3" /> },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Page context hints (shown as contextual suggestion)
// ─────────────────────────────────────────────────────────────────────────────

function getPageContextHint(pathname: string): string | null {
  if (pathname.startsWith("/donate")) return "Need help creating a donation?"
  if (pathname.startsWith("/food-needs")) return "Want to understand how NGO needs are matched?"
  if (pathname.includes("/track")) return "Want me to explain this collection's current status?"
  if (pathname.startsWith("/impact")) return "Want to know how verified impact is calculated?"
  if (pathname.startsWith("/how-it-works")) return "Have questions about how FoodConnect works?"
  if (pathname.startsWith("/dashboard/donor")) return "Questions about your donations?"
  if (pathname.startsWith("/dashboard/ngo")) return "Questions about your NGO dashboard?"
  if (pathname.startsWith("/dashboard/volunteer")) return "Questions about your pickup tasks?"
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple markdown renderer (bold, bullets, links)
// ─────────────────────────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    key++
    if (!line.trim()) {
      elements.push(<div key={key} className="h-2" />)
      continue
    }

    // Bullet
    if (line.match(/^[•\-\*]\s/)) {
      const content = line.replace(/^[•\-\*]\s/, "")
      elements.push(
        <div key={key} className="flex items-start gap-1.5 my-0.5">
          <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
          <span>{renderInline(content)}</span>
        </div>
      )
      continue
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numberedMatch) {
      elements.push(
        <div key={key} className="flex items-start gap-1.5 my-0.5">
          <span className="text-emerald-500 font-bold shrink-0 min-w-[16px]">{numberedMatch[1]}.</span>
          <span>{renderInline(numberedMatch[2])}</span>
        </div>
      )
      continue
    }

    // Heading-ish (starts with **)
    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={key} className="font-bold text-foreground mt-2 mb-1">
          {line.slice(2, -2)}
        </p>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={key} className="my-0.5 leading-relaxed">
        {renderInline(line)}
      </p>
    )
  }

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-emerald-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ChatbotWidget
// ─────────────────────────────────────────────────────────────────────────────

export function ChatbotWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [hasNewMessage, setHasNewMessage] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  // Fetch user role on mount (lightweight call)
  React.useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.role) setUserRole(data.role)
      })
      .catch(() => {})
  }, [])

  // Scroll to bottom
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Clear new-message badge when opened (handled in toggle handler below)

  const pageContextHint = getPageContextHint(pathname)
  const quickActions = getQuickActions(userRole)
  const showSuggestions = messages.length === 0

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Build history for API (last 10 exchanges)
    const history = [...messages, userMsg].slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          pageContext: pathname,
        }),
      })

      const data = await res.json()
      const reply = data.reply || "I'm having trouble responding right now. Please try again."
      if (data.role && !userRole) setUserRole(data.role)

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      if (!isOpen) setHasNewMessage(true)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again shortly, or visit your dashboard directly.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Page context pill (only when chat closed) */}
        {!isOpen && pageContextHint && (
          <button
            onClick={() => { setIsOpen(true); sendMessage(pageContextHint) }}
            className="
              max-w-[220px] text-left text-xs font-medium px-3.5 py-2
              rounded-full
              bg-[#0B3B2E]/95 border border-[#18C77A]/30
              text-[#7DE2B2]
              shadow-lg shadow-black/40
              hover:border-[#18C77A]/60 hover:bg-[#0B3B2E]
              transition-all duration-200
              animate-in slide-in-from-right-4 fade-in
              backdrop-blur-sm
            "
          >
            💡 {pageContextHint}
          </button>
        )}

        {/* Main FAB */}
        <button
          onClick={() => {
            setIsOpen((v) => !v)
            setHasNewMessage(false)
          }}
          aria-label={isOpen ? "Close FoodConnect AI Helpline" : "Open FoodConnect AI Helpline"}
          className="
            group relative
            size-14 rounded-full
            bg-gradient-to-br from-[#18C77A] to-[#0B3B2E]
            shadow-xl shadow-emerald-900/50
            hover:scale-105 hover:shadow-emerald-500/30
            active:scale-95
            transition-all duration-200
            flex items-center justify-center
            border border-[#18C77A]/40
          "
        >
          {isOpen ? (
            <ChevronDown className="size-6 text-white" />
          ) : (
            <MessageSquare className="size-6 text-white" />
          )}
          {/* Badge */}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-amber-400 border-2 border-background animate-pulse" />
          )}
          {/* Tooltip */}
          <span className="
            absolute right-16 top-1/2 -translate-y-1/2
            pointer-events-none opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            text-xs font-semibold whitespace-nowrap
            bg-[#07110D] border border-[#18C77A]/20
            text-[#7DE2B2] px-3 py-1.5 rounded-lg
            shadow-lg
          ">
            Ask FoodConnect AI
          </span>
        </button>
      </div>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="
            fixed z-50
            bottom-24 right-6
            w-[calc(100vw-48px)] max-w-[420px]
            sm:w-[420px]
            h-[calc(100vh-140px)] max-h-[620px]
            flex flex-col
            rounded-2xl overflow-hidden
            border border-[#18C77A]/20
            shadow-2xl shadow-black/60
            animate-in slide-in-from-bottom-4 fade-in duration-200
          "
          style={{
            background: "linear-gradient(160deg, #07110D 0%, #0B3B2E 100%)",
          }}
        >
          {/* Header */}
          <div className="
            flex items-center justify-between
            px-4 py-3.5
            border-b border-[#18C77A]/15
            bg-[#07110D]/80 backdrop-blur-sm
            shrink-0
          ">
            <div className="flex items-center gap-3">
              <div className="
                size-9 rounded-xl
                bg-gradient-to-br from-[#18C77A]/20 to-[#18C77A]/5
                border border-[#18C77A]/30
                flex items-center justify-center
                shrink-0
              ">
                <Bot className="size-4.5 text-[#18C77A]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#F5F7F5] leading-none">
                  FoodConnect AI
                </p>
                <p className="text-[11px] text-[#7DE2B2] mt-0.5">Helpline · Always available</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="
                size-8 rounded-lg flex items-center justify-center
                text-[#7F9188] hover:text-[#F5F7F5]
                hover:bg-white/5
                transition-colors
              "
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#18C77A]/20">
            {/* Welcome state */}
            {showSuggestions && (
              <div className="space-y-4">
                {/* Greeting */}
                <div className="flex items-start gap-2.5">
                  <div className="size-7 rounded-full bg-[#18C77A]/15 border border-[#18C77A]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-3.5 text-[#18C77A]" />
                  </div>
                  <div className="
                    rounded-2xl rounded-tl-sm
                    bg-[#0B3B2E]/80 border border-[#18C77A]/15
                    px-3.5 py-3 text-sm text-[#F5F7F5] max-w-[85%]
                    leading-relaxed
                  ">
                    <p className="font-semibold text-[#7DE2B2] mb-1">FoodConnect AI Helpline</p>
                    <p>How can I help you today? Ask me anything about FoodConnect, food donation, NGOs, volunteering, or the impact verification process.</p>
                  </div>
                </div>

                {/* Quick-action links */}
                <div className="pl-9">
                  <p className="text-[11px] font-semibold text-[#7F9188] uppercase tracking-wider mb-2">
                    Suggested questions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED_QUESTIONS.map((sq) => (
                      <button
                        key={sq.q}
                        onClick={() => sendMessage(sq.q)}
                        className="
                          text-left text-xs font-medium
                          px-3 py-2 rounded-lg
                          border border-[#18C77A]/20 bg-[#18C77A]/5
                          text-[#7DE2B2]
                          hover:border-[#18C77A]/50 hover:bg-[#18C77A]/10
                          transition-all duration-150
                        "
                      >
                        {sq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="size-7 rounded-full bg-[#18C77A]/15 border border-[#18C77A]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-3.5 text-[#18C77A]" />
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="size-7 rounded-full bg-[#F4B942]/15 border border-[#F4B942]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#F4B942]">YOU</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`
                    max-w-[82%] rounded-2xl text-xs leading-relaxed px-3.5 py-3
                    ${msg.role === "user"
                      ? "rounded-tr-sm bg-[#18C77A]/20 border border-[#18C77A]/30 text-[#F5F7F5]"
                      : "rounded-tl-sm bg-[#0B3B2E]/80 border border-[#18C77A]/15 text-[#F5F7F5]"
                    }
                  `}
                >
                  {msg.role === "assistant"
                    ? renderMarkdown(msg.content)
                    : <p>{msg.content}</p>
                  }
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="size-7 rounded-full bg-[#18C77A]/15 border border-[#18C77A]/30 flex items-center justify-center shrink-0">
                  <Bot className="size-3.5 text-[#18C77A]" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#0B3B2E]/80 border border-[#18C77A]/15">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions (after conversation starts) */}
          {messages.length > 0 && quickActions.length > 0 && (
            <div className="px-4 py-2 border-t border-[#18C77A]/10 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((qa) =>
                  qa.href ? (
                    <Link
                      key={qa.label}
                      href={qa.href}
                      className="
                        flex items-center gap-1 text-[11px] font-medium
                        px-2.5 py-1 rounded-lg
                        border border-[#18C77A]/20 bg-[#18C77A]/5
                        text-[#7DE2B2]
                        hover:border-[#18C77A]/50 hover:bg-[#18C77A]/10
                        transition-all duration-150
                      "
                    >
                      {qa.icon}
                      {qa.label}
                    </Link>
                  ) : (
                    <button
                      key={qa.label}
                      onClick={() => qa.question && sendMessage(qa.question)}
                      className="
                        flex items-center gap-1 text-[11px] font-medium
                        px-2.5 py-1 rounded-lg
                        border border-[#18C77A]/20 bg-[#18C77A]/5
                        text-[#7DE2B2]
                        hover:border-[#18C77A]/50 hover:bg-[#18C77A]/10
                        transition-all duration-150
                      "
                    >
                      {qa.icon}
                      {qa.label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="
            px-4 py-3.5
            border-t border-[#18C77A]/15
            bg-[#07110D]/60 backdrop-blur-sm
            shrink-0
          ">
            <div className="flex items-end gap-2.5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about FoodConnect…"
                rows={1}
                disabled={isLoading}
                className="
                  flex-1 resize-none overflow-hidden
                  bg-[#0B3B2E]/60 border border-[#18C77A]/20
                  rounded-xl px-3.5 py-2.5
                  text-xs text-[#F5F7F5] placeholder:text-[#7F9188]
                  focus:outline-none focus:ring-1 focus:ring-[#18C77A]/40 focus:border-[#18C77A]/40
                  transition-colors
                  disabled:opacity-50
                  max-h-[100px]
                "
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="
                  size-9 rounded-xl flex items-center justify-center shrink-0
                  bg-[#18C77A] text-[#07110D]
                  hover:bg-[#7DE2B2]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150
                  active:scale-95
                "
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-[#7F9188] mt-2 text-center">
              FoodConnect AI · Powered by the FoodConnect knowledge base
            </p>
          </div>
        </div>
      )}
    </>
  )
}
