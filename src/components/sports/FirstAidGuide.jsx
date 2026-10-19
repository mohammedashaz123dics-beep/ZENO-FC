import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Phone, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  HandMetal,
  Wind,
  Activity,
  Clock,
  Zap,
  Droplets,
  ThermometerSun,
  Brain
} from 'lucide-react';

const emergencyProcedures = [
  {
    id: 'heart-attack',
    title: 'Heart Attack',
    icon: Heart,
    color: 'from-red-500 to-rose-600',
    symptoms: [
      'Chest pain or pressure (may spread to arm, jaw, neck)',
      'Shortness of breath',
      'Cold sweat, nausea, lightheadedness',
      'Anxiety or feeling of doom'
    ],
    steps: [
      { time: '0:00', action: 'Call emergency services immediately (911/112/999)', critical: true },
      { time: '0:30', action: 'Help person sit down in comfortable position (half-sitting is best)', critical: false },
      { time: '1:00', action: 'Loosen tight clothing (collar, belt, tie)', critical: false },
      { time: '1:30', action: 'If person has aspirin and is not allergic, give 1 adult aspirin (325mg) or 4 baby aspirin - have them CHEW it', critical: true },
      { time: '2:00', action: 'If prescribed nitroglycerin is available, help them take it', critical: false },
      { time: '3:00', action: 'Keep person calm, monitor breathing', critical: false },
      { time: 'Ongoing', action: 'If person becomes unresponsive, begin CPR immediately', critical: true },
    ],
    warnings: [
      'Do NOT leave the person alone',
      'Do NOT give aspirin if allergic or has bleeding disorder',
      'Do NOT let them walk or exert themselves'
    ]
  },
  {
    id: 'cardiac-arrest',
    title: 'Cardiac Arrest / CPR',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    symptoms: [
      'Person collapses suddenly',
      'No pulse or breathing',
      'Unresponsive to voice or touch',
      'Gasping or abnormal breathing'
    ],
    steps: [
      { time: '0:00', action: 'Check responsiveness - tap shoulders, shout "Are you okay?"', critical: true },
      { time: '0:10', action: 'Call 911 immediately or have someone call', critical: true },
      { time: '0:20', action: 'Request AED if available nearby', critical: false },
      { time: '0:30', action: 'Place person on firm, flat surface', critical: true },
      { time: '0:45', action: 'Begin chest compressions: Push HARD and FAST on center of chest', critical: true },
      { time: 'CPR', action: 'Compress 2 inches deep, 100-120 times per minute (beat of "Stayin\' Alive")', critical: true },
      { time: 'CPR', action: '30 compressions, then 2 rescue breaths (if trained)', critical: false },
      { time: 'CPR', action: 'If not trained in breaths, continue compressions only', critical: true },
      { time: 'AED', action: 'When AED arrives: Turn on, follow voice prompts exactly', critical: true },
      { time: 'Ongoing', action: 'Continue until emergency services arrive or person responds', critical: true },
    ],
    warnings: [
      'Do NOT stop CPR until help arrives',
      'Do NOT be afraid to push hard - ribs may crack, this is normal',
      'Do NOT check for pulse repeatedly - minimizes interruptions'
    ]
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich)',
    icon: Wind,
    color: 'from-blue-500 to-cyan-600',
    symptoms: [
      'Cannot speak, cry, or cough',
      'Clutching throat (universal choking sign)',
      'Skin turning blue',
      'Loss of consciousness if prolonged'
    ],
    steps: [
      { time: '0:00', action: 'Ask "Are you choking?" - if they cannot respond, act immediately', critical: true },
      { time: '0:10', action: 'Stand behind person, wrap arms around their waist', critical: true },
      { time: '0:15', action: 'Make a fist with one hand, place thumb side against abdomen (above navel, below ribcage)', critical: true },
      { time: '0:20', action: 'Grasp fist with other hand', critical: false },
      { time: '0:25', action: 'Give quick, upward thrusts into abdomen', critical: true },
      { time: 'Repeat', action: 'Continue thrusts until object is expelled or person becomes unconscious', critical: true },
      { time: 'If unconscious', action: 'Lower person to ground, call 911, begin CPR', critical: true },
    ],
    warnings: [
      'Do NOT perform on infants (use back blows instead)',
      'Do NOT slap a choking person on the back while standing',
      'Pregnant/obese: Use chest thrusts instead of abdominal'
    ]
  },
  {
    id: 'stroke',
    title: 'Stroke (FAST)',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
    symptoms: [
      'F - Face drooping on one side',
      'A - Arm weakness (one arm drifts down)',
      'S - Speech slurred or strange',
      'T - Time to call 911 immediately'
    ],
    steps: [
      { time: '0:00', action: 'Call 911 immediately - time is critical for stroke', critical: true },
      { time: '0:30', action: 'Note the exact time symptoms started (crucial for treatment)', critical: true },
      { time: '1:00', action: 'Keep person lying down with head slightly elevated', critical: false },
      { time: '1:30', action: 'Turn head to side if vomiting to prevent choking', critical: true },
      { time: '2:00', action: 'Loosen restrictive clothing', critical: false },
      { time: 'Ongoing', action: 'Keep person calm, do not give food or water', critical: true },
      { time: 'Ongoing', action: 'Monitor consciousness and breathing until help arrives', critical: true },
    ],
    warnings: [
      'Do NOT give any medications',
      'Do NOT give food or water (swallowing may be impaired)',
      'Do NOT let them "sleep it off" - every minute counts'
    ]
  },
  {
    id: 'heat-stroke',
    title: 'Heat Stroke',
    icon: ThermometerSun,
    color: 'from-orange-500 to-red-600',
    symptoms: [
      'Body temperature above 103°F (39.4°C)',
      'Hot, red, dry or damp skin',
      'Confusion, altered mental state',
      'Rapid, strong pulse'
    ],
    steps: [
      { time: '0:00', action: 'Call 911 - heat stroke is life-threatening', critical: true },
      { time: '0:30', action: 'Move person to cool/shaded area immediately', critical: true },
      { time: '1:00', action: 'Remove excess clothing', critical: false },
      { time: '1:30', action: 'Cool rapidly: Apply ice packs to neck, armpits, groin', critical: true },
      { time: '2:00', action: 'Spray with cool water and fan', critical: true },
      { time: '3:00', action: 'If conscious and able to drink, give cool water in small sips', critical: false },
      { time: 'Ongoing', action: 'Monitor temperature, continue cooling until help arrives', critical: true },
    ],
    warnings: [
      'Do NOT give fever-reducing medication',
      'Do NOT use alcohol to cool skin',
      'Do NOT give fluids if unconscious'
    ]
  },
  {
    id: 'severe-bleeding',
    title: 'Severe Bleeding',
    icon: Droplets,
    color: 'from-rose-500 to-red-700',
    symptoms: [
      'Blood spurting or flowing heavily',
      'Blood soaking through bandages',
      'Pale, cold, clammy skin',
      'Weakness, confusion, or unconsciousness'
    ],
    steps: [
      { time: '0:00', action: 'Call 911 for severe bleeding', critical: true },
      { time: '0:15', action: 'Apply direct pressure with clean cloth or bandage', critical: true },
      { time: '0:30', action: 'Press FIRMLY and do not lift to check', critical: true },
      { time: '1:00', action: 'If blood soaks through, add more material on top (don\'t remove)', critical: true },
      { time: '2:00', action: 'If limb: Elevate above heart level while maintaining pressure', critical: false },
      { time: '3:00', action: 'If still bleeding heavily, apply tourniquet 2-3 inches above wound', critical: true },
      { time: 'Ongoing', action: 'Keep person lying down, warm, and calm until help arrives', critical: true },
    ],
    warnings: [
      'Do NOT remove embedded objects',
      'Do NOT apply tourniquet over joints',
      'Note time if tourniquet applied - tell paramedics'
    ]
  }
];

