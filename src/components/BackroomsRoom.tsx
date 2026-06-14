/**
 * BackroomsRoom.tsx
 * ─────────────────────────────────────────────────────────────────
 * LAB-317 / Error Code CLIO 프로젝트 통합용
 *
 * 사용법:
 *   1. 이 파일을 프로젝트의 src/components/BackroomsRoom.tsx 로 복사
 *   2. App.tsx 에서 import 후, secret_passage / kim_study 룸 렌더링 섹션에 삽입
 *      (하단 "App.tsx 연동 가이드" 주석 참고)
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────
interface BackroomsRoomProps {
  roomId: "secret_passage" | "kim_study";
  threatLevel: number;
  blackout2Active: boolean;
  solvedPuzzles: string[];
  inventory: string[];
  onThreatChange: (newLevel: number) => void;
  onRoomChange: (roomId: string) => void;
  /** 퍼즐 해결 — puzzleId: "Q23" | "Q09" | "__OPEN_SAFE__" */
  onPuzzleSolved: (puzzleId: string, reward?: string) => void;
  onAddLog: (msg: string, type?: "system" | "clio" | "player") => void;
}

type ActionId = "hide_locker" | "hide_pipe" | "listen" | "observe" | "run" | "enter_lab" | "terminal" | "safe" | "escape_kit";

// ─────────────────────────────────────────────
//  WEB AUDIO
// ─────────────────────────────────────────────
function playThud() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // 저음 충격
    const o1 = ctx.createOscillator(), g1 = ctx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(72, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(14, ctx.currentTime + 0.65);
    g1.gain.setValueAtTime(1.5, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    o1.connect(g1); g1.connect(ctx.destination);
    o1.start(); o1.stop(ctx.currentTime + 0.9);
    // 서브 럼블
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = "triangle";
    o2.frequency.setValueAtTime(36, ctx.currentTime);
    o2.frequency.exponentialRampToValueAtTime(8, ctx.currentTime + 0.45);
    g2.gain.setValueAtTime(0.8, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    o2.connect(g2); g2.connect(ctx.destination);
    o2.start(); o2.stop(ctx.currentTime + 0.55);
    // 충격 클릭
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
    const src = ctx.createBufferSource(), bg = ctx.createGain();
    src.buffer = buf; bg.gain.value = 0.5;
    src.connect(bg); bg.connect(ctx.destination); src.start();
  } catch (_) {}
}

function playElectricFlicker() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = 60;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.05);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

function playCreatureAmbient() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.0), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass"; flt.frequency.value = 160;
    const gn = ctx.createGain(); gn.gain.value = 0.1;
    src.connect(flt); flt.connect(gn); gn.connect(ctx.destination); src.start();
  } catch (_) {}
}

function playGunshot() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufSize = ctx.sampleRate * 1.5;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    oscGain.gain.setValueAtTime(2.2, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}

// ─────────────────────────────────────────────
//  괴생명체 SVG
//  (참고 이미지: 천장 높이, 검은 촉수 다리 8개, 불규칙 상체 덩어리)
// ─────────────────────────────────────────────
function CreatureSVG({ scale, opacity }: { scale: number; opacity: number }) {
  if (opacity < 0.01) return null;
  return (
    <g
      transform={`translate(400, 240) scale(${scale}) translate(-120, -310)`}
      style={{ opacity, filter: `brightness(${0.55 + scale * 0.45}) contrast(1.15)` }}
    >
      {/* ── 촉수 다리 8개 (좌측 4 + 우측 4) ── */}
      <path d="M68,108 C52,148 38,192 48,238 C34,280 22,328 32,372 C18,418 26,468 12,518 C6,542 4,572 2,620"
        fill="none" stroke="#040404" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M76,112 C62,155 66,202 50,246 C40,288 50,335 36,378 C24,418 32,470 18,522 C12,548 8,580 5,620"
        fill="none" stroke="#050505" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M88,116 C78,162 84,210 72,256 C64,298 74,344 60,388 C50,430 58,480 44,532 C38,556 32,588 28,620"
        fill="none" stroke="#060606" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100,118 C92,168 96,215 86,260 C80,302 88,350 76,395 C66,438 72,488 60,540 C55,564 50,594 46,620"
        fill="none" stroke="#040404" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M120,120 C118,172 114,220 120,268 C114,312 122,358 116,404 C110,448 116,500 108,552 C104,576 100,604 98,620"
        fill="none" stroke="#030303" strokeWidth="7.5" strokeLinecap="round"/>
      <path d="M140,118 C150,168 146,215 156,260 C162,302 154,350 166,395 C178,438 172,488 184,540 C190,564 196,594 198,620"
        fill="none" stroke="#040404" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M152,116 C164,162 158,210 172,256 C180,298 170,344 184,388 C196,430 188,480 202,532 C208,556 214,588 218,620"
        fill="none" stroke="#060606" strokeWidth="6" strokeLinecap="round"/>
      <path d="M164,112 C178,155 174,202 190,246 C200,288 190,335 204,378 C216,418 208,470 222,522 C228,548 232,580 235,620"
        fill="none" stroke="#050505" strokeWidth="5.5" strokeLinecap="round"/>
      {/* ── 상체 덩어리 ── */}
      <path d="M68,110 C58,88 52,62 62,44 C70,28 84,20 98,24
               C108,14 126,12 138,22 C150,14 166,22 168,40
               C182,48 184,68 174,84 C186,96 182,116 168,120
               C172,136 162,148 148,144 C142,160 126,164 112,156
               C96,164 80,158 74,144 C58,140 52,124 62,112 Z"
        fill="#050505"/>
      {/* 위쪽 불규칙 돌기 */}
      <path d="M74,40 C68,22 72,8 80,2 C86,-4 96,0 94,14" fill="#060606"/>
      <path d="M86,28 C80,10 86,-4 96,-8 C104,-12 110,-4 106,10" fill="#040404"/>
      <path d="M110,22 C106,4 112,-10 122,-8 C130,-6 132,6 126,18" fill="#060606"/>
      <path d="M124,26 C122,6 130,-6 140,-2 C148,2 148,14 142,24" fill="#050505"/>
      <path d="M148,32 C148,14 156,2 164,6 C172,10 170,24 162,34" fill="#070707"/>
      <path d="M62,68 C50,60 44,48 50,40 C56,32 66,36 68,46" fill="#040404"/>
      <path d="M178,72 C190,64 196,52 190,44 C184,36 174,40 172,50" fill="#040404"/>
      <path d="M90,70 C84,62 86,52 94,50 C100,48 106,54 102,62" fill="#020202" opacity="0.8"/>
      <path d="M130,66 C136,58 144,58 146,66 C148,74 140,80 132,76" fill="#020202" opacity="0.8"/>
    </g>
  );
}

// ─────────────────────────────────────────────
//  지하 비밀 통로 SVG — 백룸 스타일
// ─────────────────────────────────────────────
interface SecretPassageSVGProps {
  threatLevel: number;
  needsPowerReset?: boolean;
  onPowerReset?: () => void;
}

