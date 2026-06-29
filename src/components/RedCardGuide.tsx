import React, { useState } from 'react';
import { BookOpen, X, ArrowLeftRight } from 'lucide-react';

const RED_CARD_EXAMPLES = [
  {
    type: 'KAYFABE',
    title: 'The Kayfabe Rule',
    description: "Wrestling names must be the performer's in-ring persona unless specifically asked for their legal name. Staying in character is mandatory.",
    examples: [
      '"No, his name is The Undertaker, not Mark Calaway!"',
      '"You can\'t just call him Dwayne, it\'s The Rock!"',
      '"He was acting as Mankind in that match, not Dude Love."'
    ]
  },
  {
    type: 'VFX',
    title: 'The VFX Clarification',
    description: "Distinction between purely animated films and live-action films with heavy VFX elements. Only primary mediums count.",
    examples: [
      '"Avatar is mostly CGI, but it is classified as a live-action film."',
      '"The Lion King (2019) is technically animated, not live-action!"',
      '"Who Framed Roger Rabbit counts as a hybrid, but mostly live-action for this category."'
    ]
  },
  {
    type: 'MUPPET',
    title: 'The Muppet Clause',
    description: "Muppets are considered real entities within their own universe, distinct from standard animation or costumes.",
    examples: [
      '"Kermit the Frog is a Muppet, not a cartoon character!"',
      '"That\'s a person in a suit, not a true Henson Muppet."',
      '"Miss Piggy is billed as an actress, you have to use her character name!"'
    ]
  },
  {
    type: 'SEMANTICS',
    title: 'The Semantics Shield',
    description: "Minor mispronunciations or slight naming variations are accepted provided the core intent and identification are unmistakably correct.",
    examples: [
      '"They said \'Spider-Man\' instead of \'The Amazing Spider-Man\', close enough!"',
      '"It\'s pronounced \'Leviosa\', but we all know what they meant."',
      '"They forgot the \'The\' in the title, I\'m allowing it."'
    ]
  },
  {
    type: 'HOST_DISCRETION',
    title: 'Host Discretion',
    description: "The host has the ultimate final say in resolving a dispute or granting a subjective point based on situational context.",
    examples: [
      '"I\'m the host, and I say that answer is too vague. No points."',
      '"Technically wrong, but highly entertaining. Half a point!"',
      '"That\'s a huge stretch, I\'m vetoing that answer."'
    ]
  },
  {
    type: 'TIME_PENALTY',
    title: 'Time Penalty',
    description: "Interference, talking out of turn, or stalling will result in a time reduction or point deduction as deemed fit by the referee.",
    examples: [
      '"Team A, stop whispering answers to Team B! -1 point."',
      '"You took way too long to answer after the buzzer. Time is up!"',
      '"No distracting the other team during their turn!"'
    ]
  }
];

export const RedCardGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRightSide, setIsRightSide] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-1/2 -translate-y-1/2 ${
          isRightSide ? 'right-0 rounded-l-xl' : 'left-0 rounded-r-xl'
        } bg-arena-crimson hover:bg-red-600 text-white p-3 shadow-lg z-40 transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate focus-visible:ring-arena-crimson focus:outline-none`}
        aria-label="Open Red Card Guide"
      >
        <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div
      className={`fixed top-0 bottom-0 ${
        isRightSide ? 'right-0 border-l-4' : 'left-0 border-r-4'
      } w-80 bg-arena-navy/95 backdrop-blur-md border-arena-crimson shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-display text-arena-crimson uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Red Cards
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRightSide(!isRightSide)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson"
            title="Swap Side"
            aria-label={`Move guide to ${isRightSide ? 'left' : 'right'} side`}
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson"
            title="Close Guide"
            aria-label="Close Red Card Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {RED_CARD_EXAMPLES.map((card) => (
          <div key={card.type} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-display text-arena-amber mb-2 uppercase">{card.title}</h3>
            <p className="text-sm text-slate-300 mb-3">{card.description}</p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples:</span>
              <ul className="list-disc list-inside space-y-1">
                {card.examples.map((example, idx) => (
                  <li key={idx} className="text-sm text-slate-200 italic">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
