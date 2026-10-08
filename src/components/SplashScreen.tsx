import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const BOOT_LINES = [
  'Initializing GP Bikes Workflow Engine...',
  'Loading distributor network...',
  'Syncing inventory modules...',
  'Connecting tracking subsystem...',
  'Establishing secure data layer...',
  'All systems nominal. Ready.',
];

export default function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'logo' | 'boot' | 'fade'>('logo');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);

  // Phase 1: Logo animates in
  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 100);
    const t2 = setTimeout(() => setLogoPulse(true), 900);
    const t3 = setTimeout(() => setPhase('boot'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Phase 2: Boot lines appear
  useEffect(() => {
    if (phase !== 'boot') return;
    let line = 0;
    const interval = setInterval(() => {
      line++;
      setVisibleLines(line);
      setProgress(Math.round((line / BOOT_LINES.length) * 100));
      if (line >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('fade'), 600);
      }
    }, 320);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 3: Fade out → complete
  useEffect(() => {
    if (phase !== 'fade') return;
    const t = setTimeout(onComplete, 700);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 splash-grid opacity-20" />
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent splash-scanline" />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-10 h-10 border-l-2 border-t-2 border-red-600 opacity-60" />
      <div className="absolute top-8 right-8 w-10 h-10 border-r-2 border-t-2 border-red-600 opacity-60" />
      <div className="absolute bottom-8 left-8 w-10 h-10 border-l-2 border-b-2 border-red-600 opacity-60" />
      <div className="absolute bottom-8 right-8 w-10 h-10 border-r-2 border-b-2 border-red-600 opacity-60" />

      {/* System ID top */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-xs text-red-600/60 tracking-[0.3em] uppercase">
        SYS.ID: GPB-WM-001
      </div>

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ${
          logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        } ${logoPulse ? 'splash-logo-glow' : ''}`}
      >
        {/* Outer rotating ring */}
        <div className="absolute inset-0 -m-6 rounded-full border border-red-700/30 splash-rotate-slow" />
        <div className="absolute inset-0 -m-10 rounded-full border border-red-600/15 splash-rotate-reverse" />

        {/* Hex border accent */}
        <div className="absolute -inset-3 border border-red-500/20 rounded-sm rotate-45" />

        {/* The logo image */}
        <img
          src="/gpbikes-logo.svg"
          alt="GP Bikes Inc."
          className="w-44 h-44 relative z-10 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]"
        />

        {/* Data readout dots */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                logoVisible ? 'bg-red-500' : 'bg-gray-700'
              }`}
              style={{ transitionDelay: `${i * 120 + 600}ms`, opacity: logoVisible ? 1 : 0 }}
            />
          ))}
        </div>
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                logoVisible ? 'bg-red-500' : 'bg-gray-700'
              }`}
              style={{ transitionDelay: `${i * 120 + 600}ms`, opacity: logoVisible ? 1 : 0 }}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div
        className={`mt-10 text-center transition-all duration-700 delay-500 ${
          logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl font-black text-white tracking-[0.15em] uppercase">
          GP <span className="text-red-500">BIKES</span> INC.
        </h1>
        <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mt-1 font-mono">
          Distribution Workflow Manager
        </p>
      </div>

      {/* Boot console — only shown during boot phase */}
      <div
        className={`mt-10 w-[420px] transition-all duration-500 ${
          phase === 'boot' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="w-full h-0.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Console lines */}
        <div className="bg-black/40 border border-gray-800/60 rounded-lg p-4 font-mono text-xs space-y-1 h-[148px] overflow-hidden">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-400">
              <span className="text-red-600 shrink-0">›</span>
              <span className={i === visibleLines - 1 && visibleLines < BOOT_LINES.length ? 'splash-cursor' : ''}>
                {line}
              </span>
              {i === visibleLines - 1 && (
                <span className={`ml-auto text-green-500 transition-opacity duration-300 ${
                  i === BOOT_LINES.length - 1 ? 'opacity-100' : 'opacity-0'
                }`}>OK</span>
              )}
            </div>
          ))}
          {visibleLines < BOOT_LINES.length && visibleLines > 0 && (
            <span className="inline-block w-1.5 h-3.5 bg-red-500 splash-blink align-middle" />
          )}
        </div>

        {/* Progress percentage */}
        <div className="flex justify-between items-center mt-2">
          <span className="font-mono text-[10px] text-gray-600 tracking-widest">LOADING MODULES</span>
          <span className="font-mono text-[10px] text-red-600">{progress}%</span>
        </div>
      </div>

      {/* Bottom data strip */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 font-mono text-[10px] text-gray-700 tracking-widest uppercase">
        <span>VER 1.0.0</span>
        <span className="w-1 h-1 rounded-full bg-gray-700" />
        <span>SECURE MODE</span>
        <span className="w-1 h-1 rounded-full bg-gray-700" />
        <span className="text-red-800">● LIVE</span>
      </div>
    </div>
  );
}
