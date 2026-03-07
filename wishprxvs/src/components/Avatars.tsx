import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// WISHPR XVS — Ghost Sticker Avatars
// ─────────────────────────────────────────────────────────────────────────────

export const STICKER_IDS = [
  'ghost_classic',
  'ghost_cool',
  'ghost_cry',
  'ghost_evil',
  'ghost_alien',
  'ghost_glitch',
  'ghost_love',
  'ghost_skull',
  'ghost_flame',
  'ghost_void',
  // New: expanded Gen Z styles
  'vibe_cat',
  'vibe_anime',
  'vibe_bear',
  'vibe_robot',
  'vibe_nerd',
  'vibe_crown',
  'vibe_devil',
  'vibe_angel',
  'vibe_gang',
  'vibe_bunny',
] as const

export type StickerId = typeof STICKER_IDS[number]

interface StickerProps { size: number }

function GhostClassic({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="35" rx="22" ry="24" fill="#e0d4ff" />
      <rect x="18" y="35" width="44" height="24" fill="#e0d4ff" />
      <path d="M18 59 Q24 68 30 59 Q36 68 40 59 Q44 68 50 59 Q56 68 62 59 L62 59 L18 59Z" fill="#e0d4ff" />
      <circle cx="33" cy="33" r="4" fill="#1a0a3d" />
      <circle cx="47" cy="33" r="4" fill="#1a0a3d" />
      <circle cx="34.5" cy="31.5" r="1.5" fill="white" />
      <circle cx="48.5" cy="31.5" r="1.5" fill="white" />
      <ellipse cx="40" cy="44" rx="6" ry="3.5" fill="#7c4dff" opacity="0.35" />
      <circle cx="16" cy="20" r="1.5" fill="#c084fc" opacity="0.7" />
      <circle cx="65" cy="25" r="1" fill="#c084fc" opacity="0.5" />
    </svg>
  )
}

function GhostCool({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="34" rx="22" ry="23" fill="#c8b8ff" />
      <rect x="18" y="34" width="44" height="26" fill="#c8b8ff" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#c8b8ff" />
      <rect x="26" y="29" width="12" height="8" rx="4" fill="#1a0a3d" />
      <rect x="42" y="29" width="12" height="8" rx="4" fill="#1a0a3d" />
      <line x1="38" y1="33" x2="42" y2="33" stroke="#1a0a3d" strokeWidth="2" />
      <line x1="24" y1="33" x2="26" y2="33" stroke="#1a0a3d" strokeWidth="2" />
      <line x1="54" y1="33" x2="56" y2="33" stroke="#1a0a3d" strokeWidth="2" />
      <path d="M36 47 Q40 51 44 47" stroke="#7c4dff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GhostCry({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="34" rx="22" ry="23" fill="#d4c5ff" />
      <rect x="18" y="34" width="44" height="26" fill="#d4c5ff" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#d4c5ff" />
      <circle cx="33" cy="33" r="4" fill="#1a0a3d" />
      <circle cx="47" cy="33" r="4" fill="#1a0a3d" />
      <circle cx="34.5" cy="31.5" r="1.5" fill="white" />
      <circle cx="48.5" cy="31.5" r="1.5" fill="white" />
      <path d="M34 46 Q40 42 46 46" stroke="#5040a0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="39" rx="2" ry="4" fill="#a78bfa" opacity="0.6" />
      <ellipse cx="50" cy="39" rx="2" ry="4" fill="#a78bfa" opacity="0.6" />
    </svg>
  )
}

function GhostEvil({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="34" rx="22" ry="23" fill="#3d1a5c" />
      <rect x="18" y="34" width="44" height="26" fill="#3d1a5c" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#3d1a5c" />
      <circle cx="33" cy="33" r="5" fill="#ff3d6b" />
      <circle cx="47" cy="33" r="5" fill="#ff3d6b" />
      <circle cx="33" cy="33" r="2.5" fill="#fff" opacity="0.9" />
      <circle cx="47" cy="33" r="2.5" fill="#fff" opacity="0.9" />
      <line x1="28" y1="26" x2="38" y2="29" stroke="#ff3d6b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="26" x2="42" y2="29" stroke="#ff3d6b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 46 Q40 52 48 46" stroke="#ff3d6b" strokeWidth="2" fill="none" />
      <path d="M36 47 L38 52 L40 47" fill="#ff3d6b" />
    </svg>
  )
}

