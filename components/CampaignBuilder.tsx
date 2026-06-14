'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, MessageCircle, Phone, Check, Clock, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

type CampaignStep = 'audience' | 'channel' | 'message' | 'schedule' | 'review';

interface Audience {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  openRate: number;
  cost: string;
  costLabel: string;
}

const AUDIENCES: Audience[] = [
  { id: 'high-value', name: 'High-Value Dormant', count: 4084, icon: '👑' },
  { id: 'cart-24h', name: 'Cart Abandoners 24h', count: 2745, icon: '🛒' },
  { id: 'new-signups', name: 'New Signups <7d', count: 2246, icon: '⭐' },
  { id: 'birthdays', name: 'Birthdays this week', count: 998, icon: '🎂' },
  { id: 'vip', name: 'VIP Loyalists', count: 412, icon: '🏆' },
  { id: 'active-mumbai', name: 'Mumbai Active Buyers', count: 1820, icon: '📍' },
];

const CHANNELS: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <MessageCircle className="w-6 h-6 text-white" />,
    openRate: 78,
    cost: '₹1.20',
    costLabel: '/msg',
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-6 h-6 text-white" />,
    openRate: 42,
    cost: '₹0.08',
    costLabel: '/send',
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: <Phone className="w-6 h-6 text-white" />,
    openRate: 94,
    cost: '₹0.18',
    costLabel: '/sms',
  },
];

const MERGE_TAGS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{city}}',
  '{{store_link}}',
  '{{cart_link}}',
  '{{order_count}}',
];

const SCHEDULE_OPTIONS = [
  {
    id: 'now',
    title: 'Send now',
    subtitle: 'Starts immediately on launch',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'later',
    title: 'Schedule for later',
    subtitle: 'Pick an optimal send time',
    icon: <Clock className="w-5 h-5" />,
  },
];

