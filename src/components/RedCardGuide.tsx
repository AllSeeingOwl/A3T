import React, { useState, useEffect, memo } from 'react';
import { BookOpen, X, ArrowLeftRight } from 'lucide-react';

export interface RedCardCategory {
  title: string;
  cards: RedCard[];
}

export interface RedCard {
  type: string;
  suggestedPenalties?: string[];
  title: string;
  description: string;
  examples: string[];
}

export const RED_CARD_CATEGORIES: RedCardCategory[] = [
  {
    "title": "Category Violations",
    "cards": [
      {
        "type": "KAYFABE",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 1: The \"Kayfabe\" Violation",
        "description": "Within this game, wrestling storylines are treated as factual history.",
        "examples": [
          "\"But wrestling is fake!\" \u2014 Denied. If it happened on screen, it counts.",
          "\"The Undertaker and Kane aren't really brothers!\" \u2014 Denied. In-universe, they are.",
          "\"He was acting as Mankind, not Dude Love.\" \u2014 Accepted. Persona matters."
        ]
      },
      {
        "type": "MMA",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 2: The \"MMA\" Violation",
        "description": "Boxing and MMA are Combat Sports, not Pro Wrestling. Unless it happened in a wrestling ring (e.g., Floyd Mayweather vs. Big Show), it is disqualified.",
        "examples": [
          "\"Does Conor McGregor in UFC count?\" \u2014 Disqualified.",
          "\"Mike Tyson in Punch-Out??\" \u2014 Disqualified. That's boxing.",
          "\"What about Logan Paul?\" \u2014 Accepted, but only for his WWE matches."
        ]
      },
      {
        "type": "REMAKE",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 3: The \"Remake\" Violation",
        "description": "Marketing defines the medium. A live-action remake does not change the answer to a question about the original animated film.",
        "examples": [
          "\"But in the Live-Action movie...\" \u2014 Denied. Stick to the original.",
          "\"Will Smith was the Genie!\" \u2014 Denied if the question specifies the 1992 animated Aladdin.",
          "\"The new Little Mermaid changed the lyrics!\" \u2014 Denied if asking about the 1989 classic."
        ]
      }
    ]
  },
  {
    "title": "Medium Violations",
    "cards": [
      {
        "type": "MUPPET",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 4: The \"Muppet\" Violation",
        "description": "Puppetry is a live-action performance (wires/hands). Stop-Motion (Wallace & Gromit) is Animation (frame-by-frame).",
        "examples": [
          "\"Does The Muppets count as Animation?\" \u2014 Disqualified. They are puppets.",
          "\"What about Team America?\" \u2014 Disqualified. Marionettes are live-action.",
          "\"Nightmare Before Christmas is a puppet movie!\" \u2014 Disqualified. Stop-motion is animation."
        ]
      },
      {
        "type": "VFX",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 5: The \"VFX\" Violation",
        "description": "If the studio markets it as \"Live Action,\" it is Live Action. Visual Effects are a tool, not a genre.",
        "examples": [
          "\"The 2019 Lion King is all CGI, so it's Animation.\" \u2014 Disqualified.",
          "\"Avatar is a cartoon.\" \u2014 Disqualified.",
          "\"Andy Serkis as Gollum counts as animation.\" \u2014 Disqualified. Motion capture is VFX in live-action."
        ]
      },
      {
        "type": "INFLUENCER",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 6: The \"Influencer\" Violation",
        "description": "A person simply playing a game does not count. The Exception: If they appear IN the game as an official skin or NPC (e.g., Ninja in Fortnite), they count.",
        "examples": [
          "\"Is PewDiePie a Video Game character?\" \u2014 Disqualified.",
          "\"I'm talking about the Dr Disrespect skin!\" \u2014 Accepted (if in the game).",
          "\"Markiplier played it!\" \u2014 Disqualified. Playing doesn't make them a character."
        ]
      },
      {
        "type": "HOLLYWOOD",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 7: The \"Hollywood\" Violation",
        "description": "An actor is distinct from their wrestler persona. Questions must be about their time in the wrestling industry or movies specifically about pro wrestling (Ready to Rumble).",
        "examples": [
          "\"Does Dave Bautista in Dune count as a Wrestling question?\" \u2014 Disqualified.",
          "\"The Rock in Fast & Furious!\" \u2014 Disqualified.",
          "\"John Cena in Peacemaker!\" \u2014 Disqualified."
        ]
      }
    ]
  },
  {
    "title": "Canon Violations",
    "cards": [
      {
        "type": "BOOTLEG",
        "suggestedPenalties": ["Lose 1 point", "Skip current turn"],
        "title": "Red Card 8: The \"Bootleg\" Violation",
        "description": "OFFICIAL RELEASES ONLY. Fan mods, ROM hacks, and fan-fiction are invalid unless the question specifically asks about \"Fan Culture.\"",
        "examples": [
          "\"But that happened in the Kaizo Mario mod!\" \u2014 Disqualified.",
          "\"In my favorite fanfic...\" \u2014 Disqualified.",
          "\"The Randomizer mod changes that!\" \u2014 Disqualified."
        ]
      },
      {
        "type": "TOYBOX",
        "suggestedPenalties": ["Lose 1 point", "Skip current turn"],
        "title": "Red Card 9: The \"Toybox\" Violation",
        "description": "SCREEN TRUMPS PLASTIC. Toy accessories do not override the source material (Game/Show/Match).",
        "examples": [
          "\"His action figure came with a laser gun!\" \u2014 Denied.",
          "\"The vehicle wasn't in the movie, but I had the toy!\" \u2014 Denied.",
          "\"The color on the figure was different!\" \u2014 Denied. Screen accuracy wins."
        ]
      },
      {
        "type": "EASTER_EGG",
        "suggestedPenalties": ["Lose 1 point", "Skip current turn"],
        "title": "Red Card 10: The \"Easter Egg\" Violation",
        "description": "A reference is not a cast member. To count, a character must speak, influence the plot, or be interactable.",
        "examples": [
          "\"Mario is in Zelda because there is a picture of him on a wall.\" \u2014 Disqualified.",
          "\"You can see R2-D2 in Star Trek!\" \u2014 Disqualified.",
          "\"Pac-Man is on a screen in the background!\" \u2014 Disqualified."
        ]
      }
    ]
  },
  {
    "title": "Gameplay & Mechanics Violations",
    "cards": [
      {
        "type": "MOTION",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 11: The \"Motion\" Violation",
        "description": "If it is drawn, painted, or illustrated, IT COUNTS as Visual Storytelling.",
        "examples": [
          "\"That's not animation, it's a book/comic!\" \u2014 Denied.",
          "\"It's a visual novel!\" \u2014 Accepted.",
          "\"It's just animatics/storyboards!\" \u2014 Accepted."
        ]
      },
      {
        "type": "CASUAL",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 12: The \"Casual\" Violation",
        "description": "If it is electronic, interactive, and has a win/loss state or narrative, IT IS A VIDEO GAME. (e.g., Angry Birds is as valid as Elden Ring.)",
        "examples": [
          "\"Candy Crush isn't a REAL video game!\" \u2014 Denied.",
          "\"Mobile games don't count!\" \u2014 Denied.",
          "\"Browser games aren't real games!\" \u2014 Denied."
        ]
      },
      {
        "type": "RETCON",
        "suggestedPenalties": ["Skip current turn", "Opponent gets 1 point"],
        "title": "Red Card 13: The \"Retcon\" Violation",
        "description": "ICONIC STATUS WINS. Unless the question specifies \"Current Continuity,\" the most famous/original version of the fact is accepted.",
        "examples": [
          "\"Disney wiped that from canon!\" \u2014 Denied.",
          "\"That was changed in the 2015 reboot!\" \u2014 Denied.",
          "\"George Lucas changed it in the Special Edition!\" \u2014 Original version is usually accepted."
        ]
      },
      {
        "type": "IMPORT",
        "suggestedPenalties": ["Host Discretion: Warn or Skip turn"],
        "title": "Red Card 14: The \"Import\" Violation",
        "description": "ACCEPTED (BUT DON'T BE SMUG). Both the original Japanese title and the localised title are correct. No bonus points for showing off.",
        "examples": [
          "\"It's Biohazard, not Resident Evil!\" \u2014 Accepted, but don't be smug.",
          "\"It's technically the Famicom, not NES!\" \u2014 Accepted, but don't be smug.",
          "\"Actually, his name is Gouki, not Akuma!\" \u2014 Accepted, but don't be smug."
        ]
      },
      {
        "type": "SEMANTICS",
        "suggestedPenalties": ["Host Discretion: Warn or Skip turn"],
        "title": "Red Card 15: The \"Semantics\" Violation",
        "description": "INTENT OVER SYNTAX. Colloquial answers are accepted unless the question is a specific \"Trick Question\" designed to test the misconception.",
        "examples": [
          "\"Technically, Link is a Hylian, not a human\" \u2014 Denied.",
          "\"Frankenstein is the Doctor, not the Monster.\" \u2014 Accepted only if it's a trick question.",
          "\"They said 'Spider-Man' instead of 'The Amazing Spider-Man'!\" \u2014 Denied, close enough."
        ]
      },
      {
        "type": "SPEEDRUN",
        "suggestedPenalties": ["Lose 1 point", "Skip current turn"],
        "title": "Red Card 16: The \"Speedrun\" Violation",
        "description": "INTENDED PLAY ONLY. Answers must reflect the standard, intended narrative or gameplay experience, not code-breaking, glitches, or sequence breaks.",
        "examples": [
          "\"Actually, you don't need the Blue Key if you use the wall-clip glitch.\" \u2014 Denied.",
          "\"You can skip that boss!\" \u2014 Denied.",
          "\"The Any% route doesn't go there.\" \u2014 Denied."
        ]
      }
    ]
  },
  {
    "title": "Referee Tools",
    "cards": [
      {
        "type": "HOST_DISCRETION",
        "suggestedPenalties": ["Award custom points (+0.5)", "Veto answer entirely"],
        "title": "Host Discretion",
        "description": "The host has the ultimate final say in resolving a dispute or granting a subjective point based on situational context.",
        "examples": [
          "\"I'm the host, and I say that answer is too vague. No points.\"",
          "\"Technically wrong, but highly entertaining. Half a point!\"",
          "\"That's a huge stretch, I'm vetoing that answer.\""
        ]
      },
      {
        "type": "TIME_PENALTY",
        "suggestedPenalties": ["Lose 1 point", "Reduce timer by 3s"],
        "title": "Time Penalty",
        "description": "Interference, talking out of turn, or stalling will result in a time reduction or point deduction as deemed fit by the referee.",
        "examples": [
          "\"Team A, stop whispering answers to Team B! -1 point.\"",
          "\"You took way too long to answer after the buzzer. Time is up!\"",
          "\"No distracting the other team during their turn!\""
        ]
      }
    ]
  }
];

