'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'

interface Rule {
  id: string
  field: string
  operator: string
  value: string | number
  connector: 'AND' | 'OR'
}

interface Segment {
  id: string
  name: string
  icon: string
  description: string
  count: number
  change: number
  rules: Rule[]
  revenue: string
  coverage: string
}

const PRESET_SEGMENTS: Segment[] = [
  {
    id: '1',
    name: 'High-Value Dormant',
    icon: '👑',
    description: 'Spent ₹5k+ · inactive 45+ days',
    count: 4084,
    change: 12,
    revenue: '₹8.2L',
    coverage: '6.3%',
    rules: [
      { id: 'r1', field: 'Lifetime Spend (₹)', operator: '>=', value: 5000, connector: 'AND' },
      { id: 'r2', field: 'Days since last order', operator: '>=', value: 45, connector: 'AND' },
    ]
  },
  {
    id: '2',
    name: 'Cart Abandoners 24h',
    icon: '🛒',
    description: 'Added to cart, didn\'t check out',
    count: 2745,
    change: 24,
    revenue: '₹3.2L',
    coverage: '4.1%',
    rules: [
      { id: 'r1', field: 'Last cart status', operator: '=', value: 'abandoned', connector: 'AND' },
    ]
  },
  {
    id: '3',
    name: 'New Signups <7d',
    icon: '⭐',
    description: 'Recently joined, no order yet',
    count: 2246,
    change: 8,
    revenue: '₹1.5L',
    coverage: '3.4%',
    rules: [
      { id: 'r1', field: 'Days since signup', operator: '<=', value: 7, connector: 'AND' },
    ]
  },
  {
    id: '4',
    name: 'Birthdays this week',
    icon: '🎁',
    description: 'Customer birthday in next 7 days',
    count: 998,
    change: 3,
    revenue: '₹0.8L',
    coverage: '1.5%',
    rules: [
      { id: 'r1', field: 'Birthday within (days)', operator: '<=', value: 7, connector: 'AND' },
    ]
  },
  {
    id: '5',
    name: 'VIP Loyalists',
    icon: '💎',
    description: 'Top 5% by LTV · 15+ orders',
    count: 412,
    change: 5,
    revenue: '₹2.1L',
    coverage: '0.6%',
    rules: [
      { id: 'r1', field: 'Total orders', operator: '>=', value: 15, connector: 'AND' },
    ]
  },
  {
    id: '6',
    name: 'Mumbai Active Buyers',
    icon: '📍',
    description: 'Mumbai · ordered in last 30d',
    count: 1820,
    change: 6,
    revenue: '₹4.5L',
    coverage: '2.7%',
    rules: [
      { id: 'r1', field: 'City', operator: '=', value: 'Mumbai', connector: 'AND' },
    ]
  },
]

const FIELD_OPTIONS = [
  'Lifetime Spend (₹)',
  'Total orders',
  'Engagement score',
  'Days since last order',
  'Last cart status',
  'Birthday within (days)',
  'City',
  'Days since signup',
]

const OPERATOR_OPTIONS = ['>=', '<=', '=', '>', '<', '!=']

// Helper to translate backend rules to frontend structure
function parseBackendRules(rulesObj: any): Rule[] {
  if (!rulesObj) return []
  return Object.keys(rulesObj).map((key, index) => {
    let field = key
    let operator = '>='
    let value = rulesObj[key]

    if (key === 'total_spent') {
      field = 'Lifetime Spend (₹)'
    } else if (key === 'inactive_days') {
      field = 'Days since last order'
    } else if (key === 'last_order_days') {
      field = 'Last order within (days)'
    } else if (key === 'city') {
      field = 'City'
      operator = '='
    } else if (key === 'gender') {
      field = 'Gender'
      operator = '='
    } else if (key === 'order_count') {
      field = 'Total orders'
    }

    return {
      id: `r${index}`,
      field,
      operator,
      value,
      connector: 'AND'
    }
  })
}

// Helper to translate frontend rules to backend structure
function formatRulesForBackend(rulesList: Rule[]): any {
  const rulesObj: any = {}
  rulesList.forEach(r => {
    let key = r.field
    if (r.field === 'Lifetime Spend (₹)') key = 'total_spent'
    else if (r.field === 'Days since last order') key = 'inactive_days'
    else if (r.field === 'City') key = 'city'
    else if (r.field === 'Gender') key = 'gender'
    else if (r.field === 'Total orders') key = 'order_count'
    else if (r.field === 'Last order within (days)') key = 'last_order_days'

    rulesObj[key] = r.value
  })
  return rulesObj
}