export default function CampaignBuilder() {
  const [step, setStep] = useState<CampaignStep>('audience');
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [messageContent, setMessageContent] = useState('Hi {{first_name}}, we miss you 💜\n\nHere\'s 20% off your next order. Code: WELCOME20\n→ Shop now: {{store_link}}');
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>('now');
  const [isLaunching, setIsLaunching] = useState(false);

  // Load audiences/segments from Laravel API
  useEffect(() => {
    async function loadSegments() {
      try {
        const res = await fetch('/api/segments')
        if (res.ok) {
          const data = await res.json()
          const mapped = data.map((s: any) => ({
            id: String(s.id),
            name: s.name,
            count: s.matched_count || 0,
            icon: s.name.includes('High-Value') ? '👑' : (s.name.includes('Mumbai') ? '📍' : (s.name.includes('VIP') ? '💎' : '🎂'))
          }))
          setAudiences(mapped)
          
          if (mapped.length > 0 && !selectedAudience) {
            setSelectedAudience(mapped[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching segments in CampaignBuilder:', err)
      }
    }
    loadSegments()
  }, [])

  const steps: { id: CampaignStep; label: string; number: number }[] = [
    { id: 'audience', label: 'Audience', number: 1 },
    { id: 'channel', label: 'Channel', number: 2 },
    { id: 'message', label: 'Message', number: 3 },
    { id: 'schedule', label: 'Schedule', number: 4 },
    { id: 'review', label: 'Review', number: 5 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const selectedAudienceData = audiences.find(a => a.id === selectedAudience);
  const selectedChannelData = CHANNELS.find(c => c.id === selectedChannel);

  const estimatedRevenue = useMemo(() => {
    if (!selectedAudienceData) return '₹0';
    const baseRevenue = selectedAudienceData.count * 15;
    return `₹${(baseRevenue / 100000).toFixed(1)}L`;
  }, [selectedAudienceData]);

  const handleNext = () => {
    const validations: Record<CampaignStep, boolean> = {
      audience: !!selectedAudience,
      channel: !!selectedChannel,
      message: !!campaignName && !!messageContent,
      schedule: !!selectedSchedule,
      review: true,
    };

    if (!validations[step]) {
      toast.error('Please complete this step before proceeding');
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].id);
    }
  };

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    const toastId = toast.loading('Creating and launching campaign...');
    try {
      // 1. Create the campaign
      const createRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName || `Campaign for ${selectedAudienceData?.name}`,
          segment_id: Number(selectedAudience),
          channel: selectedChannel || 'whatsapp',
          message: messageContent,
          status: 'draft'
        }),
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.message || 'Failed to create campaign');
      }

      const campaign = await createRes.json();

      // 2. Launch the campaign
      const launchRes = await fetch(`/api/campaigns/${campaign.id}/launch`, {
        method: 'POST',
      });

      if (launchRes.ok) {
        toast.dismiss(toastId);
        toast.success('🚀 Campaign launched and queued successfully!');
        // Reset state
        setStep('audience');
        setCampaignName('');
      } else {
        const errJson = await launchRes.json();
        throw new Error(errJson.message || 'Failed to launch campaign');
      }
    } catch (err: any) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error('Launch failed: ' + err.message);
    } finally {
      setIsLaunching(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-sm text-slate-400 mb-4">
          <span>Acme Commerce</span>
          <span className="mx-2">›</span>
          <span className="text-white font-semibold">Campaign Builder</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Campaign Builder</h1>
        <p className="text-slate-400">Compose a campaign in 5 steps — your AI copilot has your back.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-8 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4">
            <motion.button
              onClick={() => {
                if (i <= currentStepIndex) setStep(s.id);
              }}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all ${
                i < currentStepIndex
                  ? 'bg-purple-600 text-white cursor-pointer'
                  : i === currentStepIndex
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
              whileHover={i <= currentStepIndex ? { scale: 1.05 } : {}}
            >
              {i < currentStepIndex ? <Check className="w-5 h-5" /> : s.number}
            </motion.button>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-1 transition-colors ${
                  i < currentStepIndex ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Display Names */}
      <div className="flex justify-between items-center px-8 mb-12">
        {steps.map(s => (
          <div key={s.id} className="text-center">
            <p
              className={`text-sm font-medium ${
                s.id === step ? 'text-white' : 'text-slate-400'
              }`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="card-gradient p-8 min-h-96">
        <AnimatePresence mode="wait">
          {/* Step 1: Audience */}
          {step === 'audience' && (
            <motion.div
              key="audience"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Pick your audience</h2>
                <p className="text-slate-400">Choose a segment to target with this campaign.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audiences.map(audience => (
                  <motion.button
                    key={audience.id}
                    onClick={() => setSelectedAudience(audience.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedAudience === audience.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{audience.icon}</span>
                      {selectedAudience === audience.id && (
                        <Check className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{audience.name}</h3>
                    <p className="text-sm text-slate-400">
                      {audience.count.toLocaleString()} customers
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Channel */}
          {step === 'channel' && (
            <motion.div
              key="channel"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Choose channel</h2>
                <p className="text-slate-400">
                  {selectedAudienceData?.name} — {selectedAudienceData?.count.toLocaleString()} customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CHANNELS.map(channel => (
                  <motion.button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedChannel === channel.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                      channel.id === 'whatsapp'
                        ? 'bg-emerald-500'
                        : channel.id === 'email'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}>
                      {channel.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-3">{channel.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Open rate</span>
                        <span className="text-emerald-400">{channel.openRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cost</span>
                        <span className="text-cyan-400">
                          {channel.cost}
                          <span className="text-slate-400"> {channel.costLabel}</span>
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Message */}
          {step === 'message' && (
            <motion.div
              key="message"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Compose message</h2>
                <p className="text-slate-400">Use merge tags to personalize. Variables get replaced at send time.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Campaign name (internal)
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g., Win-back Q1 2024"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message content
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none h-40"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">MERGE TAGS</h4>
                  <div className="space-y-2">
                    {MERGE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setMessageContent(messageContent + ' ' + tag);
                        }}
                        className="block w-full text-left px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Tip: AI Copilot can draft this for you.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Schedule */}
          {step === 'schedule' && (
            <motion.div
              key="schedule"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Schedule</h2>
                <p className="text-slate-400">Pick when to send your campaign.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCHEDULE_OPTIONS.map(option => (
                  <motion.button
                    key={option.id}
                    onClick={() => setSelectedSchedule(option.id)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedSchedule === option.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-cyan-400">{option.icon}</div>
                      {selectedSchedule === option.id && (
                        <Check className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{option.title}</h3>
                    <p className="text-sm text-slate-400">{option.subtitle}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Review */}
          {step === 'review' && (
            <motion.div
              key="review"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Review & launch</h2>
                <p className="text-slate-400">One final look before you go live.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">AUDIENCE</p>
                  <p className="text-white font-semibold">
                    {selectedAudienceData?.name} — {selectedAudienceData?.count.toLocaleString()} customers
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">CHANNEL</p>
                  <p className="text-white font-semibold">{selectedChannelData?.name}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">MESSAGE PREVIEW</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{messageContent}</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 mb-2">SEND TIME</p>
                  <div className="flex justify-between items-center">
                    <p className="text-white font-semibold">
                      {selectedSchedule === 'now' ? 'Immediately' : 'Scheduled for later'}
                    </p>
                    <p className="text-emerald-400 font-semibold">EST. REVENUE</p>
                  </div>
                  <p className="text-emerald-400 text-lg font-bold mt-1">{estimatedRevenue}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-6 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {step === 'review' ? (
          <button
            onClick={handleLaunch}
            className="btn-gradient px-8 py-3 text-white flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Launch campaign
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-gradient px-8 py-3 text-white flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
