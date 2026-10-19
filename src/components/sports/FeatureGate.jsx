import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Rocket } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function FeatureGate({ requiredPlan, featureName, description, children }) {
  const { plan } = useSubscription();

  const planLevel = { free: 0, sporty: 1, peak: 2 };
  const hasAccess = (planLevel[plan] || 0) >= (planLevel[requiredPlan] || 0);

  if (hasAccess) return children;

  const planLabel = requiredPlan === 'sporty' ? 'Zeno Sporty' : 'Zeno Peak';

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-orange-500/20 rounded-2xl mb-3">
          <Lock className="w-8 h-8 text-orange-400" />
        </div>
        <p className="text-white font-semibold text-lg mb-1">{featureName}</p>
        {description && <p className="text-slate-400 text-sm mb-3 max-w-xs">{description}</p>}
        <p className="text-slate-500 text-xs mb-4">Available on {planLabel} and above</p>
        <Link
          to="/Subscriptions"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Rocket className="w-4 h-4" /> Upgrade Now
        </Link>
      </div>
    </div>
  );
}