function EmergencyCard({ procedure, isExpanded, onToggle }) {
  const Icon = procedure.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden"
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 rounded-xl bg-gradient-to-r ${procedure.color} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold">{procedure.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-800/80 rounded-b-xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Symptoms */}
              <div>
                <h4 className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Signs & Symptoms
                </h4>
                <ul className="space-y-1">
                  {procedure.symptoms.map((symptom, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Steps */}
              <div>
                <h4 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Emergency Steps
                </h4>
                <div className="space-y-2">
                  {procedure.steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 p-2 rounded-lg ${step.critical ? 'bg-red-500/20 border border-red-500/30' : 'bg-slate-700/50'}`}
                    >
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${step.critical ? 'bg-red-500/30 text-red-300' : 'bg-slate-600 text-slate-300'}`}>
                          <Clock className="w-3 h-3" />
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-sm ${step.critical ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {step.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Warnings */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <h4 className="text-red-400 text-sm font-semibold mb-2">⚠️ Important Warnings</h4>
                <ul className="space-y-1">
                  {procedure.warnings.map((warning, idx) => (
                    <li key={idx} className="text-red-300/90 text-sm">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FirstAidGuide() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="space-y-4">
      {/* Emergency Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl animate-pulse">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Emergency? Call Now!</h3>
            <p className="text-white/80 text-sm">Every second counts in an emergency</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <a href="tel:911" className="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-center transition-colors">
            <p className="text-white font-bold text-xl">911</p>
            <p className="text-white/70 text-xs">USA/Canada</p>
          </a>
          <a href="tel:112" className="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-center transition-colors">
            <p className="text-white font-bold text-xl">112</p>
            <p className="text-white/70 text-xs">Europe</p>
          </a>
          <a href="tel:999" className="bg-white/20 hover:bg-white/30 rounded-xl p-3 text-center transition-colors">
            <p className="text-white font-bold text-xl">999</p>
            <p className="text-white/70 text-xs">UK</p>
          </a>
        </div>
      </motion.div>

      {/* Procedures List */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <HandMetal className="w-5 h-5 text-amber-400" />
          First Aid Procedures
        </h3>
        {emergencyProcedures.map((procedure) => (
          <EmergencyCard
            key={procedure.id}
            procedure={procedure}
            isExpanded={expandedId === procedure.id}
            onToggle={() => setExpandedId(expandedId === procedure.id ? null : procedure.id)}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-800/50 rounded-xl p-3 text-center">
        <p className="text-slate-500 text-xs">
          This guide is for educational purposes. Always call emergency services first and follow their instructions.
        </p>
      </div>
    </div>
  );
}