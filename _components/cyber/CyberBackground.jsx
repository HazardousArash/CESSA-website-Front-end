"use client";

import React, { useEffect, useState, useContext } from 'react';
import { useSelector, ReactReduxContext } from 'react-redux';
import { Zap, ZapOff, Sun } from 'lucide-react';

const MATRIX_COLUMNS = [
  [ '0x7FFF8021: MOV RAX, [RBP-0x18]', 'CALL <cessa::core_dispatch>', 'XOR EAX, EAX ; STATUS_SUCCESS', 'TEST EAX, EAX -> JZ 0x004018C0', 'LEA RDI, [RSP+0x20] ; FRAME_PTR', '0x10AA3E01: CMP DWORD, 0', 'SHL RDX, 0x03 ; BUS_ALIGNED', 'SYSCALL: sys_epoll_wait()', 'MOVZX ECX, BYTE PTR [RAX+RCX]', 'PUSH RBP ; STACK_INIT', ],
  [ '[SYS_INIT] IRQ 0x2A :: BUS_LOCK', '[MEM_BANK] 0x00400000 -> 32GB DDR5', '[NET_SOCK] TLS 1.3 / TCP 5001 [OK]', '[CPU_CORE_0] Microcode rev 0xBA07', '[ALU_ACCEL] AVX-512 Pipeline [ON]', '[AUTH_HW] RSASSA-PSS / SHA256', '[CACHE_L3] Line 0x9B Flushed', '[IO_BRIDGE] PCIe Gen5 x16', '[V_CORE] 1.22V Regulated', '[INTERRUPT] APIC Timer Fired', ],
  [ 'section .text', 'global _start', '_start: xor rbp, rbp', 'pop rsi ; argc', 'mov rdx, rsp ; argv', 'and rsp, -16 ; align stack', 'call main ; invoke runtime', 'mov edi, eax ; exit code', 'mov eax, 60  ; sys_exit', 'syscall', ],
  [ '0x004010A0: 48 89 5C 24 08', '0x004010A5: 48 89 6C 24 10', '0x004010AA: 48 89 74 24 18', '0x004010AF: 57 48 83 EC 20', '0x004010B4: 48 8B F9 48 8B', '0x004010B9: E8 A2 02 00 00', '0x004010BE: 85 C0 74 12 48', '0x004010C3: 8B 4C 24 38 48', '0x004010C8: 33 CC E8 93 04', '0x004010CD: 48 83 C4 20 5F', ],
  [ '[HAL] DMA Controller Channel 3', '0x7FFE_0040: JMP QWORD [RAX+16]', 'MMU_PTE: 0x8000000000045067 [VALID]', 'TLB_FLUSH_ALL: Core Sync', 'INTR_MASK: 0x00000000 (Unmasked)', 'ACPI_POWER: S0 State Active', 'WATCHDOG_TIMER: Kicked @ 0x9F4', 'RING_0_PRIVILEGE: Confirmed', 'SCHED_YIELD: Quantum Granted', 'SYS_RETURN: iretq', ]
];

const ALARM_LOGS = ['🚨 [CRITICAL_FAULT] AUTHENTICATION_FAILED', '🚨 0xDEADBEEF: MEMORY_SEGMENTATION_FAULT', '🚨 [SECURITY_TRIP] ACCESS_DENIED_401', '🚨 KERNEL_PANIC: STACK_TRACE_DUMP', '🚨 SYSTEM_LOCKOUT_ENGAGED :: RETRYING', '🚨 VOLTAGE_SPIKE: HARDWARE THROTTLE APPLIED',];
const GUEST_LOGS = ['⚠️ [AWAITING_AUTH] NODE_LOCKED', '⚠️ HANDSHAKE_PENDING...', '⚠️ GUEST_SESSION_ACTIVE', '⚠️ ENCRYPTED_PAYLOAD_WITHHELD', '⚠️ LOGIN_REQUIRED_FOR_DECRYPTION', '⚠️ PORT_5001_STANDBY'];