function GhostAlien({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="32" rx="20" ry="26" fill="#43ff9a" opacity="0.85" />
      <rect x="20" y="34" width="40" height="22" fill="#43ff9a" opacity="0.85" />
      <path d="M20 56 Q27 65 33 56 Q37 63 40 56 Q43 63 47 56 Q53 65 60 56 L60 56 L20 56Z" fill="#43ff9a" opacity="0.85" />
      <ellipse cx="32" cy="32" rx="6" ry="7" fill="#0d2b0d" />
      <ellipse cx="48" cy="32" rx="6" ry="7" fill="#0d2b0d" />
      <ellipse cx="30" cy="30" rx="2" ry="3" fill="#43ff9a" opacity="0.5" />
      <ellipse cx="46" cy="30" rx="2" ry="3" fill="#43ff9a" opacity="0.5" />
      <line x1="35" y1="46" x2="45" y2="46" stroke="#0d2b0d" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="6" x2="30" y2="14" stroke="#43ff9a" strokeWidth="2" />
      <line x1="46" y1="6" x2="50" y2="14" stroke="#43ff9a" strokeWidth="2" />
      <circle cx="34" cy="5" r="3" fill="#ff43f5" />
      <circle cx="46" cy="5" r="3" fill="#ff43f5" />
    </svg>
  )
}

function GhostGlitch({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="43" cy="34" rx="22" ry="23" fill="#ff3b6b" opacity="0.35" />
      <ellipse cx="37" cy="34" rx="22" ry="23" fill="#00f5ff" opacity="0.35" />
      <ellipse cx="40" cy="34" rx="22" ry="23" fill="#e0d4ff" />
      <rect x="18" y="34" width="44" height="26" fill="#e0d4ff" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#e0d4ff" />
      <rect x="18" y="30" width="44" height="3" fill="#ff3b6b" opacity="0.5" />
      <rect x="20" y="44" width="40" height="2" fill="#00f5ff" opacity="0.4" />
      <circle cx="33" cy="33" r="4" fill="#1a0a3d" />
      <circle cx="47" cy="33" r="4" fill="#1a0a3d" />
      <rect x="31" y="31" width="4" height="2" fill="#ff3b6b" opacity="0.7" />
      <rect x="45" y="33" width="4" height="2" fill="#00f5ff" opacity="0.7" />
      <rect x="34" y="45" width="12" height="3" rx="1.5" fill="#7c4dff" />
    </svg>
  )
}

function GhostLove({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="34" rx="22" ry="23" fill="#ffd6e8" />
      <rect x="18" y="34" width="44" height="26" fill="#ffd6e8" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#ffd6e8" />
      <path d="M29 31 C29 28 33 28 33 31 C33 28 37 28 37 31 C37 34 33 37 33 37 C33 37 29 34 29 31Z" fill="#ff3d6b" />
      <path d="M43 31 C43 28 47 28 47 31 C47 28 51 28 51 31 C51 34 47 37 47 37 C47 37 43 34 43 31Z" fill="#ff3d6b" />
      <circle cx="40" cy="46" r="4" fill="#ff3d6b" opacity="0.7" />
      <path d="M13 22 C13 20 15 20 15 22 C15 20 17 20 17 22 C17 24 15 26 15 26 C15 26 13 24 13 22Z" fill="#ff3d6b" opacity="0.6" />
      <ellipse cx="27" cy="40" rx="4" ry="2.5" fill="#ff3d6b" opacity="0.25" />
      <ellipse cx="53" cy="40" rx="4" ry="2.5" fill="#ff3d6b" opacity="0.25" />
    </svg>
  )
}

