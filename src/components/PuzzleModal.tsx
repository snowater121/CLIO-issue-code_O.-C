import { useState, useEffect, useRef, FormEvent } from "react";
import { motion } from "motion/react";
import { Lock, Unlock, HelpCircle } from "lucide-react";

interface PuzzleModalProps {
  puzzle: {
    id: string;
    label: string;
    data: {
      crypticHint: string;
      detailHint: string;
      solution: string;
    };
  };
  onClose: () => void;
  onSolve: () => void;
  onOpenDoc?: (docId: string) => void;
}

export default function PuzzleModal({ puzzle, onClose, onSolve, onOpenDoc }: PuzzleModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status === "success") return;

    const normalizedInput = inputValue.trim();
    if (normalizedInput === puzzle.data.solution) {
      setStatus("success");
      setIsShaking(false);
      setTimeout(() => {
        onSolve();
      }, 1000);
    } else {
      setStatus("error");
      setIsShaking(true);
    }
  };

  const handleAnimationEnd = () => {
    setIsShaking(false);
  };

  return (
    <div 
      style={{ 
        background: "rgba(2,3,1,0.92)", 
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)"
      }}
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4 font-mono"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ 
          background: "var(--bg-card)", 
          borderColor: "var(--ph-dim)"
        }}
        className="w-full max-w-[440px] border rounded-md shadow-2xl p-6 relative flex flex-col gap-5 select-none"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-dim/30 pb-3">
          {status === "success" ? (
            <Unlock className="w-5 h-5 text-bright animate-bounce" />
          ) : (
            <Lock className="w-5 h-5 text-mid" />
          )}
          <span className="text-sm font-black text-bright uppercase tracking-widest">
            SECURITY_LOCK: {puzzle.label}
          </span>
        </div>

        {/* Cryptic Hint Area */}
        <div 
          style={{ 
            color: "var(--ph-dark)",
            borderLeft: "2px solid var(--ph-dim)"
          }}
          className="pl-3 py-1 text-xs select-text font-bold uppercase tracking-wide leading-relaxed"
        >
          {puzzle.data.crypticHint}
        </div>

        {/* Detail Hint (Details Tag) */}
        {puzzle.data.detailHint && (
          <details className="text-xs group outline-none">
            <summary className="cursor-pointer select-none font-bold uppercase text-mid hover:text-bright transition-colors outline-none list-none flex items-center gap-1.5 focus:outline-none">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>▶ HINT_REVEAL</span>
            </summary>
            <div 
              style={{ color: "var(--ph-dim)" }}
              className="mt-2 text-xs select-text font-bold uppercase tracking-wider whitespace-pre-wrap leading-relaxed"
            >
              {puzzle.data.detailHint}
            </div>
          </details>
        )}

        {/* If this is the Syllabus puzzle (Q01), show a beautiful raw document button */}
        {puzzle.id === "Q01" && onOpenDoc && (
          <button
            type="button"
            onClick={() => onOpenDoc("syllabus_1997")}
            className="w-full py-2.5 px-4 rounded border border-dim text-xs uppercase tracking-widest font-black cursor-pointer text-bright hover:border-bright bg-void hover:bg-void/85 text-center flex items-center justify-center gap-2 shadow"
          >
            📄 [실제 강의계획서 원본 읽기]
          </button>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="puzzle-unlock-input"
            ref={inputRef}
            type="text"
            className={`w-full py-3 px-4 bg-void border rounded select-text text-bright placeholder-dim/40 focus:outline-none transition-all uppercase tracking-[0.2em] text-center ${
              isShaking ? "animate-shake" : ""
            }`}
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: "28px",
              borderColor: status === "error" 
                ? "var(--red-signal)" 
                : status === "success" 
                  ? "var(--ph-core)" 
                  : "var(--ph-dim)"
            }}
            value={inputValue}
            placeholder="[ ENTER CODE ]"
            onChange={(e) => {
              if (status !== "success") {
                setInputValue(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                }
              }
            }}
            onAnimationEnd={handleAnimationEnd}
            disabled={status === "success"}
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded text-xs uppercase tracking-widest font-black cursor-pointer puzzle-btn-cancel"
              disabled={status === "success"}
            >
              [ CANCEL ]
            </button>

            <button
              type="submit"
              style={{ 
                fontSize: "18px"
              }}
              className={`flex-1 py-1 px-4 rounded uppercase tracking-widest font-black cursor-pointer ${
                status === "success" ? "puzzle-btn-solved" : "puzzle-btn-submit"
              }`}
              disabled={status === "success"}
            >
              {status === "success" ? "✓ SOLVED" : "SUBMIT"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