export default function CustomerSegments() {
  const [segments, setSegments] = useState<Segment[]>(PRESET_SEGMENTS)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('1')
  const [rules, setRules] = useState<Rule[]>(PRESET_SEGMENTS[0].rules)

  const selectedSegment = segments.find(s => s.id === selectedSegmentId) || segments[0]

  // Load segments from backend
  useEffect(() => {
    async function loadSegments() {
      try {
        const res = await fetch('/api/segments')
        if (res.ok) {
          const data = await res.json()
          const mapped = data.map((s: any) => ({
            id: String(s.id),
            name: s.name,
            icon: s.name.includes('High-Value') ? '👑' : (s.name.includes('Mumbai') ? '📍' : (s.name.includes('VIP') ? '💎' : '⭐')),
            description: s.description || '',
            count: s.matched_count || 0,
            change: 5,
            revenue: '₹' + ((s.matched_count * 15 * 30) / 100000).toFixed(1) + 'L',
            coverage: ((s.matched_count / 500) * 100).toFixed(1) + '%',
            rules: parseBackendRules(s.rules_json)
          }))
          setSegments(mapped)
          
          // Select the first loaded segment
          if (mapped.length > 0) {
            setSelectedSegmentId(mapped[0].id)
            setRules(mapped[0].rules)
          }
        }
      } catch (err) {
        console.error('Error fetching segments:', err)
      }
    }
    loadSegments()
  }, [])

  const handleAddRule = () => {
    const newRule: Rule = {
      id: `r${Date.now()}`,
      field: FIELD_OPTIONS[0],
      operator: '>=',
      value: '',
      connector: 'AND'
    }
    setRules([...rules, newRule])
  }

  const handleRemoveRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
  }

  const handleUpdateRule = (ruleId: string, field: keyof Rule, value: any) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, [field]: value } : r
    ))
  }

  const handleSaveSegment = async () => {
    try {
      const formattedRules = formatRulesForBackend(rules)
      
      const res = await fetch(`/api/segments/${selectedSegmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedSegment.name,
          description: selectedSegment.description,
          rules_json: formattedRules
        })
      })

      if (res.ok) {
        const updatedSegment = await res.json()
        setSegments(segments.map(s => 
          s.id === selectedSegmentId 
            ? { 
                ...s, 
                rules, 
                count: updatedSegment.matched_count,
                revenue: '₹' + ((updatedSegment.matched_count * 15 * 30) / 100000).toFixed(1) + 'L',
                coverage: ((updatedSegment.matched_count / 500) * 100).toFixed(1) + '%'
              } 
            : s
        ))
        toast.success('Segment saved successfully and matched counts updated!')
      } else {
        toast.error('Failed to save segment updates to backend')
      }
    } catch (err) {
      console.error('Error saving segment:', err)
      toast.error('Network error saving segment')
    }
  }

  const handleUseInCampaign = () => {
    toast.success(`Using "${selectedSegment.name}" for campaign`)
  }

  const handleSelectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId)
    const segment = segments.find(s => s.id === segmentId)
    if (segment) {
      setRules(segment.rules)
    }
  }

  return (
    <div className="flex gap-8 h-full">
      {/* Left Sidebar - Segment Library */}
      <div className="w-96 flex-shrink-0 overflow-y-auto pr-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Segment Library</h3>
        
        {segments.map((segment) => (
          <motion.button
            key={segment.id}
            whileHover={{ translateX: 4 }}
            onClick={() => handleSelectSegment(segment.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedSegmentId === segment.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="text-2xl">{segment.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm">{segment.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{segment.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-bold text-white">{segment.count.toLocaleString()}</span>
              <span className={`text-xs font-semibold ${segment.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {segment.change > 0 ? '+' : ''}{segment.change}%
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Right Side - Segment Editor */}
      <div className="flex-1 flex flex-col bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedSegment.icon}</span>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Editing Segment</p>
              <h2 className="text-2xl font-bold text-white">{selectedSegment.name}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-700/50">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Audience</p>
            <p className="text-2xl font-bold text-white">{selectedSegment.count.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">matched</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Revenue Potential</p>
            <p className="text-2xl font-bold text-emerald-400">{selectedSegment.revenue}</p>
            <p className="text-xs text-slate-500 mt-1">est. next 30d</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Coverage</p>
            <p className="text-2xl font-bold text-white">{selectedSegment.coverage}</p>
            <p className="text-xs text-slate-500 mt-1">of total base</p>
          </div>
        </div>

        {/* Rules Section */}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-4">Rules</p>
            
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={rule.id} className="space-y-2">
                  {index > 0 && (
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-xs font-semibold text-slate-400">{rule.connector}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                    <select
                      value={rule.field}
                      onChange={(e) => handleUpdateRule(rule.id, 'field', e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                    >
                      {FIELD_OPTIONS.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => handleUpdateRule(rule.id, 'operator', e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500 w-20"
                    >
                      {OPERATOR_OPTIONS.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => handleUpdateRule(rule.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-24 bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                    />

                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddRule}
              className="mt-3 w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add rule
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-slate-700/50">
          <button
            onClick={handleSaveSegment}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            <span>✓</span>
            Save segment
          </button>
          <button
            onClick={handleUseInCampaign}
            className="flex-1 py-2.5 border border-slate-700 text-white rounded-lg font-semibold hover:border-slate-600 hover:bg-slate-700/30 transition-all flex items-center justify-center gap-2"
          >
            Use in campaign
          </button>
        </div>

        <p className="text-xs text-slate-500 text-right mt-3">Live preview</p>
      </div>
    </div>
  )
}
