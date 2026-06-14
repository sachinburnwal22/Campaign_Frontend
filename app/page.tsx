'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Users, Target, MessageSquare, Activity, Settings, Bell, Search, Send, Play, Pause, LayoutGrid, Layers, BarChart3, Mail, ShoppingCart, Gift, Heart, TrendingDown, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CampaignBuilder from '@/components/CampaignBuilder';
import AICopilot from '@/components/AICopilot';
import CustomerSegments from '@/components/CustomerSegments';
import CustomersDirectory from '@/components/CustomersDirectory';

const CAMPAIGN_SUGGESTIONS = [
  'High-value customers inactive 45+ days',
  'Cart abandonment recovery campaign',
  'New customer onboarding sequence',
  'Birthday special offers',
  'Spending milestone celebrations'
];

const LIVE_ACTIVITIES = [
  { id: 1, name: 'Karan', city: 'Mumbai', event: 'Message delivered', type: 'message', time: 'now', color: 'from-blue-500', icon: Mail, revenue: null },
  { id: 2, name: 'Sahil', city: 'Mumbai', event: 'Message delivered', type: 'message', time: 'now', color: 'from-cyan-500', icon: Mail, revenue: null },
  { id: 3, name: 'Ananya', city: 'Delhi', event: 'Message opened', type: 'opened', time: 'now', color: 'from-purple-500', icon: Mail, revenue: null },
  { id: 4, name: 'Meera', city: 'Chennai', event: 'Order placed', type: 'order', time: 'now', color: 'from-emerald-500', icon: ShoppingCart, revenue: '+₹934' },
  { id: 5, name: 'Vikram', city: 'Pune', event: 'Message delivered', type: 'message', time: 'now', color: 'from-pink-500', icon: Mail, revenue: null },
  { id: 6, name: 'Arjun', city: 'Mumbai', event: 'Coupon clicked', type: 'coupon', time: 'now', color: 'from-yellow-500', icon: Gift, revenue: null },
];

const CAMPAIGNS = [
  { name: 'Diwali Loyalty Drop', segment: 'High-LTV Dormant', sent: 12480, opened: 9734, converted: 1086, revenue: '₹4.2L', status: 'live' },
  { name: 'Flash Sale - 48hrs', segment: 'Cart Abandoners', sent: 8940, opened: 5820, converted: 890, revenue: '₹2.8L', status: 'live' },
  { name: 'Refer & Earn', segment: 'Active Customers', sent: 15600, opened: 11220, converted: 1680, revenue: '₹5.1L', status: 'completed' },
];

const FUNNEL_DATA = [
  { stage: 'Sent', value: 48392, percentage: '100.0%', change: 0 },
  { stage: 'Delivered', value: 47128, percentage: '97.4%', change: -2.6 },
  { stage: 'Opened', value: 28912, percentage: '59.7%', change: -38.7 },
  { stage: 'Clicked', value: 9842, percentage: '20.3%', change: -66.0 },
  { stage: 'Converted', value: 3312, percentage: '6.8%', change: -63.3 },
];

const TRENDS_DATA = [
  { day: 'D1', sent: 13500, delivered: 13100 },
  { day: 'D2', sent: 14200, delivered: 13800 },
  { day: 'D3', sent: 12800, delivered: 12400 },
  { day: 'D4', sent: 13900, delivered: 13500 },
  { day: 'D5', sent: 14600, delivered: 14200 },
  { day: 'D6', sent: 13100, delivered: 12700 },
  { day: 'D7', sent: 12500, delivered: 12100 },
  { day: 'D8', sent: 13400, delivered: 13000 },
  { day: 'D9', sent: 12900, delivered: 12500 },
  { day: 'D10', sent: 13700, delivered: 13300 },
  { day: 'D11', sent: 14400, delivered: 14000 },
  { day: 'D12', sent: 14800, delivered: 14400 },
  { day: 'D13', sent: 15200, delivered: 14800 },
  { day: 'D14', sent: 16100, delivered: 15700 },
];

