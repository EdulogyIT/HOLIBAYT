import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - onOpenChat: function that opens your chat widget (Crisp/Intercom/custom drawer)
 * - delayMs: optional initial delay before the avatar walks in
 */
type ChatAssistantTeaserProps = {
  onOpenChat?: () => void;
  delayMs?: number;
};

const ChatAssistantTeaser: React.FC<ChatAssistantTeaserProps> = ({
  onOpenChat,
  delayMs = 800,
}) => {
  const [visible, setVisible] = React.useState(true);

  // Fallback open behavior (toggle a custom event your chat listens for)
  const openChat = () => {
    if (onOpenChat) onOpenChat();
    else if ((window as any).$crisp?.push) (window as any).$crisp.push(["do", "chat:open"]);
    else document.dispatchEvent(new CustomEvent("holibayt:open-chat"));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 pointer-events-auto"
          initial={{ x: 140, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 160, opacity: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 12, delay: delayMs / 1000 }}
          aria-label="Holibayt Assistant"
        >
          {/* Container card */}
          <div className="relative flex items-end gap-3 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 pr-4">
            {/* Walk-in Avatar */}
            <motion.div
              className="w-[76px] h-[110px] relative"
              initial={{ x: 64 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: (delayMs + 200) / 1000 }}
            >
              <AnimatedAssistantSVG />
            </motion.div>

            {/* Speech bubble */}
            <motion.div
              className="max-w-[220px] rounded-xl px-3 py-2 bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 shadow-sm"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: (delayMs + 450) / 1000 }}
            >
              <p className="leading-snug">
                Hi! I’m your Holibayt assistant. How can I help you find your perfect stay?
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (delayMs + 600) / 1000 }}
              className="ml-1"
            >
              <Button
                onClick={openChat}
                className="rounded-xl shadow-md gap-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat now
              </Button>
            </motion.div>

            {/* Close (optional) */}
            <button
              aria-label="Hide assistant"
              onClick={() => setVisible(false)}
              className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full w-7 h-7 text-slate-500 hover:text-slate-700 shadow"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistantTeaser;

/** =========================================
 *  Avatar SVG with subtle walk & wave anims
 *  Theme: Holibayt green outfit
 *  ========================================= */
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
        {/* Shadow bounce (fake footfall) */}
        <motion.ellipse
          cx="60"
          cy="158"
          rx="26"
            ry="6"
          fill="rgba(0,0,0,0.10)"
          animate={{ scaleX: [1, 0.9, 1], opacity: [0.25, 0.18, 0.25] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 158px" }}
        />

        {/* Legs */}
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

        {/* Shoes */}
        <rect x="45" y="156" width="20" height="6" rx="3" fill="#0f766e" />
        <rect x="59" y="156" width="20" height="6" rx="3" fill="#0f766e" />

        {/* Body (emerald jacket) */}
        <motion.rect
          x="35" y="60" width="50" height="60" rx="12" fill="#10b981"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Head */}
        <motion.circle
          cx="60" cy="36" r="18" fill="#fde68a"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Hair / cap */}
        <path d="M44 32 C50 18, 70 18, 76 32 L76 30 C70 14, 50 14, 44 30 Z" fill="#065f46" />

        {/* Face details */}
        <circle cx="53" cy="36" r="1.6" fill="#0f172a" />
        <circle cx="67" cy="36" r="1.6" fill="#0f172a" />
        <path d="M54 44 Q60 48 66 44" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Left arm (waving) */}
        <motion.g
          style={{ transformOrigin: "37px 72px" }}
          animate={{ rotate: [0, -18, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="28" y="68" width="18" height="10" rx="5" fill="#10b981" />
          <rect x="20" y="64" width="12" height="12" rx="6" fill="#fde68a" />
        </motion.g>

        {/* Right arm (holds tablet) */}
        <g>
          <rect x="72" y="72" width="18" height="10" rx="5" fill="#10b981" />
          <rect x="84" y="66" width="16" height="22" rx="4" fill="#e2e8f0" />
          <rect x="86" y="68" width="12" height="18" rx="3" fill="#94a3b8" />
        </g>

        {/* Logo badge */}
        <rect x="40" y="74" width="12" height="12" rx="3" fill="#ecfeff" />
        <path d="M42 80 L45 77 L48 80 L45 83 Z" fill="#0ea5a0" />
      </motion.svg>
    </div>
  );
};