// ⚡ Bolt Optimization: Pre-compute a record index for O(1) Red Card Category lookups
// This avoids O(N) array filtering when opening the modal for a specific violation type.
export const RED_CARD_CATEGORY_INDEX: Record<string, RedCardCategory> = {
  "CATEGORY_VIOLATIONS": RED_CARD_CATEGORIES[0],
  "MEDIUM_VIOLATIONS": RED_CARD_CATEGORIES[1],
  "CANON_VIOLATIONS": RED_CARD_CATEGORIES[2],
  "GAMEPLAY_VIOLATIONS": RED_CARD_CATEGORIES[3],
  "REFEREE_TOOLS": RED_CARD_CATEGORIES[4]
};








// ⚡ Bolt Optimization: Memoize the long list of static rules and examples.
// This prevents over 100 DOM nodes from re-rendering every time the user
// toggles the RedCardGuide from the left side of the screen to the right side.
const RedCardList = memo(() => (
  <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
    {RED_CARD_CATEGORIES.map((category) => (
      <div key={category.title} className="space-y-4">
        <h3 className="text-xl font-display text-white border-b border-slate-700 pb-2">{category.title}</h3>
        <div className="space-y-6">
          {category.cards.map((card) => {
            const isRefereeTool = category.title === 'Referee Tools';
            const borderColor = isRefereeTool ? 'border-amber-500' : 'border-slate-700';
            const headerColor = isRefereeTool ? 'text-amber-500' : 'text-arena-amber';
            const bgColor = isRefereeTool ? 'bg-amber-950/30' : 'bg-slate-800/50';

            return (
              <div key={card.type} className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
                <h4 className={`text-lg font-display ${headerColor} mb-2 uppercase`}>{card.title}</h4>
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
                  {card.suggestedPenalties && card.suggestedPenalties.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <span className="text-xs font-bold text-arena-crimson uppercase tracking-wider block mb-1">Suggested Penalties:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {card.suggestedPenalties.map((penalty, idx) => (
                          <li key={`penalty-${idx}`} className="text-sm text-arena-amber">
                            {penalty}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
));
RedCardList.displayName = 'RedCardList';

export const RedCardGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRightSide, setIsRightSide] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-1/2 -translate-y-1/2 ${
          isRightSide ? 'right-0 rounded-l-xl' : 'left-0 rounded-r-xl'
        } bg-arena-crimson hover:bg-red-600 text-white p-3 shadow-lg z-40 transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate focus-visible:ring-arena-crimson focus:outline-none flex items-center justify-center`}
        aria-label="Open Red Card Guide"
      >
        <BookOpen aria-hidden="true" className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span
          aria-hidden="true"
          className={`absolute ${
            isRightSide ? 'right-full mr-2' : 'left-full ml-2'
          } whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide`}
        >
          Open Red Card Guide
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Red Card Guide"
      className={`fixed top-0 bottom-0 ${
        isRightSide ? 'right-0 border-l-4' : 'left-0 border-r-4'
      } w-80 bg-arena-navy/95 backdrop-blur-md border-arena-crimson shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-display text-arena-crimson uppercase tracking-wider flex items-center gap-2">
          <BookOpen aria-hidden="true" className="w-5 h-5" />
          Red Cards
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRightSide(!isRightSide)}
            className="group relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson"
            aria-label={`Move guide to ${isRightSide ? 'left' : 'right'} side`}
          >
            <ArrowLeftRight aria-hidden="true" className="w-5 h-5" />
            <span
              aria-hidden="true"
              className="absolute right-0 top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50"
            >
              Swap Side
            </span>
          </button>
          <button
            autoFocus
            onClick={() => setIsOpen(false)}
            className="group relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson"
            aria-label="Close Red Card Guide"
          >
            <X aria-hidden="true" className="w-5 h-5" />
            <span
              aria-hidden="true"
              className="absolute right-0 top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50 flex items-center gap-1.5"
            >
              <span>Close Guide</span>
              <kbd className="font-sans text-[10px] bg-slate-700 border border-slate-500 px-1 py-0.5 rounded text-slate-300 shadow-inner">Esc</kbd>
            </span>
          </button>
        </div>
      </div>


      {/* Content */}
      <RedCardList />
    </div>
  );
};
