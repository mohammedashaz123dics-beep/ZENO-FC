import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const PLAN_LIMITS = {
  free: {
    label: 'Zeno Free',
    predictionsPerDay: 5,
    advancedHealth: false,
    adFree: false,
    proStrategy: false,
    historicalTrends: false,
    customWorkouts: false,
  },
  sporty: {
    label: 'Zeno Sporty',
    predictionsPerDay: Infinity,
    advancedHealth: true,
    adFree: true,
    proStrategy: false,
    historicalTrends: false,
    customWorkouts: false,
  },
  peak: {
    label: 'Zeno Peak',
    predictionsPerDay: Infinity,
    advancedHealth: true,
    adFree: true,
    proStrategy: true,
    historicalTrends: true,
    customWorkouts: true,
  },
};

const FREE_PREDICTION_LIMIT = 5;

export function useSubscription() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const plan = user?.subscription_plan || 'free';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const getPredictionStatus = useCallback(() => {
    if (plan !== 'free') return { allowed: true, remaining: Infinity, used: 0, limit: Infinity };

    const today = new Date().toISOString().split('T')[0];
    const lastDate = user?.last_prediction_date;
    const used = lastDate === today ? (user?.predictions_today || 0) : 0;

    return {
      allowed: used < FREE_PREDICTION_LIMIT,
      remaining: Math.max(0, FREE_PREDICTION_LIMIT - used),
      used,
      limit: FREE_PREDICTION_LIMIT,
    };
  }, [plan, user]);

  const recordPrediction = useCallback(async () => {
    if (plan !== 'free') return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = user?.last_prediction_date;
      if (lastDate !== today) {
        await base44.auth.updateMe({ predictions_today: 1, last_prediction_date: today });
      } else {
        await base44.auth.updateMe({ predictions_today: (user?.predictions_today || 0) + 1 });
      }
      await fetchUser();
    } catch (e) {
      console.error('Failed to record prediction:', e);
    }
  }, [plan, user, fetchUser]);

  const activatePlan = useCallback(async (planName, billing) => {
    await base44.auth.updateMe({
      subscription_plan: planName,
      subscription_billing: billing,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
    });
    await fetchUser();
  }, [fetchUser]);

  const cancelPlan = useCallback(async () => {
    await base44.auth.updateMe({
      subscription_plan: 'free',
      subscription_status: 'cancelled',
      subscription_billing: null,
    });
    await fetchUser();
  }, [fetchUser]);

  return {
    user, plan, limits, loading,
    getPredictionStatus, recordPrediction, activatePlan, cancelPlan,
    refresh: fetchUser,
  };
}