function SecretPassageSVG({ threatLevel, needsPowerReset, onPowerReset }: SecretPassageSVGProps) {
  const amb = needsPowerReset ? 0.03 : Math.max(0.18, 0.88 - threatLevel * 0.13);
  const W = `rgba(185,170,80,${amb})`;
  const F = `rgba(168,152,62,${amb})`;
  const C = `rgba(196,186,94,${amb})`;
  const TS = `rgba(148,134,52,${amb * 0.55})`;

  return (
    <>
      <rect x="0" y="0" width="800" height="480" fill={`rgba(168,148,58,${amb})`}/>
      {/* 천장 타일 */}
      <rect x="0" y="0" width="800" height="148" fill={C}/>
      {Array.from({ length: 14 }).map((_, i) =>
        <line key={`cv${i}`} x1={i * 62} y1="0" x2={i * 62} y2="148" stroke={TS} strokeWidth="1"/>
      )}
      {[0, 38, 76, 114, 148].map((y, i) =>
        <line key={`ch${i}`} x1="0" y1={y} x2="800" y2={y} stroke={TS} strokeWidth="1"/>
      )}
      {/* 형광등 */}
      {[100, 260, 400, 560, 700].map((x, i) => (
        <g key={`fl${i}`}>
          <rect x={x - 42} y="8" width="84" height="13" rx="2" fill={`rgba(218,208,138,${amb * 0.9})`}/>
          <rect x={x - 40} y="9" width="80" height="11" rx="1" fill={`rgba(252,248,198,${amb})`}/>
          <ellipse cx={x} cy="26" rx="62" ry="26" fill={`rgba(255,250,178,${amb * 0.16})`}/>
        </g>
      ))}
      {/* 좌벽 */}
      <polygon points="0,0 162,82 162,398 0,480" fill={W}/>
      <line x1="0" y1="0" x2="162" y2="82" stroke={TS} strokeWidth="2"/>
      <line x1="0" y1="480" x2="162" y2="398" stroke={TS} strokeWidth="2"/>
      {[110,200,290,370].map((y, i) =>
        <line key={`lm${i}`} x1="0" y1={y} x2="162" y2={y * 0.84 + 18} stroke={TS} strokeWidth="1" strokeDasharray="4,4"/>
      )}
      {/* 우벽 */}
      <polygon points="800,0 638,82 638,398 800,480" fill={W}/>
      <line x1="800" y1="0" x2="638" y2="82" stroke={TS} strokeWidth="2"/>
      <line x1="800" y1="480" x2="638" y2="398" stroke={TS} strokeWidth="2"/>
      {[110,200,290,370].map((y, i) =>
        <line key={`rm${i}`} x1="800" y1={y} x2="638" y2={y * 0.84 + 18} stroke={TS} strokeWidth="1" strokeDasharray="4,4"/>
      )}
      {/* 바닥 */}
      <rect x="0" y="332" width="800" height="148" fill={F}/>
      {Array.from({ length: 11 }).map((_, i) =>
        <line key={`fv${i}`} x1={i * 80} y1="332" x2={i * 80} y2="480" stroke={TS} strokeWidth="1"/>
      )}
      {[362, 395, 428, 460, 480].map((y, i) =>
        <line key={`fh${i}`} x1="0" y1={y} x2="800" y2={y} stroke={TS} strokeWidth="1"/>
      )}
      {/* 복도 중심 */}
      <polygon points="162,82 638,82 638,398 162,398" fill={`rgba(158,138,48,${amb * 0.78})`}/>
      {/* 소실점 */}
      <ellipse cx="400" cy="240" rx="92" ry="68" fill={`rgba(182,168,78,${amb * 0.68})`}/>
      <ellipse cx="400" cy="240" rx="52" ry="36" fill={`rgba(198,188,92,${amb * 0.48})`}/>
      {/* 점액 흔적 (위협 ≥2) */}
      {!needsPowerReset && threatLevel >= 2 && (
        <g opacity={Math.min(0.75, (threatLevel - 1) * 0.24)}>
          <path d="M 295,440 Q 362,418 422,442 Q 482,458 542,433"
            fill="none" stroke="rgba(115,98,18,0.62)" strokeWidth="9" strokeLinecap="round"/>
          <path d="M 198,422 Q 278,402 348,428"
            fill="none" stroke="rgba(98,82,13,0.5)" strokeWidth="6" strokeLinecap="round"/>
          <path d="M 160,202 Q 178,252 163,302"
            fill="none" stroke="rgba(105,90,16,0.42)" strokeWidth="7" strokeLinecap="round"/>
        </g>
      )}
      {/* 연구실 문 (우측 벽) */}
      <g opacity={needsPowerReset ? 0.15 : 0.72}>
        <rect x="598" y="138" width="50" height="144" rx="2"
          fill={`rgba(128,112,43,${amb * 0.9})`} stroke={`rgba(158,138,54,${amb})`} strokeWidth="2"/>
        <rect x="634" y="196" width="7" height="17" rx="1" fill={`rgba(198,178,68,${amb})`}/>
        <rect x="564" y="126" width="120" height="18" rx="3" fill="rgba(0,0,0,0.76)"/>
        <text x="624" y="139" fill="rgba(184,212,74,0.92)" fontSize="10"
          textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          연구실 B-7 / 김정웅
        </text>
      </g>
      {/* 사물함 (좌측 벽) */}
      <g opacity={needsPowerReset ? 0.12 : 0.74}>
        <rect x="28" y="148" width="92" height="204" rx="2"
          fill={`rgba(118,108,38,${amb * 0.9})`} stroke={`rgba(148,133,48,${amb})`} strokeWidth="2"/>
        <line x1="74" y1="148" x2="74" y2="352" stroke={`rgba(148,133,48,${amb * 0.68})`} strokeWidth="1"/>
        <rect x="67" y="242" width="9" height="22" rx="1" fill={`rgba(188,168,62,${amb})`}/>
      </g>
      {/* 파이프 */}
      <rect x="0" y="86" width="162" height="14" fill={`rgba(138,123,48,0.68)`} stroke={`rgba(158,143,52,0.48)`} strokeWidth="1"/>
      <rect x="638" y="86" width="162" height="14" fill={`rgba(138,123,48,0.68)`} stroke={`rgba(158,143,52,0.48)`} strokeWidth="1"/>

      {/* ⚡ 비상 두꺼비집 (Fuse Box / Breaker) — 전력 유실 시 붉은 비장등 점멸 작동 */}
      {needsPowerReset && (
        <g className="cursor-pointer group/breaker" onClick={onPowerReset}>
          {/* 어두운 벽면 속 빛나는 배전 격틀 */}
          <rect x="490" y="170" width="76" height="110" rx="4" fill="#0c0e14" stroke="#f43f5e" strokeWidth="2" className="animate-pulse" />
          <rect x="495" y="175" width="66" height="66" rx="2" fill="#050609" stroke="#334155" strokeWidth="1.5" />
          
          {/* 레버 베이스 및 스위치 레버 선 */}
          <line x1="528" y1="188" x2="528" y2="218" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          {/* 하단 점멸 레버 핸들 */}
          <circle cx="528" cy="218" r="8" fill="#f43f5e" className="animate-ping" style={{ animationDuration: "1s" }} />
          <circle cx="528" cy="218" r="5" fill="#f43f5e" />

          {/* 인두 램프 LED 단자 */}
          <circle cx="510" cy="256" r="3.5" fill="#f43f5e" className="animate-pulse" />
          <circle cx="528" cy="256" r="3.5" fill="#334155" />
          <circle cx="546" cy="256" r="3.5" fill="#334155" />

          {/* 상부 배전 이름 라벨 */}
          <rect x="458" y="132" width="140" height="22" rx="3" fill="#000" stroke="#f43f5e" strokeWidth="1"/>
          <text x="528" y="146" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="black" className="animate-pulse">
            [ ⚡ 비상 배전반 두꺼비집 레버 ]
          </text>
        </g>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
//  김정웅 교수 연구실 SVG — 백룸 버전
// ─────────────────────────────────────────────
function KimStudySVG({
  solvedPuzzles,
  inventory,
  needsPowerReset,
  onPowerReset,
  onInteract,
}: {
  solvedPuzzles: string[];
  inventory: string[];
  needsPowerReset: boolean;
  onPowerReset: () => void;
  onInteract: (type: ActionId) => void;
}) {
  const amb = needsPowerReset ? 0.04 : 1;
  const q23Done = solvedPuzzles.includes("Q23");
  const q09Done = solvedPuzzles.includes("Q09");

  return (
    <>
      <rect x="0" y="0" width="800" height="480" fill={`rgba(163,146,56,${amb * 0.92})`}/>
      {/* 천장 */}
      <rect x="0" y="0" width="800" height="128" fill={`rgba(188,178,86,${amb * 0.96})`}/>
      {Array.from({ length: 14 }).map((_, i) =>
        <line key={`ct${i}`} x1={i * 62} y1="0" x2={i * 62} y2="128" stroke={`rgba(143,130,48,${amb * 0.48})`} strokeWidth="1"/>
      )}
      {[0,38,76,114].map((y, i) =>
        <line key={`cth${i}`} x1="0" y1={y} x2="800" y2={y} stroke={`rgba(143,130,48,${amb * 0.48})`} strokeWidth="1"/>
      )}
      {/* 형광등 */}
      {[160, 400, 640].map((x, i) => (
        <g key={`kfl${i}`} opacity={needsPowerReset ? 0.05 : 1}>
          <rect x={x - 46} y="8" width="92" height="14" rx="2" fill="rgba(213,203,128,0.92)"/>
          <rect x={x - 44} y="9" width="88" height="12" rx="1" fill="rgba(248,243,192,0.96)"/>
          <ellipse cx={x} cy="28" rx="72" ry="32" fill="rgba(255,250,178,0.13)"/>
        </g>
      ))}
      {/* 벽 몰딩 */}
      <line x1="0" y1="128" x2="800" y2="128" stroke={`rgba(153,138,50,${amb * 0.58})`} strokeWidth="3"/>
      <line x1="0" y1="338" x2="800" y2="338" stroke={`rgba(153,138,50,${amb * 0.48})`} strokeWidth="2"/>
      {/* 바닥 */}
      <rect x="0" y="338" width="800" height="142" fill={`rgba(146,130,50,${amb * 0.82})`}/>
      {Array.from({ length: 9 }).map((_, i) =>
        <line key={`kfv${i}`} x1={i * 100} y1="338" x2={i * 100} y2="480" stroke={`rgba(128,113,42,${amb * 0.38})`} strokeWidth="1"/>
      )}
      {/* 점액 흔적 */}
      <g opacity={needsPowerReset ? 0.08 : 0.42}>
        <path d="M 98,358 Q 198,338 278,368 Q 338,383 398,358"
          fill="none" stroke="rgba(98,82,16,0.68)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 498,348 Q 578,328 658,353"
          fill="none" stroke="rgba(88,76,13,0.58)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M 698,138 Q 718,198 703,258"
          fill="none" stroke="rgba(93,80,13,0.48)" strokeWidth="8" strokeLinecap="round"/>
      </g>
      {/* 책상 */}
      <rect x="258" y="258" width="284" height="102" rx="4"
        fill={`rgba(108,93,34,${amb * 0.92})`} stroke={`rgba(148,133,48,${amb * 0.68})`} strokeWidth="2"/>
      <rect x="273" y="360" width="17" height="42" fill={`rgba(88,76,26,${amb * 0.82})`}/>
      <rect x="510" y="360" width="17" height="42" fill={`rgba(88,76,26,${amb * 0.82})`}/>

      {/* 방 안의 상호작용 가능한 요소들을 그룹화 후 검정화 */}
      <g opacity={needsPowerReset ? 0.15 : 1}>
        {/* 폐 터미널 (Q23) */}
        {!q23Done ? (
          <g className="cursor-pointer group/terminal" onClick={() => !needsPowerReset && onInteract("terminal")}>
            <rect x="298" y="218" width="92" height="66" rx="6"
              fill="rgba(10,16,6,0.96)" stroke="rgba(184,212,74,0.38)"
              strokeWidth="1.5" className="group-hover/terminal:stroke-[rgba(184,212,74,0.92)] transition-colors"/>
            <rect x="306" y="226" width="76" height="50" rx="3" fill="#030502"/>
            <rect x="314" y="258" width="8" height="12" fill="rgba(184,212,74,0.58)" className="animate-pulse"/>
            <line x1="306" y1="244" x2="382" y2="244" stroke="rgba(184,212,74,0.1)" strokeWidth="1"/>
            <line x1="306" y1="256" x2="382" y2="256" stroke="rgba(184,212,74,0.07)" strokeWidth="1"/>
            <rect x="328" y="284" width="32" height="8" rx="2" fill="rgba(78,68,23,0.92)"/>
            <rect x="266" y="198" width="160" height="18" rx="3" fill="rgba(0,0,0,0.83)"/>
            <text x="346" y="211" fill="rgba(184,212,74,0.96)" fontSize="10"
              textAnchor="middle" fontFamily="monospace" fontWeight="bold"
              className="group-hover/terminal:fill-[#B8D44A] animate-pulse">
              [ 💻 폐 터미널 접속 시도 ]
            </text>
          </g>
        ) : (
          <g opacity="0.48">
            <rect x="298" y="218" width="92" height="66" rx="6"
              fill="rgba(10,16,6,0.58)" stroke="rgba(78,73,28,0.38)" strokeWidth="1"/>
            <rect x="266" y="198" width="160" height="18" rx="3" fill="rgba(0,0,0,0.58)"/>
            <text x="346" y="211" fill="rgba(118,108,43,0.68)" fontSize="9"
              textAnchor="middle" fontFamily="monospace">터미널 데이터 수집 완료</text>
          </g>
        )}

        {/* 금고 (Q09) */}
        {q23Done && !q09Done ? (
          <g className="cursor-pointer group/safe" onClick={() => !needsPowerReset && onInteract("safe")}>
            <rect x="88" y="178" width="102" height="122" rx="4"
              fill="rgba(58,48,18,0.96)" stroke="rgba(184,212,74,0.48)"
              strokeWidth="2" className="group-hover/safe:stroke-[rgba(184,212,74,0.96)] transition-colors animate-pulse"/>
            <circle cx="139" cy="228" r="29" fill="rgba(38,33,10,0.96)"
              stroke="rgba(184,212,74,0.58)" strokeWidth="1.5"
              className="group-hover/safe:stroke-[rgba(184,212,74,0.92)]"/>
            <circle cx="139" cy="228" r="14" fill="rgba(18,16,4,0.96)"
              stroke="rgba(128,113,40,0.68)" strokeWidth="1"/>
            <rect x="122" y="268" width="34" height="13" rx="2"
              fill="rgba(78,8,8,0.92)" stroke="rgba(198,28,28,0.68)" strokeWidth="1"/>
            <text x="139" y="278" fill="rgba(218,58,58,0.92)" fontSize="8"
              textAnchor="middle" fontFamily="monospace" fontWeight="bold">LOCK</text>
            <rect x="66" y="158" width="146" height="18" rx="3" fill="rgba(0,0,0,0.83)"/>
            <text x="139" y="171" fill="rgba(184,212,74,0.96)" fontSize="10"
              textAnchor="middle" fontFamily="monospace" fontWeight="bold"
              className="group-hover/safe:fill-[#B8D44A] animate-pulse">
              [ 🔒 金庫 — 코드 입력 ]
            </text>
          </g>
        ) : q09Done ? (
          <g opacity="0.38">
            <rect x="88" y="178" width="102" height="122" rx="4"
              fill="rgba(58,48,18,0.48)" stroke="rgba(78,73,28,0.28)" strokeWidth="1"/>
            <rect x="66" y="158" width="146" height="18" rx="3" fill="rgba(0,0,0,0.48)"/>
            <text x="139" y="171" fill="rgba(98,88,33,0.68)" fontSize="9"
              textAnchor="middle" fontFamily="monospace">금고 개방 완료</text>
          </g>
        ) : null}

        {/* 비상 탈출 키트 보관함 (escape_kit) */}
        <g className="cursor-pointer group/escape_kit" onClick={() => !needsPowerReset && onInteract("escape_kit")}>
          <rect x="460" y="200" width="100" height="110" rx="4"
            fill="rgba(40,30,10,0.95)" stroke="rgba(184,212,74,0.48)" strokeWidth="2"
            className="group-hover/escape_kit:stroke-[#B8D44A] transition-colors"/>
          
          <rect x="495" y="195" width="30" height="15" rx="1" fill="#e5c158" stroke="#9e7c10" strokeWidth="1" />
          <circle cx="510" cy="225" r="8" fill="#e5c158" />
          <path d="M 506,225 L 514,225 L 510,232 Z" fill="#000" />
          
          <rect x="475" y="250" width="70" height="20" rx="2" fill="#000" />
          <text x="510" y="263" fill="#ffe030" fontSize="7" textAnchor="middle" className="font-mono text-[7px] font-bold">
            {inventory.includes("escape_kit") ? "📦 EMPTY" : "⚠️ ESCAPE_KIT"}
          </text>
        </g>

        {/* 연구 메모 (벽에 핀) */}
        <g opacity="0.82">
          <rect x="478" y="148" width="72" height="92" rx="2"
            fill="rgba(218,213,168,0.87)" stroke="rgba(168,153,58,0.48)" strokeWidth="1"/>
          {[162,172,182,192,202].map((y, i) =>
            <line key={`mn${i}`} x1="486" y1={y} x2="542" y2={y} stroke="rgba(88,78,23,0.48)" strokeWidth="1"/>
          )}
          <circle cx="514" cy="150" r="3" fill="rgba(198,48,48,0.72)"/>
          <g transform="rotate(-9, 598, 168)">
            <rect x="558" y="153" width="57" height="52" rx="2" fill="rgba(248,238,138,0.92)"/>
            <text x="586" y="173" fill="rgba(58,48,13,0.92)" fontSize="8"
              textAnchor="middle" fontFamily="monospace" fontWeight="bold">VIRUS</text>
            <text x="586" y="185" fill="rgba(58,48,13,0.68)" fontSize="7"
              textAnchor="middle" fontFamily="monospace">= 탈출코드?</text>
            <text x="586" y="196" fill="rgba(58,48,13,0.68)" fontSize="7"
              textAnchor="middle" fontFamily="monospace">— J.H.C</text>
          </g>
        </g>

        {/* 쓰러진 의자 */}
        <g opacity="0.68" transform="rotate(-24, 548, 338)">
          <rect x="518" y="293" width="62" height="52" rx="2"
            fill="rgba(98,86,30,0.82)" stroke="rgba(128,116,40,0.48)" strokeWidth="1"/>
          <rect x="523" y="345" width="11" height="32" fill="rgba(78,68,23,0.82)"/>
          <rect x="563" y="345" width="11" height="32" fill="rgba(78,68,23,0.82)"/>
        </g>
      </g>

      {/* ⚡ 비상 두꺼비집 (연구실 내부 벽면 배전함) */}
      {needsPowerReset && (
        <g className="cursor-pointer group/breaker" onClick={onPowerReset}>
          <rect x="630" y="170" width="76" height="110" rx="4" fill="#0c0e14" stroke="#f43f5e" strokeWidth="2" className="animate-pulse" />
          <rect x="635" y="175" width="66" height="66" rx="2" fill="#050609" stroke="#334155" strokeWidth="1.5" />
          
          <line x1="668" y1="188" x2="668" y2="218" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          <circle cx="668" cy="218" r="8" fill="#f43f5e" className="animate-ping" style={{ animationDuration: "1s" }} />
          <circle cx="668" cy="218" r="5" fill="#f43f5e" />

          <circle cx="650" cy="256" r="3.5" fill="#f43f5e" className="animate-pulse" />
          <circle cx="668" cy="256" r="3.5" fill="#334155" />
          <circle cx="686" cy="256" r="3.5" fill="#334155" />

          <rect x="598" y="132" width="140" height="22" rx="3" fill="#000" stroke="#f43f5e" strokeWidth="1"/>
          <text x="668" y="146" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="black" className="animate-pulse">
            [ ⚡ 비상 복구 배전반 레버 ]
          </text>
        </g>
      )}

      {/* 위화감 패턴 */}
      <g opacity="0.038">
        {Array.from({ length: 6 }).map((_, i) =>
          <rect key={`pat${i}`} x={i * 133} y="138" width="118" height="202"
            fill="none" stroke="rgba(98,88,28,1)" strokeWidth="1" strokeDasharray="3,3"/>
        )}
      </g>
    </>
  );
}

// ─────────────────────────────────────────────
//  REACTION TEXTS
// ─────────────────────────────────────────────
const RX: Record<string, string[]> = {
  listen_0: ["멀리서 물방울 소리. 환기 덕트의 진동."],
  listen_1: ["끌리는 소리. 젖은 것이 콘크리트 위를 미끄러지는 소리."],
  listen_2: ["축축한 마찰음. 규칙적이고 천천히. 왼쪽 어딘가.", "냄새가 납니다. 달콤하고 역한 발효 냄새."],
  listen_3: ["공기를 흡입하는 소리. 너무 가깝습니다.", "바닥이 끈적거립니다. 조금 전까지는 아니었습니다."],
  listen_4: ["침묵. 그 자체가 두렵습니다.", "그것의 존재가 만들어내는 압도적인 정적."],
  observe_0: ["좁은 지하 통로. 배관과 콘크리트 벽. 습한 공기."],
  observe_1: ["바닥에 끈적한 흔적. 직경 45cm 정도의 점액질 자국."],
  observe_2: ["복도 끝에 — 뭔가 서 있습니다.", "천장에 닿을 만큼 큰. 검고 가느다란 것들이 여럿."],
  observe_3: ["그것에는 눈이 없습니다.", "하지만 당신을 향하고 있습니다.", "상체는 금속이 구겨진 것처럼."],
  hide_ok: ["숨을 멈춥니다.", "공기의 흐름이 멀어집니다."],
  hide_fail: ["너무 가깝습니다. 이미 감지되었습니다."],
  run: ["발소리가 복도에 울립니다. 그것도 — 움직이기 시작했습니다."],
};

function rx(key: string): string {
  const arr = RX[key];
  if (!arr?.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function BackroomsRoom({
  roomId, threatLevel, blackout2Active,
  solvedPuzzles, inventory,
  onThreatChange, onRoomChange, onPuzzleSolved, onAddLog,
}: BackroomsRoomProps) {

  const [blackoutOpacity, setBlackoutOpacity] = useState(0);
  const [blackoutPhase, setBlackoutPhase] = useState<"idle" | "running">("idle");
  const [sfxShown, setSfxShown] = useState(false);
  const [creatureReady, setCreatureReady] = useState(false);
  const [needsPowerReset, setNeedsPowerReset] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 400, y: 240 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 480;
    setMouseCoords({ x, y });
  };
  const [isAmbushActive, setIsAmbushActive] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const rxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [encounterResult, setEncounterResult] = useState<string | null>(null);

  const handleEncounterChoice = (choiceNum: number) => {
    playElectricFlicker();
    if (choiceNum === 1) {
      const nextTh = Math.min(5, threatLevel + 2);
      onThreatChange(nextTh);
      if (nextTh >= 5) {
        setEncounterResult(`🚨 [🚨 긴급 기습: 위협 임계치 도달!] \n\n기동 중 소음 축적으로 결국 괴생명체가 당신 바로 뒤까지 육박해 덮쳤습니다! 숨막히는 순간, 낡은 장비 랙이 바닥에 쏟아지며 그 속에 잠들어 있던 수동 보안 리볼버 권총이 발밑에 강하게 떨어졌습니다!\n\n당신은 총을 집어 들고 떨리는 방아쇠를 움켜쥐어 — 탕! 탕! 격렬하게 연사했습니다!\n\n탄환이 괴물의 촉수 코어에 꽃히고 시뻘건 섬광이 일어납니다! 끼에헤에엑—! 기분 나쁜 소리와 함께 괴생명체는 통로 파이프 뒤로 미끄러지듯 서둘러 퇴각했습니다! 위기에서 격퇴하여 살아남았습니다!\n\n(위협 레벨이 안전한 수준인 LEVEL 2로 회복되었습니다!)`);
        onAddLog("🔫 [보안 생존] 다가오는 생명체를 수동 리볼버로 격퇴했습니다!", "system");
        onThreatChange(2);
      } else {
        setEncounterResult(`🚪 [문 손잡이를 무리하게 조작함]\n\n연구실 방문을 억지로 열려 소음을 감행했습니다! 🔊 [SFX: 철컥철컥!]\n\n하지만 잠겨버린 철문에 걸린 위상 래치가 심한 금속성 울림소리를 동조시키고 맙니다! 이 자극적인 울림에 괴생명체(Bacteria-Class Entity)가 당신의 전하 위치를 완벽하게 고립 포착합니다! 위협 지수가 위험 수치로 누적됩니다 (+2).\n\n(현재 위협 수준: LEVEL ${nextTh}/5)\n\n어서 숨을 엄폐할 통로 사물함을 물색하거나(아래 📦 사물함 은신 클릭) 정숙하게 귀 기울여 판단해 보십시오!`);
        onAddLog(`🚨 [위기 상승] 무리한 진입 소동으로 괴물이 한걸음 더 다가왔습니다.`, "system");
      }
    } else {
      const nextTh = Math.max(0, threatLevel - 1);
      onThreatChange(nextTh);
      setEncounterResult(`🤫 [동작 무정력 상태 돌입 및 호흡 억제]\n\n조용히 발을 멈추고 숨결의 산하량을 억제하며 기다립니다. 🔊 [SFX: 쉭쉭거리는 기류...]\n\n차가운 암전 복도의 습기 분율이 변동하고, 보이지 않는 반투명 위족 복합체 점액 덩어리가 서서히 벽면 타일을 타고 당신 옆 1.5미터 앞까지 기어가며 발산하는 심장박동 기류를 미세하게 선회합니다. 하지만 소음 신호가 없자 유기체는 이내 문 고리 위에서 물러나 천장의 어둡고 끈적끈적한 도관 내부로 미끄러져 사라집니다. 위협 수준이 감소합니다 (-1).\n\n(현재 위협 수준: LEVEL ${nextTh}/5)\n\n💡 기괴한 물체는 이제 천장 도관 내부로 비껴났습니다! 위협 지수가 낮을(LEVEL 1 이하) 때 안전히 통제 하에 복귀하려면 아래 '☢️ 안전 진입' 버튼을 눌러 교수의 서재 연구실 안으로 전사할 수 있습니다.`);
      onAddLog("🤫 동작 정지 및 음소거 대응을 통해 위기를 비껴갔습니다.", "system");
    }
  };

  const handleEncounterSubAction = (action: string) => {
    if (action === "listen") {
      const k = `listen_${Math.min(threatLevel, 4)}`;
      const text = rx(k);
      setEncounterResult(`👂 [👂 공기 청취 결과]\n\n${text}`);
      onAddLog(`[청취] ${text}`, "system");
      if (threatLevel >= 3) playCreatureAmbient();
    } else if (action === "observe") {
      const k = `observe_${Math.min(threatLevel, 3)}`;
      const text = rx(k);
      setEncounterResult(`👁 [👁 시각 관찰 결과]\n\n${text}`);
      onAddLog(`[관측] ${text}`, "system");
    } else if (action === "hide") {
      const nextTh = Math.max(0, threatLevel - 1);
      onThreatChange(nextTh);
      setEncounterResult(`📦 [기지 통로 캐비닛 사물함 은신]\n\n당신은 주위를 더듬거리다 복도 모퉁이에 반쯤 찌그러진 부식된 사물함을 발견하고 몸을 비좁게 밀어 넣습니다. 🔊 [SFX: 스스스...]\n\n잠시 후, 문틈 너머 바닥에 누런 반투명 위족의 실체들이 끈적한 점포를 흘리며 미끄러지듯 스쳐 지나갑니다. 괴생명체(Bacteria-Class Entity)가 사물함의 좁은 표면적에서 관심의 임계선을 생략하고 반대쪽 배후선으로 철류합니다. 위협 강도가 완화되었습니다 (-1).\n\n(현재 위협 수준: LEVEL ${nextTh}/5)`);
      onAddLog("📦 사물함 캐비닛으로 회피하여 유기체를 완벽히 따돌렸습니다.", "system");
    } else if (action === "enter") {
      if (threatLevel <= 1) {
        onRoomChange("kim_study");
        onAddLog("🔓 연구실 문을 통제 개방하고 내부로 무사 진입했습니다.", "system");
      } else {
        setEncounterResult("🚫 [진입 실패: 위협 과다] 아직 주변에 기이한 위족 소음(Threat Level >= 2)이 과도하게 소용돌이치고 있어서 문을 거칠게 열 수 없습니다! 먼저 '자리에 멈춰 숨을 참는다'를 선택해 완화해 주십시오.");
      }
    }
  };

  const showRx = useCallback((text: string) => {
    setReaction(text);
    if (rxTimer.current) clearTimeout(rxTimer.current);
    rxTimer.current = setTimeout(() => setReaction(null), 3400);
  }, []);

  // 전원 복구 전역 상태 동기화
  useEffect(() => {
    if (solvedPuzzles.includes("POWER_RESTORED")) {
      setBlackoutOpacity(0);
      setNeedsPowerReset(false);
      setBlackoutPhase("idle");
      setCreatureReady(true);
    }
  }, [solvedPuzzles]);

  // 위협 레벨 5 도달 시 기습 위기 돌입
  useEffect(() => {
    if (threatLevel >= 5) {
      setIsAmbushActive(true);
    } else {
      setIsAmbushActive(false);
    }
  }, [threatLevel]);

  // 블랙아웃 시퀀스
  useEffect(() => {
    if (solvedPuzzles.includes("POWER_RESTORED")) return;
    if (!blackout2Active || blackoutPhase !== "idle") return;
    setBlackoutPhase("running");

    (async () => {
      playElectricFlicker();
      for (let i = 0; i < 5; i++) {
        setBlackoutOpacity(0.93);
        await ms(72);
        setBlackoutOpacity(0.06);
        await ms(60 + Math.random() * 82);
      }
      setBlackoutOpacity(1);
      await ms(720);
      playThud();
      setSfxShown(true);
      onAddLog("🔊 [SFX: 쿵] — 지하 통로 어딘가에서 묵직한 충격음. 보조 전력이 차단되었습니다.", "system");
      await ms(1400);
      setSfxShown(false);
      setNeedsPowerReset(true);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blackout2Active, solvedPuzzles]);

  const handlePowerReset = async () => {
    if (!needsPowerReset) return;
    playElectricFlicker();
    playThud();
    onAddLog("🔌 수동 전원 레버를 작동했습니다. 스파크 현상과 함께 비상 발전기가 회전합니다!", "player");

    // Flickering back to life
    for (let i = 0; i < 4; i++) {
      setBlackoutOpacity(0.9);
      await ms(60);
      setBlackoutOpacity(0.18);
      await ms(80);
    }

    // Smoothly restore
    for (let o = 80; o >= 0; o -= 10) {
      setBlackoutOpacity(o / 100);
      await ms(30);
    }
    setBlackoutOpacity(0);
    setNeedsPowerReset(false);
    setBlackoutPhase("idle");
    setCreatureReady(true);
    onThreatChange(2);
    onPuzzleSolved("POWER_RESTORED"); // Save power status persistently
    playCreatureAmbient();
    onAddLog("⚡ 붉은색 보조 조명이 깜빡이며 복도로 빛이 돌아옵니다.", "system");
    onAddLog("달콤하고 역한 냄새. 환기구 너머로 길고 검은 촉수가 흔들리는 듯한 이질적인 형체가 모습을 보입니다.", "system");
  };

  // 생명체 스케일
  const SCALES = [0.001, 0.09, 0.20, 0.38, 0.68, 1.08];
  const cScale = creatureReady ? SCALES[Math.min(threatLevel, 5)] : 0.001;
  const cOpacity = creatureReady ? Math.min(1, threatLevel * 0.21) : 0;
  const vigOpacity = threatLevel >= 3 ? (threatLevel - 2) * 0.21 : 0;
  const locked = blackoutPhase !== "idle" || needsPowerReset || isAmbushActive;

  const handleFireRevolver = async () => {
    playGunshot();
    onAddLog("🔫 [전투 생존] 절체절명의 사투 끝에 떨리는 손으로 낡은 리볼버 방아쇠를 움켜쥐어 당겼습니다!", "player");
    onAddLog("🔊 [SFX: 타아아앙!] — 폭발적인 총격 쇳소리와 가스 연이 기지 통각을 흔듭니다.", "system");
    setIsAmbushActive(false);
    onThreatChange(2); // 위협도를 2로 급격히 완화하여 안착시킵니다.
    onPuzzleSolved("CREATURE_REPELLED");
    onAddLog("끼에에에엑—! 명중했습니다! 탄환이 코어 부위의 고온 고압 축적 발광 단백 배아를 관통하자 기괴한 주파수의 파열 단말 비명을 내지르며, 길고 질긴 검은 촉수 구체는 사방으로 어두운 체액을 뿜어대면서 우회 배관 깊은 어둠 속으로 서둘러 소리치며 퇴각해 도망쳤습니다!", "system");
    showRx("🎯 명중! 괴생명체가 심각한 부상을 입고 심연의 배관 라인 깊은 곳으로 완전 격퇴되어 도망쳤습니다!");
  };

  // 행동 핸들러
  async function handleAction(id: ActionId) {
    if (locked) return;

    switch (id) {
      case "hide_locker":
        if (threatLevel <= 3) {
          onThreatChange(Math.max(0, threatLevel - 1));
          showRx(rx("hide_ok"));
          onAddLog("사물함 뒤에 숨습니다. 공기 흐름이 멀어집니다.", "player");
        } else {
          onThreatChange(Math.min(5, threatLevel + 1));
          showRx(rx("hide_fail"));
          onAddLog("이미 너무 가깝습니다.", "player");
        }
        break;

      case "hide_pipe":
        showRx("파이프가 삐걱거립니다...");
        onAddLog("파이프 뒤에 숨으려 합니다. 소음이 납니다.", "player");
        onThreatChange(Math.min(5, threatLevel + 1));
        break;

      case "listen": {
        const k = `listen_${Math.min(threatLevel, 4)}`;
        const t = rx(k);
        showRx(t);
        onAddLog(`[청취] ${t}`, "system");
        if (threatLevel >= 3) playCreatureAmbient();
        break;
      }

      case "observe": {
        const k = `observe_${Math.min(threatLevel, 3)}`;
        const t = rx(k);
        showRx(t);
        onAddLog(`[관찰] ${t}`, "system");
        break;
      }

      case "run":
        if (roomId === "kim_study") {
          if (!solvedPuzzles.includes("CREATURE_REPELLED")) {
            onAddLog("🚨 [탈출 봉쇄] 문을 열어 복도로 나가 도망치려 했으나, 복도 천장에 똬리를 튼 검은 촉수 덩어리가 쉭쉭거리는 기괴한 점액성 비명과 함께 문 앞을 빈틈없이 가로막아 서고 당신을 강하게 뒤로 내팽개쳤습니다!", "system");
            onAddLog("생명체의 포위망을 돌파하지 못하면 이 방에서 살아나갈 수 없습니다! 도망치는 것은 불가능하며 생명체와 맞서 물리쳐야 합니다!", "system");
            onThreatChange(5); // 즉시 엠버쉬 위기(전투)에 진입합니다!
            break;
          }
          onRoomChange("secret_passage");
          break;
        }
        showRx(rx("run"));
        onAddLog("전력으로 달립니다. 발소리가 울립니다.", "player");
        playThud();
        onThreatChange(Math.min(5, threatLevel + 2));
        break;

      case "enter_lab":
        if (threatLevel > 2) {
          showRx("위협 레벨이 너무 높습니다. 먼저 숨거나 기다리세요.");
          onAddLog("위협 레벨이 높아 연구실 진입 불가.", "system");
          break;
        }
        onAddLog("연구실 문을 힘겹게 밀어 열고 주위를 경계하며 기지로 들어갑니다.", "player");
        onRoomChange("kim_study");
        // Maintain threat level when going inside so it builds up from here
        break;

      case "terminal":
        if (!solvedPuzzles.includes("Q23")) {
          onPuzzleSolved("Q23", "kim_log");
          showRx("터미널에서 김정웅 교수의 격리 로그를 추출했습니다.");
          onAddLog("💻 폐 터미널 — kim_log 데이터 추출에 성공했습니다.", "clio");
          
          const nextTh = Math.min(4, threatLevel + 1);
          if (nextTh > threatLevel) {
            onThreatChange(nextTh);
            onAddLog("🚨 [위협 상승] 쿵...! 연구실 외부 통로 어둠 속에서 축축하고 무거운 무언가가 바닥을 짚는 거친 진동이 감지됩니다.", "system");
          }
        } else {
          showRx("이미 데이터를 수집했습니다.");
        }
        break;

      case "safe":
        if (!solvedPuzzles.includes("Q23")) {
          showRx("먼저 터미널을 확인하세요.");
          break;
        }
        onPuzzleSolved("__OPEN_SAFE__");
        
        const nextTh2 = Math.min(4, threatLevel + 1);
        if (nextTh2 > threatLevel) {
          onThreatChange(nextTh2);
          onAddLog("🚨 [위협 상승] 복도 천장 배관이 쥐어짜이듯 삐걱대며 찌그러지는 쇳소리가 진동합니다. 발효 냄새가 문틈으로 스며듭니다.", "system");
        }
        break;

      case "escape_kit":
        if (!inventory.includes("escape_kit")) {
          onPuzzleSolved("escape_kit");
          showRx("비상 탈출 키트(escape_kit)를 획득했습니다!");
          onAddLog("🎒 획득: 📦 김정웅 교수의 비상 탈출 키트 (escape_kit)", "system");
          
          const nextTh3 = Math.min(4, threatLevel + 1);
          if (nextTh3 > threatLevel) {
            onThreatChange(nextTh3);
          }
          onAddLog("🚨 [위협 고조] 쿠구구궁! 쇠사슬이 끌리는 듯한 불이익 충격음과 함께 기괴한 다중 숨소리가 연구실 문 바로 너머까지 당도했습니다. 지체 없이 탈출해야 합니다!", "system");
        } else {
          showRx("이미 탈출 키트를 획득했습니다.");
        }
        break;
    }
  }

  const BTN: Record<string, string> = {
    green: "border-green-600 bg-green-950/80 text-green-300 hover:bg-green-900/90 hover:border-green-400",
    red:   "border-red-700   bg-red-950/80   text-red-300   hover:bg-red-900/90   hover:border-red-500",
    amber: "border-yellow-700 bg-yellow-950/80 text-yellow-300 hover:bg-yellow-900/90 hover:border-yellow-500",
    blue:  "border-blue-700  bg-blue-950/80  text-blue-300  hover:bg-blue-900/90  hover:border-blue-500",
  };

  type Btn = { id: ActionId; label: string; sub?: string; x: number; y: number; clr: string; dis?: boolean };

  const btns: Btn[] = roomId === "secret_passage" ? [
    { id: "hide_locker", label: "🚪 사물함에 숨기", sub: "위협 -1", x: 6, y: 50, clr: "green" },
    { id: "hide_pipe",   label: "🔩 파이프 뒤",    sub: "불안정",   x: 6, y: 66, clr: "amber" },
    { id: "listen",      label: "👂 귀 기울이기",                   x: 36, y: 80, clr: "amber" },
    { id: "observe",     label: "👁 자세히 보기",                   x: 56, y: 80, clr: "amber" },
    { id: "run",         label: "🏃 도주",          sub: "위협 +2 ⚠", x: 36, y: 92, clr: "red" },
    {
      id: "enter_lab",
      label: "🚪 연구실로",
      sub: threatLevel <= 2 ? "진입 가능" : "위협 너무 높음",
      x: 72, y: 38,
      clr: threatLevel <= 2 ? "green" : "red",
    },
  ] : [
    { id: "terminal", label: "💻 폐 터미널",    sub: solvedPuzzles.includes("Q23") ? "완료" : "접속", x: 40, y: 52, clr: "green", dis: solvedPuzzles.includes("Q23") },
    { id: "safe",     label: "🔒 금고",          sub: !solvedPuzzles.includes("Q23") ? "터미널 먼저" : "코드 입력", x: 12, y: 52, clr: "green", dis: !solvedPuzzles.includes("Q23") || solvedPuzzles.includes("Q09") },
    { id: "escape_kit", label: "📦 비상 탈출 키트", sub: inventory.includes("escape_kit") ? "획득완료" : "수집하기", x: 68, y: 52, clr: "amber", dis: inventory.includes("escape_kit") },
    { id: "run",      label: "← 통로로 복귀",                       x: 4,  y: 88, clr: "blue" },
  ];

  return (
    <div className="relative w-full h-full select-none" onMouseMove={handleMouseMove}>
      {/* SVG 뷰포트 */}
      <svg viewBox="0 0 800 480" className="w-full h-full font-mono animate-fade-in">
        {roomId === "secret_passage"
          ? <SecretPassageSVG threatLevel={threatLevel} needsPowerReset={needsPowerReset} onPowerReset={handlePowerReset}/>
          : <KimStudySVG 
              solvedPuzzles={solvedPuzzles} 
              inventory={inventory} 
              needsPowerReset={needsPowerReset} 
              onPowerReset={handlePowerReset} 
              onInteract={handleAction}
            />
        }
        {/* 생명체 */}
        {roomId === "secret_passage" && (
          <CreatureSVG scale={cScale} opacity={cOpacity}/>
        )}
        {/* 비네트 */}
        {vigOpacity > 0 && (
          <>
            <defs>
              <radialGradient id="vig" cx="50%" cy="50%" r="50%">
                <stop offset="38%" stopColor="transparent"/>
                <stop offset="100%" stopColor={`rgba(72,0,0,${vigOpacity})`}/>
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="800" height="480" fill="url(#vig)" pointerEvents="none"/>
          </>
        )}
        {/* 스캔라인 */}
        <defs>
          <pattern id="sl" patternUnits="userSpaceOnUse" width="2" height="4">
            <rect width="2" height="2" fill="black" opacity="0.45"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="800" height="480" fill="url(#sl)" opacity="0.038" pointerEvents="none"/>
      </svg>

      {/* 🔦 2차 암전 복구 시 손전등 시각 효과 */}
      {needsPowerReset && (
        <>
          {/* Layer A: Backdrop Blur for out-of-focus darkness */}
          <div 
            className="absolute inset-0 z-40 pointer-events-none transition-all duration-75"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              WebkitMaskImage: `radial-gradient(circle(160px) at ${(mouseCoords.x / 800) * 100}% ${(mouseCoords.y / 480) * 100}%, transparent 65%, black 100%)`,
              maskImage: `radial-gradient(circle(160px) at ${(mouseCoords.x / 800) * 100}% ${(mouseCoords.y / 480) * 100}%, transparent 65%, black 100%)`
            }}
          />
          {/* Layer B: Dark Vignette and Flashlight Light Beam Glow */}
          <div 
            className="absolute inset-0 z-40 pointer-events-none transition-all duration-75"
            style={{
              background: `radial-gradient(circle 200px at ${(mouseCoords.x / 800) * 100}% ${(mouseCoords.y / 480) * 100}%, rgba(245, 235, 180, 0.18) 0%, rgba(200, 180, 110, 0.1) 50%, rgba(10, 12, 16, 0.72) 75%, rgba(2, 3, 5, 0.99) 98%)`,
            }}
          />
        </>
      )}

      {/* 블랙아웃 오버레이 */}
      <div className="absolute inset-0 bg-black pointer-events-none z-40 transition-opacity duration-200"
        style={{ opacity: needsPowerReset ? 0 : blackoutOpacity }}/>

      {/* SFX 텍스트 */}
      <AnimatePresence>
        {sfxShown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-center space-y-3">
              <div className="text-white font-black text-2xl tracking-[0.4em] bg-red-950/82 px-6 py-3 rounded border-l-4 border-red-600">
                ████ [BLACKOUT_2] ████
              </div>
              <div className="text-green-300 font-mono text-sm italic bg-black/82 px-4 py-2 rounded">
                🔊 [ SFX : 쿵 ]
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 클릭 행동 버튼 */}
      {!locked && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {btns.map((b) => (
            <button
              key={b.id}
              disabled={b.dis}
              onClick={() => handleAction(b.id)}
              className={`absolute pointer-events-auto px-2.5 py-1.5 rounded border
                text-[10px] font-black font-mono uppercase tracking-wider
                transition-all active:scale-95 shadow-lg cursor-pointer
                ${b.dis
                  ? "border-zinc-700 bg-zinc-950/58 text-zinc-600 cursor-not-allowed opacity-48"
                  : BTN[b.clr]
                }`}
              style={{
                left: `${b.x}%`, top: `${b.y}%`,
                transform: "translateY(-50%)",
                backdropFilter: "blur(2px)",
              }}
            >
              {b.label}
              {b.sub && <span className="block text-[8px] opacity-68 font-normal normal-case tracking-normal mt-0.5">{b.sub}</span>}
            </button>
          ))}
        </div>
      )}

      {/* 위협 레벨 인디케이터 */}
      <div className="absolute top-2 right-3 z-30 flex items-center gap-2 bg-black/72 px-2.5 py-1.5 rounded border border-zinc-800 font-mono">
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">위협</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm transition-colors ${
              i < threatLevel
                ? threatLevel <= 2 ? "bg-yellow-600" : threatLevel <= 3 ? "bg-orange-600" : "bg-red-600 animate-pulse"
                : "bg-zinc-800"
            }`}/>
          ))}
        </div>
        <span className={`text-[10px] font-black ${
          threatLevel >= 4 ? "text-red-400 animate-pulse" : threatLevel >= 2 ? "text-yellow-500" : "text-zinc-500"
        }`}>{threatLevel}/5</span>
      </div>

      {/* 반응 텍스트 팝업 */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30
              max-w-sm bg-black/92 border border-zinc-700 px-4 py-2.5
              rounded font-mono text-xs text-zinc-300 text-center shadow-xl
              pointer-events-none whitespace-pre-wrap"
            style={{ backdropFilter: "blur(4px)" }}
          >
            {reaction}
          </motion.div>
        )}
      </AnimatePresence>



      {/* 🚨 기습 위기 극비 격퇴 이벤트 오버레이 */}
      {isAmbushActive && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center font-mono select-none">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full space-y-6 border-2 border-red-500 bg-black/92 p-6 rounded-lg shadow-[0_0_35px_rgba(239,68,68,0.4)] relative overflow-hidden"
          >
            {/* 붉은 비상 조명 스윕 애니메이션 자국 */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 animate-pulse pointer-events-none" />
            
            <div className="space-y-2">
              <div className="text-red-500 font-black text-base tracking-[0.25em] animate-bounce flex items-center justify-center gap-2">
                <span>☠️</span> AMBUSH_CRITICAL_BREACH <span>☠️</span>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest">
                심연의 유기체가 전신을 결박하여 고립시켰습니다!
              </div>
            </div>

            <div className="border border-red-900/60 bg-red-950/20 p-4 rounded text-left space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                성급한 소음 혹은 한계치의 접근으로 인해 괴생명체가 당신을 포위하고 숨통을 조여옵니다! 검은 점액질 촉수들이 발목을 강하게 옭아매고, 체감이 붉게 페이즈 아웃됩니다...
              </p>
              <p className="text-xs text-red-400 font-bold leading-relaxed">
                그 절체절명의 찰나, 파괴된 연구용 장비 선반 틈새에서 구형 <span className="underline">철제 실탄 리볼버(Revolver) 권총</span>이 발밑으로 철커덕 떨어졌습니다! 생명체의 심장부 발광 코어를 조준하십시오!
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center justify-center space-y-4">
              <button
                onClick={handleFireRevolver}
                className="relative group px-8 py-5 rounded border-2 border-red-500 bg-red-950/60 text-white 
                  hover:bg-red-800 hover:border-red-400 hover:scale-105 transition-all duration-200
                  active:scale-95 shadow-[0_0_25px_rgba(239,68,68,0.5)] focus:outline-none cursor-pointer"
              >
                <div className="text-sm font-black tracking-widest uppercase mb-1 flex items-center justify-center gap-2">
                  <span>🔫</span> [ 괴생명체 코어 조준 사격 ]
                </div>
                <div className="text-[8px] text-zinc-300 font-normal">
                  PULL TRIGGER TO FIRE SOLID-CORE SPECIAL AMMUNITION
                </div>
                {/* 비주얼 핑 애니메이션 */}
                <div className="absolute inset-0 border-2 border-red-400 rounded opacity-0 group-hover:animate-ping pointer-events-none" />
              </button>
              
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest">
                당신에겐 단 한 발의 생존 격퇴 기회만 주어집니다!
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔮 [BLACKOUT_2] Full-screen Narrative Terminal Overlay */}
      {roomId === "secret_passage" && blackout2Active && !encounterResult && (
        <div className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-4 text-center select-text font-mono">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(72,12,12,0.15)_0%,rgba(0,0,0,0.98)_100%)] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl border border-zinc-800 bg-zinc-950/90 rounded-lg p-5 md:p-7 space-y-5 shadow-2xl relative"
          >
            {/* Warning top rail */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-500">
              <span className="text-[9px] tracking-widest text-[#B8D44A] font-black animate-pulse">● SIGNAL_INTERCEPT_ACTIVE</span>
              <span className="text-[9px] font-mono tracking-widest">SUB_ROOM: PASSAGE_317</span>
            </div>

            {/* Immersive prose screen */}
            <div className="text-left space-y-3.5 select-text">
              <div className="text-[#A6C43A] font-black text-xs tracking-[0.3em] uppercase">
                ████ [BLACKOUT_2: 두 번째 정전 위기] ████
              </div>

              <div className="text-zinc-500 text-[10px] leading-relaxed border-l-2 border-zinc-700 pl-3">
                복도의 비상 발전 지수가 급격히 하강하며, 일순간에 모든 방향의 주 조명이 일괄 파쇄되었습니다.
                짙어지는 냉기와 함께 어둠의 밀도가 수축하기 시작합니다...
              </div>

              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-semibold tracking-wide">
                코를 찌르는 냄새가 납니다. 발효된 유기물, 그리고 뭔가 달콤한 것.
                바닥이 — 조금 전까지는 분명 건조했던 바닥이 — 발밑에서 끈적거립니다.
              </p>

              <p className="text-[11px] text-zinc-450 leading-relaxed font-normal">
                왼쪽 주위 배관 어둠 속에서 무언가가 은밀하게 움직였습니다.
                소리가 들린 것은 아니지만, 차디찬 공기의 압밀 기류가 비대칭적으로 소용돌이칩니다.
                연구실 철문 손잡이가 당신 손끝에서 가까스로 냉기를 발산하고 있습니다.
              </p>
            </div>

            {/* Choices section */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest text-left">
                [ 행동 선택 / DISCOVERY ACTIONS ]
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleEncounterChoice(1)}
                  className="w-full text-left p-3 border border-red-900/60 bg-red-950/25 hover:bg-red-950/45 hover:border-red-500 text-red-200 text-xs rounded transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="font-extrabold text-[#B8D44A] mb-0.5 group-hover:text-white transition-colors">[선택 1] 문을 연다</div>
                  <div className="text-[9px] text-zinc-500 leading-normal">문을 열고 연구실 안으로 진입합니다. (위협 +2)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleEncounterChoice(2)}
                  className="w-full text-left p-3 border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 text-xs rounded transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="font-extrabold text-[#B8D44A] mb-0.5 group-hover:text-white transition-colors">[선택 2] 대기한다</div>
                  <div className="text-[9px] text-zinc-500 leading-normal">그 자리에 멈춰 숨을 참고 기다립니다. (위협 -1)</div>
                </button>
              </div>
            </div>

            {/* Quick action info */}
            <div className="text-[9px] text-zinc-500 border-t border-zinc-900 pt-2 text-left">
              💬 채팅창에 "1" 또는 "2"를 직접 입력하거나 아래 위협 복도 보조 컨트롤을 사용하여 정전 상황을 역산할 수 있습니다.
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔮 [BLACKOUT_2] Encounter Result screen */}
      {roomId === "secret_passage" && blackout2Active && encounterResult && (
        <div className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-4 text-center select-text font-mono">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,24,14,0.12)_0%,rgba(0,0,0,0.98)_100%)] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl border border-zinc-800 bg-zinc-950/90 rounded-lg p-5 md:p-7 space-y-5 shadow-2xl relative animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-500">
              <span className="text-[9px] tracking-widest text-[#B8D44A] font-black uppercase">● ENCOUNTER_DATA_ANALYZED</span>
              <span className="text-[9px] font-mono tracking-widest">CRASH_REPORT_317</span>
            </div>

            {/* Result prose */}
            <div className="text-left space-y-3">
              <div className="text-[#A6C43A] font-black text-xs tracking-[0.2em] uppercase">
                ⚙️ [ 시뮬레이션 상태 변동 결과 ]
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">
                {encounterResult}
              </p>
            </div>

            {/* Sub Tactical Controls (Listen, Observe, Hide, Enter_Lab) */}
            <div className="border-t border-zinc-900 pt-3 space-y-2 text-left">
              <div className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">
                [ 전술 회로 조작 패밀리 / TACTICAL SPECIAL ACTIONS ]
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleEncounterSubAction("listen")}
                  className="px-2 py-2 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold rounded cursor-pointer transition-all active:scale-95"
                >
                  👂 천장 소리 청취
                </button>
                <button
                  type="button"
                  onClick={() => handleEncounterSubAction("observe")}
                  className="px-2 py-2 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold rounded cursor-pointer transition-all active:scale-95"
                >
                  👁 바닥 흔적 관찰
                </button>
                <button
                  type="button"
                  onClick={() => handleEncounterSubAction("hide")}
                  className="px-2 py-2 border border-orange-950 bg-orange-950/10 hover:bg-orange-950/25 text-orange-200 text-[10px] font-bold rounded cursor-pointer transition-all active:scale-95"
                >
                  📦 사물함 긴급 은신
                </button>
                <button
                  type="button"
                  onClick={() => handleEncounterSubAction("enter")}
                  style={{
                    borderColor: threatLevel <= 1 ? "rgba(184,212,74,0.4)" : "rgba(220,50,50,0.2)",
                    color: threatLevel <= 1 ? "#B8D44A" : "rgba(220,50,50,0.5)"
                  }}
                  className={`px-2 py-2 border text-[10px] font-extrabold rounded cursor-pointer transition-all active:scale-95 ${
                    threatLevel <= 1 ? "bg-[#B8D44A]/10 hover:bg-[#B8D44A]/20" : "bg-red-950/10 hover:bg-red-950/20"
                  }`}
                >
                  🚪 연구실 외부 진입
                </button>
              </div>
            </div>

            {/* Reset choices button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setEncounterResult(null)}
                className="px-4 py-2 bg-void hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-black tracking-wider uppercase rounded cursor-pointer transition-all active:scale-95"
              >
                ◀ 뒤로가서 다시 판단하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ms(n: number) { return new Promise<void>((r) => setTimeout(r, n)); }

/*
 * ════════════════════════════════════════════════════════════════
 *  App.tsx 연동 가이드
 * ════════════════════════════════════════════════════════════════
 *
 * [1] import 추가 (App.tsx 상단)
 *
 *   import BackroomsRoom from "./components/BackroomsRoom";
 *
 *
 * [2] SVG 뷰포트 렌더링 섹션에 추가
 *     (door SVG 닫는 태그 `</svg>` 다음, 약 line 984 이후)
 *
 *   {(state.currentRoomId === "secret_passage" || state.currentRoomId === "kim_study") && (
 *     <BackroomsRoom
 *       roomId={state.currentRoomId as "secret_passage" | "kim_study"}
 *       threatLevel={state.threatLevel ?? 0}
 *       blackout2Active={state.blackout2Active ?? false}
 *       solvedPuzzles={state.solvedPuzzles}
 *       inventory={state.inventory}
 *       onThreatChange={(level) =>
 *         setState(prev => ({ ...prev, threatLevel: level }))
 *       }
 *       onRoomChange={(roomId) =>
 *         setState(prev => ({ ...prev, currentRoomId: roomId }))
 *       }
 *       onPuzzleSolved={(puzzleId, reward) => {
 *         if (puzzleId === "__OPEN_SAFE__") {
 *           handlePointAndClickInteraction("safe_box");
 *         } else {
 *           handlePuzzleSolved(puzzleId, reward);
 *         }
 *       }}
 *       onAddLog={(msg, type) => addLog(msg, type ?? "system")}
 *     />
 *   )}
 *
 *
 * [3] currentRoomDesc switch에 추가 (useMemo 안)
 *
 *   case "secret_passage": return "지하 배관 우회 통로 — 생물 활동 감지";
 *   case "kim_study":      return "김정웅 교수 격리 구역 — 전하 잔류 경보";
 *
 *
 * [4] 하단 네비게이션 바에 secret_passage 복귀 버튼 (선택)
 *
 *   {state.currentRoomId === "secret_passage" && (
 *     <button onClick={() => setState(prev => ({ ...prev, currentRoomId: "overview" }))}>
 *       [ ← 전경으로 ]
 *     </button>
 *   )}
 *
 * ════════════════════════════════════════════════════════════════
 */
