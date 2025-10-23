import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatAssistantTeaserProps = {
  onOpenChat?: () => void; // optional explicit handler
  delayMs?: number;        // entrance delay
};

/**
 * Behavior:
 * - Close "X" now MINIMIZES into a small dock button that always stays bottom-right.
 * - Clicking the mini button restores the teaser.
 * - "Chat now" tries: prop -> Crisp -> Intercom -> Tawk.to -> Drift -> custom event.
 */
const ChatAssistantTeaser: React.FC<ChatAssistantTeaserProps> = ({
  onOpenChat,
  delayMs = 800,
}) => {
  const [teaserVisible, setTeaserVisible] = React.useState(true);   // large card
  const [minimized, setMinimized] = React.useState(false);          // mini dock

  // Restore minimized state from previous visits if you like:
  React.useEffect(() => {
    const saved = localStorage.getItem("hb_chat_minimized");
    if (saved === "1") {
      setTeaserVisible(false);
      setMinimized(true);
    }
  }, []);

  const persistMinState = (isMin: boolean) => {
    localStorage.setItem("hb_chat_minimized", isMin ? "1" : "0");
  };

  const openChat = () => {
    try {
      if (onOpenChat) {
        onOpenChat();
        return;
      }
      // Crisp
      if ((window as any).$crisp?.push) {
        (window as any).$crisp.push(["do", "chat:open"]);
        return;
      }
      // Intercom
      if ((window as any).Intercom) {
        (window as any).Intercom("show");
        return;
      }
      // Tawk.to
      if ((window as any).Tawk_API?.maximize) {
        (window as any).Tawk_API.maximize();
        return;
      }
      // Drift
      if ((window as any).drift?.api?.openChat) {
        (window as any).drift.api.openChat();
        return;
      }
      // Fallback: custom event your drawer can listen for
      document.dispatchEvent(new CustomEvent("holibayt:open-chat"));
    } catch (e) {
      console.warn("Open chat failed, dispatching fallback event.", e);
      document.dispatchEvent(new CustomEvent("holibayt:open-chat"));
    }
  };

  const minimize = () => {
    setTeaserVisible(false);
    setMinimized(true);
    persistMinState(true);
  };

  const restore = () => {
    setTeaserVisible(true);
    setMinimized(false);
    persistMinState(false);
  };

  return (
    <>
      {/* Full teaser card */}
      <AnimatePresence>
        {teaserVisible && (
          <motion.div
            className="fixed bottom-4 right-4 z-[60] pointer-events-auto"
            initial={{ x: 140, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 160, opacity: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, delay: delayMs / 1000 }}
            aria-label="Holibayt Assistant"
          >
            <div className="relative flex items-end gap-3 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 pr-4">
              {/* Avatar */}
              <motion.div
                className="w-[76px] h-[110px] relative"
                initial={{ x: 64 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: (delayMs + 200) / 1000 }}
              >
                <AnimatedAssistantSVG />
              </motion.div>

              {/* Bubble */}
              <motion.div
                className="max-w-[240px] rounded-xl px-3 py-2 bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 shadow-sm"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: (delayMs + 450) / 1000 }}
              >
                <p className="leading-snug">
                  Hi! I’m your Holibayt assistant. How can I help you find your perfect stay?
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (delayMs + 600) / 1000 }}
                className="ml-1"
              >
                <Button
                  onClick={openChat}
                  className="rounded-xl shadow-md gap-2 focus-visible:ring-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat now
                </Button>
              </motion.div>

              {/* Minimize instead of hide */}
              <button
                aria-label="Minimize assistant"
                onClick={minimize}
                className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full w-7 h-7 text-slate-500 hover:text-slate-700 shadow"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini dock button (always visible when minimized) */}
      <AnimatePresence>
        {minimized && (
          <motion.button
            aria-label="Open Holibayt assistant"
            onClick={restore}
            className="fixed bottom-4 right-4 z-[60] pointer-events-auto"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
          >
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 shadow-xl border border-emerald-700">
              <MessageCircle className="w-6 h-6 text-white" />
              {/* subtle online pulse */}
              <span className="absolute inset-0 rounded-full ring-2 ring-emerald-300/60 animate-ping pointer-events-none" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistantTeaser;

/* ================================
   Avatar SVG (same as before)
   ================================ */
const AnimatedAssistantSVG: React.FC = () => {
  return (
    <div className="w-full h-full">
      <motion.svg
        viewBox="0 0 120 170"
        role="img"
        aria-label="Holibayt virtual assistant"
        className="w-full h-full"
        initial={false}
      >
        <motion.ellipse
          cx="60" cy="158" rx="26" ry="6" fill="rgba(0,0,0,0.10)"
          animate={{ scaleX: [1, 0.9, 1], opacity: [0.25, 0.18, 0.25] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 158px" }}
        />
        <motion.rect
          x="48" y="110" width="10" height="48" rx="5" fill="#0ea5a0"
          animate={{ rotate: [2, -6, 2], y: [0, 1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "53px 158px" }}
        />
        <motion.rect
          x="62" y="110" width="10" height="48" rx="5" fill="#0ea5a0"
          animate={{ rotate: [-2, 6, -2], y: [0, -1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
          style={{ transformOrigin: "67px 158px" }}
        />
        <rect x="45" y="156" width="20" height="6" rx="3" fill="#0f766e" />
        <rect x="59" y="156" width="20" height="6" rx="3" fill="#0f766e" />
        <motion.rect
          x="35" y="60" width="50" height="60" rx="12" fill="#10b981"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="60" cy="36" r="18" fill="#fde68a"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M44 32 C50 18, 70 18, 76 32 L76 30 C70 14, 50 14, 44 30 Z" fill="#065f46" />
        <circle cx="53" cy="36" r="1.6" fill="#0f172a" />
        <circle cx="67" cy="36" r="1.6" fill="#0f172a" />
        <path d="M54 44 Q60 48 66 44" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <motion.g
          style={{ transformOrigin: "37px 72px" }}
          animate={{ rotate: [0, -18, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="28" y="68" width="18" height="10" rx="5" fill="#10b981" />
          <rect x="20" y="64" width="12" height="12" rx="6" fill="#fde68a" />
        </motion.g>
        <g>
          <rect x="72" y="72" width="18" height="10" rx="5" fill="#10b981" />
          <rect x="84" y="66" width="16" height="22" rx="4" fill="#e2e8f0" />
          <rect x="86" y="68" width="12" height="18" rx="3" fill="#94a3b8" />
        </g>
        <rect x="40" y="74" width="12" height="12" rx="3" fill="#ecfeff" />
        <path d="M42 80 L45 77 L48 80 L45 83 Z" fill="#0ea5a0" />
      </motion.svg>
    </div>
  );
};
