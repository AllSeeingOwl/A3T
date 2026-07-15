import re

# Update useGameStore.ts
with open('src/hooks/useGameStore.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'nextCard: () => void;\n  resetGame: () => void;',
    'nextCard: () => void;\n  endGame: () => void;\n  resetGame: () => void;'
)

old_ns = """  nextStep: () =>
    set((state) => {
      const nextStepIndex = (state.currentStepIndex + 1) as QuestionStep;
      if (nextStepIndex <= 2) {
        return {
          currentStepIndex: nextStepIndex,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }
      return { easyModeTeam: null };
    }),"""

new_ns = """  nextStep: () =>
    set((state) => {
      if (state.currentStepIndex < 2) {
        const nextStepIndex = (state.currentStepIndex + 1) as QuestionStep;
        return {
          currentStepIndex: nextStepIndex,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }

      // If we are at step 2, check for list question
      if (state.selectedDeck) {
        const currentCard = state.selectedDeck.cards[state.currentCardIndex];
        if (currentCard && currentCard.listQuestion && currentCard.listQuestion.enabled) {
          return {
            questionStage: 'LIST_ACTIVE',
            easyModeTeam: null,
          };
        }
      }
      return { easyModeTeam: null };
    }),"""
content = content.replace(old_ns, new_ns)

old_nc = """  nextCard: () =>
    set((state) => {
      if (state.selectedDeck && state.currentCardIndex + 1 < state.selectedDeck.cards.length) {
        return {
          currentCardIndex: state.currentCardIndex + 1,
          currentStepIndex: 0,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }
      return { easyModeTeam: null };
    }),"""

new_nc = """  nextCard: () =>
    set((state) => {
      if (state.selectedDeck && state.currentCardIndex + 1 < state.selectedDeck.cards.length) {
        return {
          currentCardIndex: state.currentCardIndex + 1,
          currentStepIndex: 0,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }
      // Out of cards -> End game
      return { currentScreen: 'SUMMARY', easyModeTeam: null };
    }),

  endGame: () => set({ currentScreen: 'SUMMARY' }),"""
content = content.replace(old_nc, new_nc)

with open('src/hooks/useGameStore.ts', 'w') as f:
    f.write(content)

# Update ArenaBoard.tsx
with open('src/components/ArenaBoard.tsx', 'r') as f:
    ab = f.read()

# Header props
ab = ab.replace(
    'parentTheme: string;\n}',
    'parentTheme: string;\n  onEndGame: () => void;\n}'
)
ab = ab.replace(
    'parentTheme }: ScoreboardHeaderProps) => {',
    'parentTheme, onEndGame }: ScoreboardHeaderProps) => {'
)

# Header button
header_btn = """      <button
        onClick={onEndGame}
        aria-label="End Game and View Summary"
        className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-full font-display uppercase text-xs tracking-wider transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none z-10"
      >
        Finish Match
      </button>
    </div>"""
ab = re.sub(r'        \{questionsRemaining > 0 \? `\$\{questionsRemaining\} Link\$\{questionsRemaining > 1 \? \'s\' : \'\'\} Remaining in Chain` : "Final Link in Chain"\}\n      </p>\n    </div>', '        {questionsRemaining > 0 ? `${questionsRemaining} Link${questionsRemaining > 1 ? \'s\' : \'\'} Remaining in Chain` : "Final Link in Chain"}\n      </p>\n    </div>', ab)
ab = ab.replace(
    '          {teams.teamB.score}\n        </span>\n      </div>\n    </div>',
    f'          {{teams.teamB.score}}\n        </span>\n      </div>\n{header_btn}'
)
ab = ab.replace(
    '<div className="flex justify-between items-center p-6 bg-arena-navy border-b border-slate-700 shadow-lg">',
    '<div className="relative flex justify-between items-center p-6 bg-arena-navy border-b border-slate-700 shadow-lg">'
)

# Destructuring
ab = ab.replace(
    'nextCard: state.nextCard,',
    'nextCard: state.nextCard,\n      endGame: state.endGame,'
)
ab = ab.replace(
    'nextCard,\n    setQuestionStage,',
    'nextCard,\n    endGame,\n    setQuestionStage,'
)

# Call header
ab = ab.replace(
    'parentTheme={activeCard.parentTheme}\n      />',
    'parentTheme={activeCard.parentTheme}\n        onEndGame={endGame}\n      />'
)

