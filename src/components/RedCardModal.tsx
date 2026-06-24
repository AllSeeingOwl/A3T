import React from 'react';
import { useGameStore } from '../hooks/useGameStore';

export const RedCardModal: React.FC = () => {
  const { activeRedCard, setActiveRedCard } = useGameStore();

  if (!activeRedCard) return null;

  const getRedCardDetails = (type: string) => {
    switch (type) {
      case 'KAYFABE':
        return {
          title: "The Kayfabe Rule",
          description: "Wrestling names must be the performer's in-ring persona unless specifically asked for their legal name. Staying in character is mandatory."
        };
      case 'VFX':
        return {
          title: "The VFX Clarification",
          description: "Distinction between purely animated films and live-action films with heavy VFX elements. Only primary mediums count."
        };
      case 'MUPPET':
        return {
          title: "The Muppet Clause",
          description: "Muppets are considered real entities within their own universe, distinct from standard animation or costumes."
        };
      case 'SEMANTICS':
        return {
          title: "The Semantics Shield",
          description: "Minor mispronunciations or slight naming variations are accepted provided the core intent and identification are unmistakably correct."
        };
      default:
        return {
          title: "Official Warning",
          description: "Please refer to the official tournament rules."
        };
    }
  };

  const details = getRedCardDetails(activeRedCard);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/95 backdrop-blur-md p-4 w-full h-full">
      <div className="bg-arena-slate border-4 border-arena-crimson rounded-3xl p-12 max-w-2xl w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] relative overflow-hidden">

        {/* Background visual element */}
        <div className="absolute -right-20 -top-20 opacity-10">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/>
            <path d="M16 15.5v.01"/>
            <path d="M12 12v.01"/>
            <path d="M11 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
            <path d="M11 7a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
          </svg>
        </div>

        <h2 className="text-4xl font-display text-arena-crimson mb-2 uppercase tracking-widest relative z-10">
          Frozen Board
        </h2>
        <h3 className="text-2xl font-display text-white mb-8 uppercase relative z-10">
          Referee Intercession
        </h3>

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 mb-10 relative z-10">
          <h4 className="text-3xl font-display text-arena-amber mb-4">{details.title}</h4>
          <p className="text-xl text-slate-300 leading-relaxed">{details.description}</p>
        </div>

        <button
          onClick={() => setActiveRedCard(null)}
          className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-display text-2xl uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] relative z-10"
        >
          Release Board & Resume Play
        </button>
      </div>
    </div>
  );
};
