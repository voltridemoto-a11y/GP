import { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

const PIN = '1234';

export default function VaultPin({ onUnlock }: { onUnlock: () => void }) {
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    setError(false);
    const next = (entered + digit).slice(0, 4);
    setEntered(next);
    if (next.length === 4) {
      if (next === PIN) {
        setTimeout(onUnlock, 150);
      } else {
        setError(true);
        setTimeout(() => setEntered(''), 500);
      }
    }
  };

  const backspace = () => { setError(false); setEntered(e => e.slice(0, -1)); };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center mb-5">
        <Lock size={24} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Company Vault</h2>
      <p className="text-gray-500 text-sm mb-6">Enter PIN to access credentials</p>

      {/* PIN dots */}
      <div className={`flex gap-3 mb-7 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
            i < entered.length
              ? error ? 'bg-red-500 border-red-500' : 'bg-red-500 border-red-500'
              : 'border-gray-600'
          }`} />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button
            key={d}
            onClick={() => press(d)}
            className="w-16 h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white text-xl font-semibold transition-colors active:scale-95"
          >
            {d}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')} className="w-16 h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white text-xl font-semibold transition-colors active:scale-95">0</button>
        <button onClick={backspace} className="w-16 h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 flex items-center justify-center transition-colors active:scale-95">
          <Delete size={20} />
        </button>
      </div>

      <p className="text-gray-700 text-xs mt-6 font-mono">Demo PIN: 1234</p>
    </div>
  );
}