# List Question view
list_view = """        {questionStage === 'LIST_ACTIVE' || questionStage === 'LIST_REVEALED' ? (
           <div className="w-full max-w-4xl bg-arena-navy rounded-2xl p-8 border border-arena-gold shadow-[0_0_30px_rgba(251,191,36,0.2)] relative mb-8">
              <h3 className="text-2xl font-display text-arena-gold mb-4 uppercase flex items-center gap-2">
                 <span className="bg-arena-gold text-arena-slate px-2 py-1 rounded text-sm">Boss Battle</span>
                 List Question
              </h3>
              <p className="text-3xl text-white font-medium mb-4 leading-relaxed">
                 {activeCard.listQuestion.promptText}
              </p>
              <p className="text-lg text-slate-300 mb-8 font-sans">
                Target: Name <span className="font-bold text-white">{activeCard.listQuestion.requiredToPass}</span> items to win.
              </p>

              <div
                tabIndex={0}
                className="bg-arena-slate p-6 rounded-xl border border-slate-700 mt-8 relative group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-gold"
              >
                 <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-all duration-300 flex items-center justify-center z-10 cursor-pointer ${
                     questionStage === 'LIST_REVEALED'
                       ? 'opacity-0 pointer-events-none'
                       : 'group-hover:opacity-0 group-hover:backdrop-blur-none group-focus:opacity-0 group-focus:backdrop-blur-none'
                   }`}>
                    <span aria-hidden="true" className="text-slate-400 font-display uppercase tracking-widest flex items-center gap-2">
                       Hover or Focus to Reveal List
                    </span>
                 </div>
                 <div className="text-left space-y-2">
                    <span className="text-sm text-slate-500 uppercase tracking-wider block mb-4">Accepted Answers</span>
                    <ul className="list-disc list-inside text-2xl font-display text-emerald-400 grid grid-cols-2 gap-2">
                       {activeCard.listQuestion.correctItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        ) : (
        <>
        {/* Question Card */}"""
ab = ab.replace('        {/* Question Card */}', list_view)

ab = ab.replace(
    '</div>\n        </div>\n\n        {/* Host Controls */}',
    '</div>\n        </div>\n        </>\n        )}\n\n        {/* Host Controls */}'
)

# Handlers
old_correct = """  const handleCorrect = () => {
    addScore(activeTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      // Completed the chain
      nextCard();
    } else {
      nextStep();
    }
  };"""

new_correct = """  const handleCorrect = () => {
    addScore(activeTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  };"""
ab = ab.replace(old_correct, new_correct)

old_missed = """  const handleMissedOrNext = () => {
    if (questionStage === 'REVEALED_ANSWER') {
      if (currentStepIndex === 2) {
        nextCard();
      } else {
        nextStep();
      }
    } else {"""
new_missed = """  const handleMissedOrNext = () => {
    if (questionStage === 'REVEALED_ANSWER') {
      if (currentStepIndex === 2) {
        if (activeCard.listQuestion && activeCard.listQuestion.enabled) {
          nextStep();
        } else {
          nextCard();
        }
      } else {
        nextStep();
      }
    } else {"""
ab = ab.replace(old_missed, new_missed)

old_ec = """  const handleEasyCorrect = () => {
    // Correct in easy mode means they get 0 points, then we move on.
    if (currentStepIndex === 2) {
      nextCard();
    } else {
      nextStep();
    }
  };"""
new_ec = """  const handleEasyCorrect = () => {
    // Correct in easy mode means they get 0 points, then we move on.
    if (currentStepIndex === 2) {
      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  };"""
ab = ab.replace(old_ec, new_ec)

old_ei = """  const handleEasyIncorrect = () => {
    // Incorrect in easy mode means the *other* team gets full points, then we move on.
    const otherTeam = easyModeTeam === 'teamA' ? 'teamB' : 'teamA';
    addScore(otherTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      nextCard();
    } else {
      nextStep();
    }
  };"""
new_ei = """  const handleEasyIncorrect = () => {
    // Incorrect in easy mode means the *other* team gets full points, then we move on.
    const otherTeam = easyModeTeam === 'teamA' ? 'teamB' : 'teamA';
    addScore(otherTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  };"""
ab = ab.replace(old_ei, new_ei)

# Host controls for list
host_controls = """          {!easyModeTeam ? (
            <div className="flex gap-6">
               {(questionStage === 'LIST_ACTIVE' || questionStage === 'LIST_REVEALED') ? (
                 <>
                   <button onClick={() => { addScore(activeTeam, activeCard.listQuestion.points); nextCard(); }} className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg bg-arena-gold hover:bg-yellow-500 text-arena-slate focus-visible:ring-2 focus-visible:ring-arena-gold focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
                     List Completed (+{activeCard.listQuestion.points})
                   </button>
                   <button onClick={nextCard} className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg bg-slate-600 hover:bg-slate-500 text-white focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
                     List Failed / Next Chain
                   </button>
                 </>
               ) : (
                 <>
                 <div className="relative group flex">"""
ab = ab.replace(
    '          {!easyModeTeam ? (\n            <div className="flex gap-6">\n              <div className="relative group flex">',
    host_controls
)
ab = ab.replace(
    '                {getSecondaryButtonText()}\n              </button>\n            </div>',
    '                {getSecondaryButtonText()}\n              </button>\n                </>\n               )}\n            </div>'
)

with open('src/components/ArenaBoard.tsx', 'w') as f:
    f.write(ab)
