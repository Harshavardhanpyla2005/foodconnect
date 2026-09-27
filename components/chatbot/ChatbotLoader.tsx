"use client"

import dynamic from "next/dynamic"

// Lazy-load the heavy chatbot only when needed — zero impact on initial page load
const ChatbotWidget = dynamic(
  () => import("./ChatbotWidget").then((m) => ({ default: m.ChatbotWidget })),
  {
    ssr: false,
    loading: () => null, // No loading skeleton for the FAB — appears once JS loads
  }
)

export function ChatbotLoader() {
  return <ChatbotWidget />
}
