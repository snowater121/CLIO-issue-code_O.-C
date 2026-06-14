import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, CassetteTape as Tape, ChevronRight, Zap } from "lucide-react";
import { audioSynth } from "../services/audioService";

interface LobbyScreenProps {
  userName: string | null;
  onEnter: (name: string) => void;
  onReset?: () => void;
}

const PROFESSOR_NAMES_LOWER = ["전준현", "준현", "교수님", "선생님", "prof", "professor"];

export default function LobbyScreen({ userName, onEnter, onReset }: LobbyScreenProps) {
  const [inputName, setInputName] = useState(userName ? userName.split(" (")[0] : "");
  const [studentId, setStudentId] = useState(userName && userName.includes(" (") ? userName.split(" (")[1].replace(")", "") : "");
  const [isEnteringName, setIsEnteringName] = useState(!userName);
  const [activeLineCount, setActiveLineCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isIdFocused, setIsIdFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [transitionState, setTransitionState] = useState<"idle" | "glitch" | "crt-collapse">("idle");

  const triggerEnter = (name: string, id: string = "") => {
    setTransitionState("glitch");
    const fullName = id.trim() ? `${name.trim()} (${id.trim()})` : name.trim();
    
    setTimeout(() => {
      setTransitionState("crt-collapse");
      
      setTimeout(() => {
        onEnter(fullName);
      }, 400);
    }, 750);
  };

  const bootLinesText = [
    "SAMSUNG CRT-1997 / BIOS v2.04",
    "CLIO BROADCAST SYSTEM — INITIALIZING...",
    "SIGNAL CHECK: ██████████ OK",
    "TAPE-33 DETECTED — REC READY",
    "LOOP_COUNT: 008",
    "EPISODE 1 — STANDBY"
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Boot line timer sequence
    bootLinesText.forEach((_, idx) => {
      const delay = 280 + idx * 320;
      const t = setTimeout(() => {
        setActiveLineCount(idx + 1);
      }, delay);
      timers.push(t);
    });

    // Show form timer
    const formTimer = setTimeout(() => {
      setShowForm(true);
    }, 280 + (bootLinesText.length - 1) * 320 + 400);
    timers.push(formTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    setInputName(userName || "");
    setIsEnteringName(!userName);
  }, [userName]);

  // Focus input automatically when showForm and isEnteringName are true
  useEffect(() => {
    if (showForm && isEnteringName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showForm, isEnteringName]);

  const handleStart = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (inputName.trim()) {
      triggerEnter(inputName.trim(), studentId.trim());
    } else {
      setIsEnteringName(true);
    }
  };

  const isProf = PROFESSOR_NAMES_LOWER.includes(inputName.trim().toLowerCase());

  return (
    <div className="min-h-screen w-full bg-void flex flex-col items-center justify-center font-mono p-4 md:p-8 relative overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-dim/5 to-transparent pointer-events-none" />
      
      <div className="max-w-xl w-full space-y-8 text-center relative z-10 flex flex-col items-center justify-center py-6">
        {/* Boot Lines Section */}
        <div className="w-full text-left space-y-1.5 mb-2 font-mono text-[13px] tracking-wide select-none min-h-[120px]">
          {bootLinesText.map((line, idx) => {
            const isVisible = idx < activeLineCount;
            const isLast = idx === bootLinesText.length - 1;
            return (
              <div 
                key={idx}
                style={{ 
                  color: isLast 
                    ? "var(--ph-dim)" 
                    : idx === 0 
                      ? "var(--ph-bright)" 
                      : "var(--ph-mid)",
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.3s ease-in-out"
                }}
                className={`font-black font-mono select-text`}
              >
                {isVisible ? `> ${line}` : ""}
              </div>
            );
          })}
        </div>

        {/* CLIO Title Section */}
        <div className="space-y-2 select-none">
          <h1 
            style={{ 
              fontFamily: 'var(--font-vt323), "VT323", monospace', 
              fontSize: "72px",
              color: "var(--ph-core)",
              textShadow: "0 0 30px rgba(184,212,74,0.5)"
            }}
            className="font-extrabold uppercase tracking-[0.2em] leading-none mb-1 text-center"
          >
            CLIO
          </h1>
          <div 
            style={{ 
              fontSize: "20px", 
              color: "var(--ph-dim)" 
            }}
            className="tracking-[0.4em] uppercase font-bold text-center h-6"
          >
            THE LAST BROADCAST
          </div>
        </div>

        {/* Animatepresence for Analog Boot sequence delay of form */}
        <div className="w-full min-h-[300px] flex items-center justify-center">
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full bg-card border border-dim p-8 rounded-md space-y-8 shadow-2xl backdrop-blur-md"
              >
                {isEnteringName ? (
                  <div className="space-y-6 py-2">
                    <div className="flex flex-col items-center gap-3">
                       <label className="text-[10px] text-bright uppercase tracking-[0.3em] font-black">
                         OPERATOR_ID_REQUIRED:
                       </label>
                       
                       <form onSubmit={handleStart} className="w-full max-w-xs relative group flex flex-col items-center gap-3">
                         <input 
                           ref={inputRef}
                           type="text"
                           style={{
                             borderColor: isProf 
                               ? "var(--amber-dim)" 
                               : isFocused 
                                 ? "var(--ph-dim)" 
                                 : "var(--ph-dark)",
                             color: isProf ? "var(--amber-bright)" : "var(--ph-bright)",
                             boxShadow: isProf 
                               ? undefined 
                               : isFocused 
                                 ? "0 0 16px rgba(90,124,26,0.3)" 
                                 : "none"
                           }}
                           className={`w-full bg-void border rounded py-3 px-4 text-center outline-none font-mono text-xl uppercase tracking-[0.3em] transition-all ${
                             isProf ? "animate-amber-pulse" : ""
                           }`}
                           placeholder="TYPE_NAME"
                           value={inputName}
                           onChange={(e) => {
                              setInputName(e.target.value);
                              audioSynth.playTypewriter();
                            }}
                           maxLength={12}
                           onFocus={() => setIsFocused(true)}
                           onBlur={() => setIsFocused(false)}
                         />

                         <input 
                           type="text"
                           style={{
                             borderColor: isIdFocused 
                               ? "var(--ph-dim)" 
                               : "var(--ph-dark)",
                             color: "var(--ph-bright)",
                             boxShadow: isIdFocused 
                               ? "0 0 16px rgba(90,124,26,0.2)" 
                               : "none"
                           }}
                           className="w-full bg-void border rounded py-3 px-4 text-center outline-none font-mono text-sm tracking-[0.16em] transition-all"
                           placeholder="STUDENT ID (학번)"
                           value={studentId}
                           onChange={(e) => {
                              setStudentId(e.target.value);
                              audioSynth.playTypewriter();
                            }}
                           maxLength={15}
                           onFocus={() => setIsIdFocused(true)}
                           onBlur={() => setIsIdFocused(false)}
                         />
                         
                         {isProf && (
                           <div 
                             style={{ color: "var(--amber-bright)" }}
                             className="text-[11px] font-bold mt-2.5 animate-pulse flex items-center gap-1.5 uppercase tracking-wide"
                           >
                             ⚠️ 교수님 계정이 감지되었습니다
                           </div>
                         )}

                         <ChevronRight className="absolute -left-6 top-[22px] -translate-y-1/2 w-5 h-5 text-bright animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity" />
                       </form>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button 
                        type="button"
                        onClick={() => setIsEnteringName(false)}
                        className="px-6 py-2.5 border border-dim text-mid bg-card uppercase tracking-widest text-xs font-bold transition-all rounded"
                      >
                        [ Cancel ]
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStart()}
                        disabled={!inputName.trim()}
                        style={{
                          borderColor: isProf ? "var(--amber-dim)" : "var(--ph-dim)",
                          color: isProf ? "var(--amber-bright)" : "var(--ph-bright)"
                        }}
                        className="px-8 py-2.5 bg-card border uppercase tracking-[0.25em] font-black text-xs transition-with-all shadow-md rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Confirm_ID
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 py-2">
                    <div className="text-xs text-bright uppercase tracking-[0.2em] font-black bg-void px-4 py-2 border border-dim rounded shadow-md">
                      Welcome_Back: <span className="text-bright font-extrabold">{userName}</span>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => triggerEnter(userName!)}
                      style={{ borderColor: "var(--ph-dim)", color: "var(--ph-bright)" }}
                      className="w-full max-w-xs py-4 border bg-card uppercase tracking-[0.3em] font-black text-xs transition-all flex items-center justify-center gap-2 rounded shadow-lg cursor-pointer hover:shadow-[0_0_12px_var(--glow)]"
                    >
                      연구실 입장 <ChevronRight className="w-5 h-5 animate-pulse" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsEnteringName(true)}
                      className="text-xs text-mid hover:text-bright uppercase tracking-[0.25em] font-bold transition-colors underline underline-offset-4 cursor-pointer bg-transparent border-none!"
                    >
                      [ Change_Identity ]
                    </button>
                  </div>
                )}

                {/* Footer status markers inside card */}
                <div className="flex items-center justify-center gap-6 text-[10px] text-mid uppercase tracking-[0.2em] font-bold pt-4 border-t border-dim/30">
                  <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-bright" /> Auto_Save: ON</span>
                  <span className="flex items-center gap-1.5"><Tape className="w-3.5 h-3.5 text-bright" /> Tape: READY</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HARD RESET TRIGGER BUTTON */}
        <AnimatePresence>
          {showForm && onReset && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6 mt-4 w-full"
            >
              <button 
                type="button"
                onClick={onReset}
                className="text-xs text-bright bg-card hover:bg-void border border-bright px-6 py-3.5 rounded tracking-[0.15em] font-black uppercase transition-all duration-300 active:scale-95 cursor-pointer shadow-lg"
              >
                [ 🚨 TERMINATE_SYSTEM_MEMORY & HARD_REBOOT ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 opacity-20 flex flex-col gap-1 font-bold text-[8px] md:text-[9px] uppercase tracking-widest text-mid pointer-events-none">
        <div>Signal: 2.04ghz</div>
        <div>Oscillation: True</div>
        <div>System: ONLINE</div>
      </div>

      <AnimatePresence>
        {transitionState !== "idle" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: "var(--bg-void)", zIndex: 9999 }}
            className="fixed inset-0 flex flex-col items-center justify-center font-mono pointer-events-auto"
          >
            {/* Glitch lines & Scanning Effect */}
            {transitionState === "glitch" && (
              <div id="transition-glitch-container" className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                {/* Animated glitch blocks */}
                <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                  <div className="w-full h-8 bg-[var(--ph-core)] absolute top-1/4 animate-pulse opacity-20" style={{ filter: "blur(4px)" }} />
                  <div className="w-full h-12 bg-[var(--ph-mid)] absolute top-2/3 animate-pulse opacity-10" style={{ filter: "blur(2px)" }} />
                  <div className="w-full h-3 bg-[var(--ph-bright)] absolute top-1/3 animate-ping opacity-30" />
                </div>
                
                {/* Scanning lines */}
                <div 
                  className="w-full h-0.5 bg-[var(--ph-core)] absolute top-0 left-0"
                  style={{
                    animation: "scanline-sweep 0.4s linear infinite",
                    boxShadow: "0 0 10px var(--ph-core)"
                  }}
                />

                <div 
                  style={{ background: "var(--bg-card)", borderColor: "var(--ph-dark)" }}
                  className="space-y-4 text-center select-none z-10 p-6 border rounded min-w-[320px]"
                >
                  <div 
                    style={{ color: "var(--ph-bright)" }}
                    className="text-[11px] uppercase tracking-[0.25em] font-black animate-pulse flex items-center justify-center gap-1.5"
                  >
                    <span 
                      style={{ backgroundColor: "var(--amber-bright)" }}
                      className="w-2.5 h-2.5 rounded-full animate-ping" 
                    />
                    ESTABLISHING TRANSMISSION LINK...
                  </div>
                  <div 
                    style={{ color: "var(--ph-mid)" }}
                    className="text-[13px] uppercase tracking-[0.15em] font-bold"
                  >
                    CONNECTING TO TAPE-33 FEED
                  </div>
                  <div 
                    style={{ borderColor: "var(--ph-dark)" }}
                    className="w-full bg-void h-2 border rounded-sm overflow-hidden p-[1px]"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.7 }}
                      style={{ backgroundColor: "var(--ph-core)" }}
                      className="h-full rounded-sm"
                    />
                  </div>
                  <div 
                    style={{ color: "var(--ph-dim)" }}
                    className="text-[9px] select-text font-black uppercase tracking-wider"
                  >
                    PORT: 3000 // CAM_FEED_OK // OSC_OK
                  </div>
                </div>
              </div>
            )}

            {/* Elegant CRT power-off line collapse */}
            {transitionState === "crt-collapse" && (
              <div id="transition-collapse-container" className="absolute inset-0 flex items-center justify-center bg-void">
                <motion.div
                  initial={{ width: "100%", height: "100%", opacity: 1 }}
                  animate={{ 
                    height: ["100%", "2px", "2px", "0px"],
                    width: ["100%", "100%", "2px", "0px"],
                    opacity: [1, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.4, 
                    times: [0, 0.4, 0.8, 1],
                    ease: "easeInOut" 
                  }}
                  style={{ backgroundColor: "var(--ph-core)", boxShadow: "0 0 20px var(--ph-core)" }}
                  className="relative"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