const WIRE_PATHS = [
  { d: "M 0,80 L 260,80 L 380,200 L 640,200 L 760,55 L 885,55", dur: "9s", type: "green" },
  { d: "M 0,98 L 250,98 L 370,218 L 630,218 L 750,80 L 885,80", dur: "12s", type: "gold" },
  { d: "M 0,116 L 240,116 L 360,236 L 620,236 L 740,110 L 885,110", dur: "10s", type: "green" },
  { d: "M 1920,80 L 1660,80 L 1540,200 L 1280,200 L 1160,55 L 1035,55", dur: "11s", type: "gold" },
  { d: "M 1920,98 L 1670,98 L 1550,218 L 1290,218 L 1170,80 L 1035,80", dur: "8s", type: "green" },
  { d: "M 1920,116 L 1680,116 L 1560,236 L 1300,236 L 1180,110 L 1035,110", dur: "13s", type: "gold" },
  { d: "M 915,170 L 915,300 L 590,620 L 590,920 L 430,1080", dur: "14s", type: "green" },
  { d: "M 590,700 L 380,700 L 220,860 L 0,860", dur: "12s", type: "gold" },
  { d: "M 1005,170 L 1005,300 L 1330,620 L 1330,920 L 1490,1080", dur: "15s", type: "gold" },
  { d: "M 1330,700 L 1540,700 L 1700,860 L 1920,860", dur: "11s", type: "green" },
  { d: "M 0,300 L 200,300 L 350,450 L 590,450 L 700,560 L 915,560 L 915,170", dur: "16s", type: "gold" },
  { d: "M 1920,300 L 1720,300 L 1570,450 L 1330,450 L 1220,560 L 1005,560 L 1005,170", dur: "14s", type: "green" },
  { d: "M 0,500 L 200,500 L 300,600 L 590,600", dur: "10s", type: "green" },
  { d: "M 1920,500 L 1720,500 L 1620,600 L 1330,600", dur: "12s", type: "gold" },
  { d: "M 960,170 L 960,1080", dur: "9s", type: "green" }, 
  { d: "M 940,170 L 940,400 L 700,640 L 700,1080", dur: "13s", type: "gold" },
  { d: "M 980,170 L 980,400 L 1220,640 L 1220,1080", dur: "15s", type: "green" },
  { d: "M 590,920 L 1330,920", dur: "7s", type: "gold" },
  { d: "M 590,620 L 1330,620", dur: "8s", type: "green" },
  { d: "M 700,800 L 1220,800", dur: "6s", type: "green" }
];