function GhostSkull({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="33" rx="22" ry="23" fill="#2a2a3a" />
      <rect x="18" y="33" width="44" height="27" fill="#2a2a3a" />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill="#2a2a3a" />
      <ellipse cx="33" cy="32" rx="6" ry="7" fill="#0d0d14" />
      <ellipse cx="47" cy="32" rx="6" ry="7" fill="#0d0d14" />
      <ellipse cx="33" cy="32" rx="3" ry="4" fill="#8b5cf6" opacity="0.6" />
      <ellipse cx="47" cy="32" rx="3" ry="4" fill="#8b5cf6" opacity="0.6" />
      <rect x="32" y="44" width="4" height="5" rx="1" fill="#0d0d14" />
      <rect x="38" y="44" width="4" height="5" rx="1" fill="#0d0d14" />
      <rect x="44" y="44" width="4" height="5" rx="1" fill="#0d0d14" />
      <line x1="40" y1="14" x2="37" y2="26" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

function GhostFlame({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`fg${size}`} x1="40" y1="6" x2="40" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="60%" stopColor="#ff6b00" />
          <stop offset="100%" stopColor="#ff3b6b" />
        </linearGradient>
      </defs>
      <path d="M30 22 Q28 14 33 10 Q31 16 35 18 Q34 10 40 6 Q39 14 43 18 Q46 12 47 10 Q44 16 45 22" fill={`url(#fg${size})`} />
      <ellipse cx="40" cy="38" rx="22" ry="22" fill="#1a0a3d" />
      <rect x="18" y="38" width="44" height="24" fill="#1a0a3d" />
      <path d="M18 62 Q24 72 30 62 Q36 72 40 62 Q44 72 50 62 Q56 72 62 62 L62 62 L18 62Z" fill="#1a0a3d" />
      <circle cx="33" cy="37" r="4.5" fill="#ff6b00" />
      <circle cx="47" cy="37" r="4.5" fill="#ff6b00" />
      <circle cx="33" cy="37" r="2" fill="#ffd700" />
      <circle cx="47" cy="37" r="2" fill="#ffd700" />
      <path d="M32 48 Q40 54 48 48" stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GhostVoid({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`vg${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a0080" />
          <stop offset="100%" stopColor="#0d0d14" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="34" rx="22" ry="23" fill={`url(#vg${size})`} />
      <rect x="18" y="34" width="44" height="26" fill={`url(#vg${size})`} />
      <path d="M18 60 Q24 70 30 60 Q36 70 40 60 Q44 70 50 60 Q56 70 62 60 L62 60 L18 60Z" fill={`url(#vg${size})`} />
      <circle cx="33" cy="33" r="5" fill="#e040fb" opacity="0.9" />
      <circle cx="47" cy="33" r="5" fill="#e040fb" opacity="0.9" />
      <line x1="33" y1="28" x2="33" y2="38" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="28" y1="33" x2="38" y2="33" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="47" y1="28" x2="47" y2="38" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <line x1="42" y1="33" x2="52" y2="33" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <path d="M34 46 Q37 50 40 46 Q43 42 46 46" stroke="#e040fb" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="20" r="1.5" fill="#e040fb" opacity="0.8" />
      <circle cx="60" cy="18" r="1" fill="#e040fb" opacity="0.6" />
      <circle cx="65" cy="45" r="1.5" fill="#e040fb" opacity="0.5" />
    </svg>
  )
}

// ─── Registry ────────────────────────────────────────────────────────────────
// ─── New Gen Z Style Stickers ─────────────────────────────────────────────────

function VibeCat({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="42" r="24" fill="#f9c4d2" />
      <polygon points="18,28 25,42 12,42" fill="#f9c4d2" />
      <polygon points="62,28 75,42 55,42" fill="#f9c4d2" />
      <polygon points="18,28 25,38 12,38" fill="#ffadc0" />
      <polygon points="62,28 75,38 55,38" fill="#ffadc0" />
      <ellipse cx="31" cy="44" rx="6" ry="5" fill="white" />
      <ellipse cx="49" cy="44" rx="6" ry="5" fill="white" />
      <circle cx="31" cy="44" r="3" fill="#1a0a3d" />
      <circle cx="49" cy="44" r="3" fill="#1a0a3d" />
      <circle cx="32" cy="43" r="1.2" fill="white" />
      <circle cx="50" cy="43" r="1.2" fill="white" />
      <path d="M36 52 Q40 56 44 52" stroke="#ff6b9d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="52" r="2.5" fill="#ff6b9d" />
      <line x1="22" y1="50" x2="12" y2="48" stroke="#ccc" strokeWidth="1.5" />
      <line x1="22" y1="53" x2="11" y2="53" stroke="#ccc" strokeWidth="1.5" />
      <line x1="58" y1="50" x2="68" y2="48" stroke="#ccc" strokeWidth="1.5" />
      <line x1="58" y1="53" x2="69" y2="53" stroke="#ccc" strokeWidth="1.5" />
    </svg>
  )
}

function VibeAnime({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="42" rx="22" ry="26" fill="#ffe4c8" />
      <rect x="18" y="38" width="44" height="20" fill="#ffe4c8" />
      <ellipse cx="28" cy="41" rx="10" ry="8" fill="white" />
      <ellipse cx="52" cy="41" rx="10" ry="8" fill="white" />
      <circle cx="28" cy="42" r="6" fill="#6b4af7" />
      <circle cx="52" cy="42" r="6" fill="#6b4af7" />
      <circle cx="28" cy="42" r="3.5" fill="#1a0a3d" />
      <circle cx="52" cy="42" r="3.5" fill="#1a0a3d" />
      <circle cx="29.5" cy="40.5" r="1.5" fill="white" />
      <circle cx="53.5" cy="40.5" r="1.5" fill="white" />
      <path d="M35 55 Q40 59 45 55" stroke="#ff6b9d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="52" rx="5" ry="3" fill="#ffaacc" opacity="0.6" />
      <ellipse cx="56" cy="52" rx="5" ry="3" fill="#ffaacc" opacity="0.6" />
      <path d="M22 20 Q40 8 58 20" stroke="#3d1a14" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M20 32 Q28 26 36 32" stroke="#3d1a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M44 32 Q52 26 60 32" stroke="#3d1a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="12" r="3" fill="#ffcc00" opacity="0.8" />
      <circle cx="66" cy="10" r="2" fill="#ff99cc" opacity="0.8" />
    </svg>
  )
}

function VibeBear({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="28" r="12" fill="#c8a882" />
      <circle cx="58" cy="28" r="12" fill="#c8a882" />
      <circle cx="22" cy="28" r="7" fill="#b08060" />
      <circle cx="58" cy="28" r="7" fill="#b08060" />
      <circle cx="40" cy="44" r="26" fill="#c8a882" />
      <ellipse cx="40" cy="52" rx="11" ry="8" fill="#b08060" />
      <circle cx="32" cy="41" r="5" fill="#1a0a3d" />
      <circle cx="48" cy="41" r="5" fill="#1a0a3d" />
      <circle cx="33.5" cy="39.5" r="2" fill="white" />
      <circle cx="49.5" cy="39.5" r="2" fill="white" />
      <circle cx="40" cy="51" r="4.5" fill="#7c4d3a" />
      <path d="M35 58 Q40 62 45 58" stroke="#7c4d3a" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function VibeRobot({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="28" width="36" height="34" rx="6" fill="#4a5568" />
      <rect x="24" y="30" width="32" height="30" rx="5" fill="#2d3748" />
      <rect x="27" y="35" width="11" height="10" rx="3" fill="#00e5ff" />
      <rect x="42" y="35" width="11" height="10" rx="3" fill="#00e5ff" />
      <circle cx="32.5" cy="40" r="3" fill="#1a0a3d" />
      <circle cx="47.5" cy="40" r="3" fill="#1a0a3d" />
      <circle cx="33.5" cy="39" r="1.2" fill="white" />
      <circle cx="48.5" cy="39" r="1.2" fill="white" />
      <rect x="30" y="50" width="20" height="5" rx="2.5" fill="#00e5ff" opacity="0.7" />
      <rect x="37" y="22" width="6" height="8" rx="3" fill="#4a5568" />
      <circle cx="40" cy="20" r="4" fill="#7c4dff" />
      <rect x="17" y="36" width="6" height="14" rx="3" fill="#4a5568" />
      <rect x="57" y="36" width="6" height="14" rx="3" fill="#4a5568" />
      <circle cx="14" cy="15" r="2" fill="#00e5ff" opacity="0.6" />
      <circle cx="67" cy="18" r="1.5" fill="#7c4dff" opacity="0.7" />
    </svg>
  )
}

function VibeNerd({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="42" r="24" fill="#ffe4c8" />
      <ellipse cx="29" cy="40" rx="9" ry="8" fill="white" />
      <ellipse cx="51" cy="40" rx="9" ry="8" fill="white" />
      <ellipse cx="29" cy="40" rx="9" ry="8" stroke="#1a0a3d" strokeWidth="3" fill="none" />
      <ellipse cx="51" cy="40" rx="9" ry="8" stroke="#1a0a3d" strokeWidth="3" fill="none" />
      <line x1="38" y1="40" x2="42" y2="40" stroke="#1a0a3d" strokeWidth="2.5" />
      <line x1="20" y1="39" x2="16" y2="37" stroke="#1a0a3d" strokeWidth="2.5" />
      <line x1="60" y1="39" x2="64" y2="37" stroke="#1a0a3d" strokeWidth="2.5" />
      <circle cx="29" cy="40" r="4.5" fill="#7c4dff" />
      <circle cx="51" cy="40" r="4.5" fill="#7c4dff" />
      <circle cx="30" cy="39" r="1.8" fill="white" />
      <circle cx="52" cy="39" r="1.8" fill="white" />
      <path d="M35 52 Q40 57 45 52" stroke="#cc8844" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M28 28 Q40 20 52 28" stroke="#5a3010" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function VibeCrown({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="46" r="22" fill="#ffe4a0" />
      <path d="M18 30 L26 46 L40 34 L54 46 L62 30 L58 24 L50 30 L40 20 L30 30 L22 24Z" fill="#ffcc00" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="18" cy="30" r="4" fill="#ff3d6b" />
      <circle cx="40" cy="20" r="5" fill="#7c4dff" />
      <circle cx="62" cy="30" r="4" fill="#06b6d4" />
      <circle cx="32" cy="43" r="5.5" fill="#1a0a3d" />
      <circle cx="48" cy="43" r="5.5" fill="#1a0a3d" />
      <circle cx="33.5" cy="41.5" r="2" fill="white" />
      <circle cx="49.5" cy="41.5" r="2" fill="white" />
      <path d="M35 54 Q40 58 45 54" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function VibeDevil({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="44" r="22" fill="#ff6b6b" />
      <polygon points="22,22 28,34 18,34" fill="#cc2222" />
      <polygon points="58,22 70,34 62,34" fill="#cc2222" />
      <circle cx="32" cy="42" r="5.5" fill="#1a0a3d" />
      <circle cx="48" cy="42" r="5.5" fill="#1a0a3d" />
      <circle cx="33.5" cy="40.5" r="2" fill="#ff3333" />
      <circle cx="49.5" cy="40.5" r="2" fill="#ff3333" />
      <path d="M30 34 L34 38" stroke="#1a0a3d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 38 L50 34" stroke="#1a0a3d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M33 53 Q37 49 40 53 Q43 49 47 53" stroke="#1a0a3d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="40" cy="54.5" rx="3" ry="2" fill="#cc2222" />
      <path d="M30 65 Q35 72 40 68 Q45 72 50 65" stroke="#cc2222" strokeWidth="2" fill="none" />
    </svg>
  )
}

function VibeAngel({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="18" rx="20" ry="6" fill="none" stroke="#ffcc00" strokeWidth="3" opacity="0.9" />
      <circle cx="40" cy="18" r="3" fill="#ffcc00" opacity="0.5" />
      <circle cx="40" cy="44" r="22" fill="#fff5e4" />
      <ellipse cx="32" cy="40" rx="6" ry="5.5" fill="white" />
      <ellipse cx="48" cy="40" rx="6" ry="5.5" fill="white" />
      <circle cx="32" cy="41" r="3.8" fill="#5b8dee" />
      <circle cx="48" cy="41" r="3.8" fill="#5b8dee" />
      <circle cx="33.5" cy="39.5" r="1.5" fill="white" />
      <circle cx="49.5" cy="39.5" r="1.5" fill="white" />
      <path d="M35 52 Q40 57 45 52" stroke="#ffaaaa" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="26" cy="50" rx="5" ry="3.5" fill="#ffcccc" opacity="0.5" />
      <ellipse cx="54" cy="50" rx="5" ry="3.5" fill="#ffcccc" opacity="0.5" />
      <path d="M10 50 Q4 40 10 34 Q14 28 22 36" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M70 50 Q76 40 70 34 Q66 28 58 36" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  )
}

function VibeGang({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="44" r="22" fill="#2d2d2d" />
      <rect x="22" y="26" width="36" height="6" rx="3" fill="#1a1a1a" />
      <rect x="20" y="30" width="40" height="4" rx="2" fill="#333" />
      <circle cx="32" cy="43" r="5" fill="#111" />
      <circle cx="48" cy="43" r="5" fill="#111" />
      <circle cx="32" cy="43" r="3" fill="#7c4dff" />
      <circle cx="48" cy="43" r="3" fill="#7c4dff" />
      <circle cx="33" cy="42" r="1.2" fill="white" opacity="0.7" />
      <circle cx="49" cy="42" r="1.2" fill="white" opacity="0.7" />
      <path d="M34 52 L37 55 L40 52 L43 55 L46 52" stroke="#7c4dff" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="26" y1="60" x2="22" y2="64" stroke="#555" strokeWidth="2" />
      <line x1="54" y1="60" x2="58" y2="64" stroke="#555" strokeWidth="2" />
      <circle cx="14" cy="20" r="2" fill="#7c4dff" opacity="0.6" />
      <circle cx="66" cy="16" r="2" fill="#7c4dff" opacity="0.6" />
    </svg>
  )
}

function VibeBunny({ size }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="22" rx="8" ry="16" fill="#e8c8f0" />
      <ellipse cx="52" cy="22" rx="8" ry="16" fill="#e8c8f0" />
      <ellipse cx="28" cy="22" rx="5" ry="12" fill="#ffb3d9" />
      <ellipse cx="52" cy="22" rx="5" ry="12" fill="#ffb3d9" />
      <circle cx="40" cy="46" r="24" fill="#f0e4f8" />
      <ellipse cx="31" cy="44" rx="6" ry="5.5" fill="white" />
      <ellipse cx="49" cy="44" rx="6" ry="5.5" fill="white" />
      <circle cx="31" cy="44" r="3.5" fill="#d46fa0" />
      <circle cx="49" cy="44" r="3.5" fill="#d46fa0" />
      <circle cx="32.5" cy="42.5" r="1.5" fill="white" />
      <circle cx="50.5" cy="42.5" r="1.5" fill="white" />
      <circle cx="40" cy="52" r="4" fill="#ffb3d9" />
      <path d="M36 55 Q40 59 44 55" stroke="#d46fa0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="25" y1="52" x2="14" y2="49" stroke="#ddd" strokeWidth="1.5" />
      <line x1="25" y1="55" x2="13" y2="55" stroke="#ddd" strokeWidth="1.5" />
      <line x1="55" y1="52" x2="66" y2="49" stroke="#ddd" strokeWidth="1.5" />
    </svg>
  )
}

const STICKER_MAP: Record<StickerId, (props: StickerProps) => React.ReactElement> = {
  ghost_classic: GhostClassic,
  ghost_cool:    GhostCool,
  ghost_cry:     GhostCry,
  ghost_evil:    GhostEvil,
  ghost_alien:   GhostAlien,
  ghost_glitch:  GhostGlitch,
  ghost_love:    GhostLove,
  ghost_skull:   GhostSkull,
  ghost_flame:   GhostFlame,
  ghost_void:    GhostVoid,
  vibe_cat:      VibeCat,
  vibe_anime:    VibeAnime,
  vibe_bear:     VibeBear,
  vibe_robot:    VibeRobot,
  vibe_nerd:     VibeNerd,
  vibe_crown:    VibeCrown,
  vibe_devil:    VibeDevil,
  vibe_angel:    VibeAngel,
  vibe_gang:     VibeGang,
  vibe_bunny:    VibeBunny,
}

export const STICKER_LABELS: Record<StickerId, string> = {
  ghost_classic: 'Spooky',
  ghost_cool:    'Cool',
  ghost_cry:     'Weepy',
  ghost_evil:    'Evil',
  ghost_alien:   'Alien',
  ghost_glitch:  'Glitch',
  ghost_love:    'Lovestruck',
  ghost_skull:   'Skull',
  ghost_flame:   'On Fire',
  ghost_void:    'Void',
  vibe_cat:      'Cat',
  vibe_anime:    'Anime',
  vibe_bear:     'Bear',
  vibe_robot:    'Robot',
  vibe_nerd:     'Nerd',
  vibe_crown:    'Royalty',
  vibe_devil:    'Devil',
  vibe_angel:    'Angel',
  vibe_gang:     'Gang',
  vibe_bunny:    'Bunny',
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
interface AvatarProps {
  stickerId?: string | null
  size: number
  style?: React.CSSProperties
}

export function Avatar({ stickerId, size, style }: AvatarProps) {
  const id       = (stickerId as StickerId) || 'ghost_classic'
  const StickerC = STICKER_MAP[id] || GhostClassic

  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   size * 0.28,
      overflow:       'hidden',
      flexShrink:     0,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'rgba(124,77,255,0.08)',
      border:         '1.5px solid rgba(124,77,255,0.22)',
      ...style,
    }}>
      <StickerC size={size * 0.9} />
    </div>
  )
}

// ─── Picker modal ────────────────────────────────────────────────────────────
interface PickerProps {
  current?: string | null
  onSelect: (id: StickerId) => void
  onClose:  () => void
}

export function AvatarPicker({ current, onSelect, onClose }: PickerProps) {
  return (
    <AnimatePresence>
      <motion.div key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, backdropFilter: 'blur(6px)' }}
      />
      <motion.div key="sh"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301, background: '#13131e', borderRadius: '22px 22px 0 0', padding: '0 16px 36px', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#252535' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#f0f0f8' }}>Choose your avatar</h2>
            <p style={{ color: '#55557a', fontSize: 13, marginTop: 3 }}>Shown everywhere as your identity</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9898b8' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {STICKER_IDS.map(id => {
            const StickerC = STICKER_MAP[id]
            const isActive = current === id
            return (
              <motion.button key={id} whileTap={{ scale: 0.93 }}
                onClick={() => { onSelect(id); onClose() }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 10px', borderRadius: 16, cursor: 'pointer',
                  border: `2px solid ${isActive ? '#7c4dff' : '#252535'}`,
                  background: isActive ? 'rgba(124,77,255,0.12)' : 'rgba(255,255,255,0.03)',
                  position: 'relative', transition: 'all 0.2s',
                }}>
                {isActive && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#7c4dff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={11} color="white" />
                  </div>
                )}
                <StickerC size={64} />
                <p style={{ color: isActive ? '#c084fc' : '#9898b8', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                  {STICKER_LABELS[id]}
                </p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