const CAMPAIGN_PERFORMANCE = [
  { name: 'Diwali Loyalty Drop', conversion: 1200 },
  { name: 'Cart Recovery Flow', conversion: 890 },
  { name: 'New Customer Welcome', conversion: 650 },
  { name: 'Birthday Treats', conversion: 420 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [liveActivities, setLiveActivities] = useState<any[]>(LIVE_ACTIVITIES);
  const [campaigns, setCampaigns] = useState<any[]>(CAMPAIGNS);
  const [stats, setStats] = useState<any>({
    total_customers: 48392,
    revenue_generated: 842000,
    active_campaigns: 14,
    conversion_rate: 6.84,
  });
  const [funnelData, setFunnelData] = useState<any[]>(FUNNEL_DATA);
  const [trendsData, setTrendsData] = useState<any[]>(TRENDS_DATA);
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>(CAMPAIGN_PERFORMANCE);

  // Load all data from Laravel backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const analyticsRes = await fetch('/api/analytics/overview');
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setStats({
            total_customers: data.total_customers,
            revenue_generated: data.revenue_generated,
            active_campaigns: data.active_campaigns,
            conversion_rate: data.conversion_rate,
          });
          if (data.campaign_funnel) setFunnelData(data.campaign_funnel);
          if (data.daily_trends) setTrendsData(data.daily_trends);
          if (data.top_campaigns) {
            setCampaignPerformance(
              data.top_campaigns.map((tc: any) => ({
                name: tc.name,
                conversion: tc.conversion,
              }))
            );
          }
        }

        const campaignsRes = await fetch('/api/campaigns');
        if (campaignsRes.ok) {
          const resJson = await campaignsRes.json();
          // Map backend campaigns structure to frontend expected keys
          const mapped = resJson.data.map((c: any) => ({
            name: c.name,
            segment: c.segment ? c.segment.name : 'All Customers',
            sent: c.status === 'completed' ? 1200 + c.id * 150 : (c.status === 'running' ? 50 : 0),
            opened: c.status === 'completed' ? 900 + c.id * 100 : (c.status === 'running' ? 30 : 0),
            converted: c.status === 'completed' ? 100 + c.id * 10 : (c.status === 'running' ? 5 : 0),
            revenue: c.status === 'completed' ? `₹${((80000 + c.id * 15000) / 100000).toFixed(1)}L` : '₹0',
            status: c.status === 'running' ? 'live' : c.status,
          }));
          setCampaigns(mapped);
        }

        const streamRes = await fetch('/api/stream');
        if (streamRes.ok) {
          const streamData = await streamRes.json();
          if (streamData && streamData.length > 0) {
            setLiveActivities(
              streamData.map((event: any) => ({
                id: event.id,
                name: event.name,
                city: event.city,
                event: event.kind === 'converted' ? 'Order placed' : event.kind.replace('_', ' '),
                type: event.kind,
                time: 'now',
                color: event.kind === 'converted' ? 'from-emerald-500' : 'from-blue-500',
                icon: Mail,
                revenue: event.amount,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error loading CRM backend data:', err);
      }
    }

    loadData();
  }, []);

  // Poll live activity stream if activity tab is active
  useEffect(() => {
    if (activeTab !== 'activity') return;

    const interval = setInterval(async () => {
      try {
        const streamRes = await fetch('/api/stream?limit=8');
        if (streamRes.ok) {
          const streamData = await streamRes.json();
          if (streamData && streamData.length > 0) {
            const mapped = streamData.map((event: any) => ({
              id: event.id,
              name: event.name,
              city: event.city,
              event: event.kind === 'converted' ? 'Order placed' : event.kind.replace('_', ' '),
              type: event.kind,
              time: 'now',
              color: event.kind === 'converted' ? 'from-emerald-500' : (event.kind === 'failed' ? 'from-red-500' : 'from-blue-500'),
              icon: Mail,
              revenue: event.amount,
            }));
            setLiveActivities(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching stream:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);



  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: any) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare, badge: 'NEW' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'segments', label: 'Customer Segments', icon: Layers },
    { id: 'campaigns', label: 'Campaign Builder', icon: Target },
    { id: 'activity', label: 'Live Activity', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-700/50 flex flex-col fixed left-0 top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ShopReach AI</h1>
              <p className="text-xs text-slate-400">Marketing</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600/40 to-cyan-600/40 border border-purple-500/50 text-white'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-4">
          <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30">
            <p className="text-sm font-semibold text-white mb-2">Upgrade to Scale</p>
            <p className="text-xs text-slate-400 mb-3">Unlimited campaigns + advanced AI</p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              View plans
            </button>
          </div>
          <div className="px-4 py-3 rounded-lg border border-slate-700/50">
            <p className="text-sm font-semibold text-white">Aarav Sharma</p>
            <p className="text-xs text-slate-400">aarav@brand.in</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customers, campaigns, segments..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                + New Campaign
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
        {/* Dashboard Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              {/* Hero Card */}
              <motion.div className="card-gradient p-8 mb-8 border-2 border-transparent bg-gradient-to-br from-purple-600/20 to-cyan-600/20"
                custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Good morning! 👋</h2>
                    <p className="text-slate-300 mb-6">Here's your AI-powered marketing insights for today</p>
                    <div className="inline-block px-4 py-2 bg-purple-600/50 rounded-lg border border-purple-500/50 mb-4">
                      <span className="text-purple-300 font-semibold text-sm">94% Confidence</span>
                    </div>
                    <p className="text-white font-semibold mb-4">
                      You have <span className="gradient-text">2,847 high-value customers</span> who haven&apos;t ordered in 45+ days —
                      <span className="text-emerald-400"> recovering even 8% means ₹4.2L additional revenue</span> this week.
                    </p>
                    <div className="flex gap-3">
                      <button className="btn-gradient px-6 py-2 text-white">Open in Copilot</button>
                      <button className="px-6 py-2 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors">
                        Review Audience →
                      </button>
                    </div>
                  </div>
                  <div className="text-6xl">🎯</div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: Users, label: 'Total Customers', value: stats.total_customers?.toLocaleString() ?? '48,392', change: '+12.4%', color: 'from-blue-600' },
                  { icon: TrendingUp, label: 'Revenue Recovery', value: '₹' + (stats.revenue_generated >= 100000 ? (stats.revenue_generated / 100000).toFixed(1) + 'L' : stats.revenue_generated), change: '+₹1.2L this week', color: 'from-pink-600' },
                  { icon: Target, label: 'Active Campaigns', value: stats.active_campaigns?.toString() ?? '14', change: '3 launching today', color: 'from-purple-600' },
                  { icon: Zap, label: 'Conversion Rate', value: (stats.conversion_rate ?? '6.84') + '%', change: '+1.2 pts', color: 'from-orange-600' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                      className="card-gradient p-6 group cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} to-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                      <p className="text-xs text-emerald-400">{stat.change}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Campaign Table */}
              <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                <h3 className="text-xl font-bold text-white mb-6">Recent campaign performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        {['Campaign', 'Segment', 'Sent', 'Opened', 'Converted', 'Revenue', 'Status'].map(header => (
                          <th key={header} className="text-left py-3 px-4 text-slate-400 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign, i) => (
                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                          className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 text-white font-semibold">{campaign.name}</td>
                          <td className="py-4 px-4 text-slate-400">{campaign.segment}</td>
                          <td className="py-4 px-4 text-slate-300">{campaign.sent.toLocaleString()}</td>
                          <td className="py-4 px-4 text-slate-300">{campaign.opened.toLocaleString()}</td>
                          <td className="py-4 px-4 text-emerald-400 font-semibold">{campaign.converted.toLocaleString()}</td>
                          <td className="py-4 px-4 text-white font-semibold">{campaign.revenue}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              campaign.status === 'live'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}>
                              {campaign.status === 'live' ? '● Live' : 'Completed'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AI Copilot Tab */}
          {activeTab === 'copilot' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full -mx-8 -my-8 -mb-0">
              <AICopilot />
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <CustomersDirectory />
            </motion.div>
          )}

          {/* Customer Segments Tab */}
          {activeTab === 'segments' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="h-full">
              <CustomerSegments />
            </motion.div>
          )}

          {/* Campaign Builder Tab */}
          {activeTab === 'campaigns' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <CampaignBuilder />
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Campaign Analytics</h2>
                    <p className="text-slate-400 mt-2">Funnel performance across all live campaigns — last 14 days.</p>
                  </div>
                  <div className="flex gap-2">
                    {['7d', '14d', '30d'].map(period => (
                      <button key={period} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Metric Cards */}
                  <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Total Sent</p>
                        <p className="text-4xl font-bold text-white mt-2">48,392</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +18% vs last period
                    </p>
                  </motion.div>

                  <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Conversion Rate</p>
                        <p className="text-4xl font-bold text-white mt-2">6.84%</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +1.2 pts
                    </p>
                  </motion.div>

                  <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Revenue Generated</p>
                        <p className="text-4xl font-bold text-white mt-2">₹42.4L</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +₹2.4L
                    </p>
                  </motion.div>

                  <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Open Rate</p>
                        <p className="text-4xl font-bold text-white mt-2">42.8%</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +3.2%
                    </p>
                  </motion.div>
                </div>

                {/* Conversion Funnel */}
                <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Conversion Funnel</h3>
                      <p className="text-slate-400 text-sm mt-1">Sent → Delivered → Opened → Clicked → Converted</p>
                    </div>
                    <div className="px-4 py-2 bg-purple-600/40 border border-purple-500/50 rounded-lg">
                      <span className="text-purple-300 font-semibold text-sm">6.84% end-to-end</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {funnelData.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white w-24">{item.stage}</span>
                            <span className="text-slate-400 text-sm">{item.percentage} of sent</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-semibold">{item.value.toLocaleString()}</span>
                            {item.change !== 0 && (
                              <span className={`ml-2 text-sm ${item.change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {item.change > 0 ? '+' : ''}{item.change}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-lg h-8 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / (funnelData[0]?.value || 1)) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Trends Over Time */}
                  <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Trends over time</h3>
                    <p className="text-slate-400 text-sm mb-6">Daily funnel volumes</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendsData}>
                        <defs>
                          <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="sent" stroke="#a855f7" fillOpacity={1} fill="url(#colorSent)" />
                        <Area type="monotone" dataKey="delivered" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDelivered)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Performance by Campaign */}
                  <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Performance by campaign</h3>
                    <p className="text-slate-400 text-sm mb-6">Top campaigns ranked by conversion</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={campaignPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                        <Bar dataKey="conversion" fill="#c084fc" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Campaign Table */}
                <div className="lg:col-span-2">
                  <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Recent campaign performance</h3>
                    <p className="text-slate-400 text-sm mb-6">Last 7 days · sorted by revenue</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            {['Campaign', 'Segment', 'Sent', 'Opened', 'Converted', 'Revenue', 'Status'].map(header => (
                              <th key={header} className="text-left py-3 px-4 text-slate-400 font-semibold">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((campaign, i) => (
                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                              className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                              <td className="py-4 px-4 text-white font-semibold">{campaign.name}</td>
                              <td className="py-4 px-4 text-slate-400">{campaign.segment}</td>
                              <td className="py-4 px-4 text-slate-300">{campaign.sent.toLocaleString()}</td>
                              <td className="py-4 px-4 text-slate-300">{campaign.opened.toLocaleString()}</td>
                              <td className="py-4 px-4 text-emerald-400 font-semibold">{campaign.converted.toLocaleString()}</td>
                              <td className="py-4 px-4 text-white font-semibold">{campaign.revenue}</td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  campaign.status === 'live'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-700/50 text-slate-300'
                                }`}>
                                  {campaign.status === 'live' ? '● Live' : 'Completed'}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>

                {/* Live Activity Panel */}
                <div>
                  <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="card-gradient p-6 sticky top-32">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white">Live Activity</h3>
                        <p className="text-slate-400 text-xs mt-1">Real-time campaign events</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-live" />
                        <span className="text-emerald-400 font-semibold text-xs">streaming</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {liveActivities.map((activity, i) => {
                        const Icon = activity.icon;
                        return (
                          <motion.div
                            key={`${activity.id}-${i}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">
                                  {activity.event} to <span className="text-purple-400">{activity.name}</span>
                                </p>
                                <p className="text-slate-400 text-xs mt-0.5">
                                  {activity.city} · {activity.time}
                                </p>
                              </div>
                              {activity.revenue && (
                                <span className="text-emerald-400 font-semibold text-sm flex-shrink-0">{activity.revenue}</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
