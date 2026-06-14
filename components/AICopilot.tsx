'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const CAMPAIGN_TEMPLATES = [
  {
    icon: '💎',
    name: 'High-Value Dormant',
    description: 'Customers who spent over ₹5000 but haven\'t ordered in 45 days'
  },
  {
    icon: '🛒',
    name: 'Cart Abandoners',
    description: 'Win back customers from last 24 hours'
  },
  {
    icon: '🎉',
    name: 'Birthday Offers',
    description: 'Special birthday week campaigns'
  },
  {
    icon: '💤',
    name: 'Re-engage Inactive',
    description: 'Inactive customers for 30+ days'
  }
]

function getUIMessageText(msg: any): string {
  if (typeof msg.content === 'string' && msg.content.trim()) {
    return msg.content
  }
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: any): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p: any) => p.text)
      .join('')
  }
  return ''
}

export default function AICopilot() {
  const [inputValue, setInputValue] = useState('')
  
  const { messages, sendMessage, stop, isLoading } = (useChat as any)({
    api: '/api/chat',
    onError: () => {
      toast.error('Failed to generate campaign')
    }
  })

  const handleTemplateClick = (template: typeof CAMPAIGN_TEMPLATES[0]) => {
    const message = `Create a campaign for ${template.description}`
    sendMessage({ text: message })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  const isInitial = messages.length === 0

  return (
    <div className="w-full h-full flex bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      {/* Left Sidebar - Templates (Only show on initial state) */}
      {isInitial && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-64 border-r border-blue-700/50 p-5 flex flex-col gap-3 bg-blue-950/40 flex-shrink-0"
        >
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Start</h3>
          </div>
          
          <div className="space-y-2 flex-1">
            {CAMPAIGN_TEMPLATES.map((template, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 3 }}
                onClick={() => handleTemplateClick(template)}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-lg border border-blue-700/50 hover:border-blue-600 bg-blue-800/30 hover:bg-blue-800/50 transition-all group disabled:opacity-50"
              >
                <div className="text-lg mb-0.5">{template.icon}</div>
                <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">{template.name}</div>
              </motion.button>
            ))}
          </div>

          <div className="pt-3 border-t border-blue-700/50 text-xs text-slate-500">
            ShopReach AI can draft campaigns, segments, and messages.
          </div>
        </motion.div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {isInitial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-b border-blue-700/50 px-8 py-4 bg-blue-900/30 flex-shrink-0"
          >
            <h2 className="text-xl font-bold text-white mb-1">What campaign should we run today?</h2>
            <p className="text-sm text-slate-400">Describe your audience and goal in plain English.</p>
          </motion.div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {isInitial ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center max-w-md">
                <motion.div 
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-1">Hi Aarav 👋</h3>
                <p className="text-sm text-slate-400">I'm your AI marketing copilot. Select a template on the left or describe your campaign goal.</p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message: any) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-lg p-4 text-sm ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-blue-800 text-slate-100 rounded-bl-none border border-blue-700/50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {getUIMessageText(message)}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-blue-800 rounded-lg rounded-bl-none border border-blue-700/50 p-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ delay: i * 0.1, duration: 0.6, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-purple-400"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-blue-700/50 px-6 py-4 bg-blue-950/50 backdrop-blur-sm flex-shrink-0">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Create a campaign for customers who spent more than ₹5000..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-800 border border-blue-700 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm disabled:opacity-50"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !inputValue?.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 text-sm"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>

            {isLoading && (
              <motion.button
                type="button"
                onClick={() => stop()}
                className="px-3 py-2.5 bg-red-600/20 text-red-400 rounded-lg font-semibold hover:bg-red-600/30 transition-all text-sm flex-shrink-0"
              >
                Stop
              </motion.button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
