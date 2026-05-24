import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [speed, setSpeed] = useState(1);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-slate-400">Control de Referencia</p>
          <span className="bg-indigo-500 px-2 py-1 rounded text-xs">{speed}x</span>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <button onClick={() => audioRef.current.play()} className="hover:text-indigo-400">
            <Play fill="currentColor" size={32} />
          </button>
          <button onClick={() => audioRef.current.pause()} className="hover:text-indigo-400">
            <Pause fill="currentColor" size={32} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          {[0.5, 0.75, 1.0].map((val) => (
            <button 
              key={val}
              onClick={() => handleSpeedChange(val)}
              className={`text-xs py-2 rounded ${speed === val ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;