import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, ArrowLeft, Loader2, PartyPopper, X, CreditCard } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

// ============================================================================
// STRIPE PAYMENT LINKS
// Create these at https://dashboard.stripe.com/payment-links
// For each link, set the redirect URL to include plan & billing, e.g.:
//   https://gameday-win-zone.base44.app/Subscriptions?plan=sporty&billing=monthly&status=success
// Replace the placeholder strings below with your actual Stripe Payment Link URLs.
// ============================================================================
const PAYMENT_LINKS = {
  sporty: {
    monthly: 'REPLACE_WITH_STRIPE_LINK',
    yearly: 'REPLACE_WITH_STRIPE_LINK',
  },
  peak: {
    monthly: 'REPLACE_WITH_STRIPE_LINK',
    yearly: 'REPLACE_WITH_STRIPE_LINK',
  },
};

const plans = [
  {
    name: 'Zeno Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Get started with core features',
    icon: Zap,
    color: 'from-slate-600 to-slate-700',
    features: [
      '5 AI match predictions per day',
      'Stadium discovery map with GPS',
      'Basic health tracking (steps, calories)',
      'First aid guide access',
      'Community Discord access',
    ],
    planKey: 'free',
    popular: false,
  },
  {
    name: 'Zeno Sporty',
    price: { monthly: 5, yearly: 48 },
    description: 'For active sports enthusiasts',
    icon: Rocket,
    color: 'from-purple-600 to-orange-500',
    features: [
      'Unlimited AI match predictions',
      'Real-time score syncing',
      'Advanced ECG/PPG heart monitoring',
      'Personalized health insights',
      'Ad-free experience',
      'Priority support',
    ],
    planKey: 'sporty',
    popular: true,
  },
  {
    name: 'Zeno Peak',
    price: { monthly: 10, yearly: 96 },
    description: 'Maximum performance & analytics',
    icon: Crown,
    color: 'from-amber-500 to-yellow-500',
    features: [
      'Everything in Zeno Sporty',
      'Pro Match Strategy AI — tactical analysis for any match',
      'Historical health trends & analytics',
      'Custom AI workout plans',
      'API access for integrations',
      'Early access to new features',
    ],
    planKey: 'peak',
    popular: false,
  },
];

export default function Subscriptions() {
  const [billing, setBilling] = useState('monthly');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activating, setActivating] = useState(false);
  const { user, plan: currentPlan, activatePlan, cancelPlan } = useSubscription();

  // Check for success redirect from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const planName = params.get('plan');
    const billingCycle = params.get('billing');

    if (status === 'success' && planName && billingCycle) {
      setActivating(true);
      activatePlan(planName, billingCycle).then(() => {
        setActivating(false);
        setShowSuccess(true);
        window.history.replaceState({}, '', '/Subscriptions');
      }).catch(() => {
        setActivating(false);
      });
    }
  }, []);

  const handleUpgrade = (planKey) => {
    if (planKey === 'free' || planKey === currentPlan) return;
    const link = PAYMENT_LINKS[planKey]?.[billing];
    // If real Stripe link is configured, redirect to it; otherwise activate directly (demo mode)
    if (link && !link.startsWith('REPLACE')) {
      window.location.href = link;
    } else {
      setActivating(true);
      activatePlan(planKey, billing).then(() => {
        setActivating(false);
        setShowSuccess(true);
      });
    }
  };

  const handleCancel = () => {
    cancelPlan();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Success Banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <PartyPopper className="w-6 h-6 text-green-400" />
            <div className="flex-1">
              <p className="text-green-400 font-semibold">Plan Activated!</p>
              <p className="text-slate-300 text-sm">Your subscription is now active. Enjoy your new features!</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan Status */}
      {currentPlan && currentPlan !== 'free' && !activating && (
        <div className="mb-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${plans.find(p => p.planKey === currentPlan)?.color} rounded-xl`}>
              {(() => {
                const Icon = plans.find(p => p.planKey === currentPlan)?.icon;
                return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
              })()}
            </div>
            <div>
              <p className="text-white font-semibold">Current Plan: {plans.find(p => p.planKey === currentPlan)?.name}</p>
              <p className="text-slate-400 text-sm">
                {user?.subscription_billing === 'yearly' ? 'Billed yearly' : 'Billed monthly'} ·
                Active since {user?.subscription_started_at ? new Date(user.subscription_started_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={handleCancel}>
            Cancel Subscription
          </Button>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Choose Your</span>{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Zeno Plan</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">Unlock premium sports analytics, health monitoring, and AI predictions.</p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-1 bg-slate-800/50 rounded-full p-1 border border-slate-700/50">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'yearly' ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Yearly
            <span className="ml-1.5 text-green-400 text-xs font-semibold">Save 20%</span>
          </button>
        </div>
      </div>

      {activating && (
        <div className="text-center mb-6">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
          <p className="text-slate-300 text-sm mt-2">Activating your plan...</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((planData, idx) => {
          const Icon = planData.icon;
          const isCurrent = currentPlan === planData.planKey;
          const price = billing === 'yearly' ? planData.price.yearly : planData.price.monthly;
          const period = billing === 'yearly' ? 'year' : 'month';
          const yearlySavings = planData.price.monthly * 12 - planData.price.yearly;

          return (
            <motion.div
              key={planData.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border p-6 ${planData.popular ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-slate-700/50'}`}
            >
              {planData.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <div className={`w-12 h-12 bg-gradient-to-br ${planData.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-1">{planData.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{planData.description}</p>
              <div className="mb-6">
                <span className="text-white text-4xl font-bold">${price}</span>
                <span className="text-slate-400 text-sm ml-1">/{period}</span>
                {billing === 'yearly' && price > 0 && (
                  <p className="text-green-400 text-xs mt-1">Save ${yearlySavings} per year</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                {planData.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(planData.planKey)}
                disabled={isCurrent || activating}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isCurrent
                  ? 'bg-slate-800 text-slate-400 cursor-default'
                  : planData.popular
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90'
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {!isCurrent && planData.price > 0 && <CreditCard className="w-4 h-4" />}
                {isCurrent ? '✓ Current Plan' : planData.price === 0 ? 'Free Forever' : planData.cta || `Upgrade to ${planData.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-slate-500 text-sm mt-8">
        Secure payments via Stripe. Cancel anytime. <a href="https://discord.gg/xQRGUjtZTm" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:underline">Join our Discord</a> for support.
      </p>
    </div>
  );
}