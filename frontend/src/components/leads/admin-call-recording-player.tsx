"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, MessageSquare, Award } from "lucide-react";
import { CallLog } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface AdminCallRecordingPlayerProps {
  callLog: CallLog;
  leadName: string;
}

export function AdminCallRecordingPlayer({ callLog, leadName }: AdminCallRecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const totalSeconds = callLog.duration_seconds || 180;
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalSeconds]);

  const togglePlay = () => {
    if (currentTime >= totalSeconds) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // 32 pseudo-random waveform bars
  const waveformHeights = [
    25, 45, 75, 60, 90, 80, 40, 55, 85, 95, 70, 45, 60, 80, 100, 75,
    60, 40, 70, 85, 90, 65, 50, 80, 95, 60, 45, 70, 50, 35, 60, 40
  ];

  const progressPercent = (currentTime / totalSeconds) * 100;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Call Recording & Quality Audit</span>
              {callLog.is_first_call && (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  First Follow-Up Call
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Agent: <strong className="text-slate-200">{callLog.agent_name}</strong> • Customer: <strong className="text-slate-200">{leadName}</strong> • {new Date(callLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Super Admin Superpower</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Waveform Visualizer */}
      <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2.5">
        <div className="h-12 flex items-center gap-1 px-1 overflow-hidden">
          {waveformHeights.map((h, i) => {
            const barProgress = (i / waveformHeights.length) * 100;
            const isPassed = barProgress <= progressPercent;
            const isCurrent = isPlaying && Math.abs(barProgress - progressPercent) < 4;
            return (
              <div
                key={i}
                style={{
                  height: isPlaying ? `${Math.min(100, Math.max(20, h * (0.8 + Math.sin(currentTime * 3 + i) * 0.3)))}%` : `${h}%`,
                }}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed 
                    ? isCurrent 
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                      : "bg-indigo-400" 
                    : "bg-slate-700/60"
                }`}
              />
            );
          })}
        </div>

        {/* Scrub slider & Timers */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            value={currentTime}
            onChange={handleScrub}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500">Audio Simulation • Tathastu Secured Vault</span>
            <span>{formatTime(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={togglePlay}
            className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-2 ${
              isPlaying 
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? "Pause" : "Play Recording"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {/* Playback speed selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-[11px]">
            {([1, 1.25, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded font-semibold transition-all ${
                  playbackSpeed === spd
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Transcript */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowTranscript(!showTranscript)}
          className="h-8 border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          {showTranscript ? "Hide Transcript" : "View Transcript"}
        </Button>
      </div>

      {/* Transcript Collapsible */}
      {showTranscript && (
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Phone Speech-to-Text Transcript
            </span>
            <span>Confidence: 98.4%</span>
          </div>
          <div className="space-y-2 leading-relaxed font-sans text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-indigo-400 mr-1.5">{callLog.agent_name} (Caller):</span>
              <span className="text-slate-200">
                &quot;Namaskar {leadName} ji, I am {callLog.agent_name} calling from Tathastu Infra Sales Team. I noticed your recent inquiry regarding our Tathastu Residency project. Am I speaking with {leadName}?&quot;
              </span>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
              <span className="font-bold text-emerald-400 mr-1.5">{leadName} (Customer):</span>
              <span className="text-slate-300">
                &quot;Yes, speaking. I was looking for a 3 BHK unit with east entrance, around ₹65-70 Lakhs budget. My home loan is already sanctioned by SBI.&quot;
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-indigo-400 mr-1.5">{callLog.agent_name} (Caller):</span>
              <span className="text-slate-200">
                &quot;Wonderful! We have Tower B Unit 402 with 1,180 sq.ft carpet area ready to move. I am sending the floor plan on your WhatsApp now, and we can arrange a complimentary VIP site visit.&quot;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Caller Quality Score Breakdown */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Pitch Quality</p>
          <p className="text-base font-extrabold text-emerald-400">{callLog.quality_score || 94}/100</p>
          <span className="text-[10px] text-slate-400">Top Tier</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Script Adherence</p>
          <p className="text-base font-extrabold text-indigo-400">92%</p>
          <span className="text-[10px] text-slate-400">Tathastu Standard</span>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400">Customer Sentiment</p>
          <p className="text-base font-extrabold text-teal-400">{callLog.sentiment || "Positive"}</p>
          <span className="text-[10px] text-slate-400">High Conversion</span>
        </div>
      </div>

    </div>
  );
}