function CyberBackgroundView({ isAlarm, isAuthenticated }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const isMobile = window.innerWidth < 768;
    const saved = localStorage.getItem("cessa_theme");

    if (saved) {
      setTheme(saved);
      if (saved === 'light') document.documentElement.classList.add('light-mode');
      else document.documentElement.classList.remove('light-mode');
    } else {
      const defaultTheme = isMobile ? 'dark' : 'heavy';
      setTheme(defaultTheme);
      localStorage.setItem("cessa_theme", defaultTheme);
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  useEffect(() => {
    if (theme !== 'heavy') return;
    const typer = setInterval(() => {
      setTypingIndex((prev) => (prev >= 10 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(typer);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      let next = 'dark';
      if (prev === 'heavy') next = 'dark';
      else if (prev === 'dark') next = 'light';
      else if (prev === 'light') next = 'heavy';

      localStorage.setItem("cessa_theme", next);
      
      if (next === 'light') {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
      return next;
    });
  };

  if (!mounted) return null;

  const ThemeToggleBtn = () => (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999]">
      <button 
        onClick={cycleTheme} 
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-dark-900/90 text-gray-300 hover:text-white border border-white/20 hover:border-cyber-teal transition-all shadow-2xl flex items-center justify-center cursor-pointer backdrop-blur-md no-invert active:scale-95" 
        title="تغییر تم: سنگین (گرافیکی) / تیره / روشن"
      >
        {theme === 'heavy' ? <Zap className="text-cyber-teal w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : 
         theme === 'light' ? <Sun className="text-amber-400 w-5 h-5 sm:w-6 sm:h-6" /> : 
         <ZapOff className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />}
      </button>
    </div>
  );

  const PlasmaBlobs = () => (
    <>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[850px] h-[300px] sm:h-[500px] rounded-full blur-[120px] sm:blur-[180px] transition-all duration-1000 pointer-events-none ${isAlarm ? 'bg-red-600/30' : (isAuthenticated ? 'bg-emerald-500/15' : 'bg-amber-500/15')}`} />
      <div className={`absolute -bottom-40 left-1/4 w-[300px] sm:w-[800px] h-[300px] sm:h-[600px] rounded-full blur-[140px] sm:blur-[200px] transition-all duration-1000 pointer-events-none ${isAlarm ? 'bg-red-700/20' : (isAuthenticated ? 'bg-emerald-950/20' : 'bg-amber-900/10')}`} />
    </>
  );

  const chipBase = isAlarm ? '#2A0609' : (isAuthenticated ? '#041A14' : '#041E24');
  const chipBorder = isAlarm ? '#EF4444' : (isAuthenticated ? '#10B981' : '#06B6D4');
  const coreBg = isAlarm ? '#150305' : (isAuthenticated ? '#02120D' : '#021317');
  const coreGlow = isAlarm ? '#F87171' : (isAuthenticated ? '#34D399' : '#22D3EE');
  const subTraceColor = isAlarm ? '#991B1B' : '#059669';
  const getSparkColor = (type) => isAlarm ? '#FFA5A5' : (type === 'gold' ? '#FDE047' : '#6EE7B7'); 
  let terminalColorClass = isAlarm ? "text-red-400 font-bold" : (!isAuthenticated ? "text-amber-400" : "text-emerald-400");

  return (
    <>
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000 select-none ${isAlarm ? 'bg-[#180507]' : 'bg-[#070A0B]'}`}>
        
        <style>{`
          @keyframes electricFlow {
            0% { stroke-dashoffset: 2400; }
            100% { stroke-dashoffset: 0; }
          }
          .wire-animated {
            stroke-dasharray: 60 1200;
            animation: electricFlow linear infinite;
          }
          .wire-alarm {
            animation-duration: 3s !important;
          }
        `}</style>

        {isAlarm && <div className="absolute inset-0 bg-red-600/20 mix-blend-color-dodge animate-pulse z-10" />}

        <PlasmaBlobs />

        {theme === 'heavy' && (
          <>
            <div className="absolute inset-0 bg-circuit-grid opacity-20" />

            <div className={`absolute inset-0 grid grid-cols-2 md:grid-cols-5 gap-6 p-6 pointer-events-none transition-all duration-500 filter blur-[1.2px] opacity-25 ${terminalColorClass}`}>
              {MATRIX_COLUMNS.map((col, colIdx) => (
                <div key={`col-${colIdx}`} className="font-mono text-xs sm:text-sm space-y-2 text-left dir-ltr">
                  <div className="text-xs opacity-60 border-b border-current pb-1 mb-2 font-bold tracking-widest">
                    {isAlarm ? 'FAULT_SECTOR_0' + colIdx : (isAuthenticated ? 'BUS_CH_0' + colIdx : 'GUEST_MEM_0' + colIdx)}
                  </div>
                  {(isAlarm ? ALARM_LOGS : (!isAuthenticated && colIdx % 2 !== 0 ? GUEST_LOGS : col)).slice(0, typingIndex + 1).map((line, lineIdx) => (
                    <div key={`line-${colIdx}-${lineIdx}`} className="truncate animate-pulse">
                      <span className="opacity-40 mr-1.5">&gt;</span>{line}
                    </div>
                  ))}
                  {typingIndex < 10 && <div className="animate-ping w-2 h-3 bg-current mt-1"></div>}
                </div>
              ))}
            </div>

            <svg className="absolute inset-0 w-full h-full filter blur-[1px]" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {WIRE_PATHS.map((wire, idx) => (
                <g key={`wire-${idx}`}>
                  <path d={wire.d} fill="none" stroke={subTraceColor} strokeWidth="1.5" opacity="0.3" strokeDasharray="8 4" />
                  <path d={wire.d} fill="none" stroke={getSparkColor(wire.type)} strokeWidth="2" className={`wire-animated ${isAlarm ? 'wire-alarm' : ''}`} style={{ animationDuration: wire.dur }} filter="url(#coreGlow)" />
                  <circle r={idx % 3 === 0 ? "3" : "4.5"} fill={getSparkColor(wire.type)} filter="url(#coreGlow)">
                    <animateMotion dur={isAlarm ? "3s" : wire.dur} repeatCount="indefinite" path={wire.d} />
                  </circle>
                </g>
              ))}

              <g transform="translate(885, 20)">
                <rect x="0" y="0" width="150" height="150" rx="16" fill={chipBase} stroke={chipBorder} strokeWidth="2.5" filter="url(#coreGlow)" className="transition-colors duration-1000" />
                <circle cx="15" cy="15" r="3" fill={coreBg} stroke={chipBorder} strokeWidth="1" className="transition-colors duration-1000" />
                <circle cx="135" cy="15" r="3" fill={coreBg} stroke={chipBorder} strokeWidth="1" className="transition-colors duration-1000" />
                <circle cx="15" cy="135" r="3" fill={coreBg} stroke={chipBorder} strokeWidth="1" className="transition-colors duration-1000" />
                <circle cx="135" cy="135" r="3" fill={coreBg} stroke={chipBorder} strokeWidth="1" className="transition-colors duration-1000" />
                <rect x="18" y="18" width="114" height="114" rx="12" fill="none" stroke={subTraceColor} strokeWidth="1" strokeDasharray="4 2" className="transition-colors duration-1000" />

                {[20, 45, 75, 105, 130].map((xPin, i) => (
                  <React.Fragment key={`pin-tb-${i}`}>
                    <line x1={xPin} y1="-10" x2={xPin} y2="0" stroke={chipBorder} strokeWidth="2" />
                    <line x1={xPin} y1="150" x2={xPin} y2="160" stroke={chipBorder} strokeWidth="2" />
                  </React.Fragment>
                ))}
                {[35, 60, 90, 115].map((yPin, i) => (
                  <React.Fragment key={`pin-lr-${i}`}>
                    <line x1="-10" y1={yPin} x2="0" y2={yPin} stroke={chipBorder} strokeWidth="2" />
                    <line x1="150" y1={yPin} x2="160" y2={yPin} stroke={chipBorder} strokeWidth="2" />
                  </React.Fragment>
                ))}

                <path d="M 25,75 L 35,75" fill="none" stroke={subTraceColor} strokeWidth="1.5" />
                <path d="M 125,75 L 115,75" fill="none" stroke={subTraceColor} strokeWidth="1.5" />
                <path d="M 75,25 L 75,35" fill="none" stroke={subTraceColor} strokeWidth="1.5" />
                <path d="M 75,125 L 75,115" fill="none" stroke={subTraceColor} strokeWidth="1.5" />
                <rect x="35" y="35" width="80" height="80" rx="8" fill={coreBg} stroke={chipBorder} strokeWidth="1.5" className="transition-colors duration-1000" />

                <polygon points="75,60 88,67.5 88,82.5 75,90 62,82.5 62,67.5" fill={coreBg} stroke={coreGlow} strokeWidth="1.5" className="transition-colors duration-1000" />
                <circle cx="75" cy="75" r="4" fill={coreGlow} filter="url(#coreGlow)" className={`transition-colors duration-1000 ${isAlarm || !isAuthenticated ? 'animate-pulse' : ''}`} />

                <text x="75" y="52" fill={coreGlow} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="3" className="transition-colors duration-1000">
                  {isAuthenticated ? 'CESSA' : 'LOCKED'}
                </text>
                <text x="75" y="106" fill={chipBorder} fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5" className="transition-colors duration-1000">
                  {isAuthenticated ? 'SYS.CORE.v5' : 'AUTH_REQ'}
                </text>
              </g>
            </svg>
          </>
        )}
      </div>

      <ThemeToggleBtn />
    </>
  );
}

function CyberBackgroundConnected() {
  const isAlarm = useSelector((state) => state.auth?.isAlarm);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  return <CyberBackgroundView isAlarm={isAlarm} isAuthenticated={isAuthenticated} />;
}

export default function CyberBackground() {
  const reduxContext = useContext(ReactReduxContext);
  if (!reduxContext || !reduxContext.store) {
    return <CyberBackgroundView isAlarm={false} isAuthenticated={false} />;
  }
  return <CyberBackgroundConnected />;
}
