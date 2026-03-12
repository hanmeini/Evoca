"use client";

import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Check, Lock, BookOpen, Headphones, Target, X } from "lucide-react";

export type MissionState = "DONE" | "ACTIVE" | "LOCKED";
export type MissionType = "MATERI" | "PODCAST" | "QUIZ";

export interface Mission {
  id: string;
  title: string;
  type: MissionType;
  state: MissionState;
}

// Sample Data Array
const dummyMissions: Mission[] = [
  { id: "1", title: "Materi Pengantar", type: "MATERI", state: "DONE" },
  { id: "2", title: "Podcast Sesi 1", type: "PODCAST", state: "DONE" },
  { id: "3", title: "Kuis Dasar", type: "QUIZ", state: "ACTIVE" },
  { id: "4", title: "Materi Lanjutan", type: "MATERI", state: "LOCKED" },
  { id: "5", title: "Podcast Sesi 2", type: "PODCAST", state: "LOCKED" },
];

export function EvocaLearningPath({ missions = dummyMissions }: { missions?: Mission[] }) {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  const handleNodeClick = (mission: Mission) => {
    if (mission.state === "DONE" || mission.state === "ACTIVE") {
      setActiveMission(mission);
    }
  };

  const getMissionIcon = (type: MissionType, state: MissionState) => {
    if (state === "DONE") return <Check className="w-6 h-6 text-white" />;
    if (state === "LOCKED") return <Lock className="w-6 h-6 text-stone-400" />;
    
    switch (type) {
      case "MATERI": return <BookOpen className="w-6 h-6 text-white" />;
      case "PODCAST": return <Headphones className="w-6 h-6 text-white" />;
      case "QUIZ": return <Target className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto py-20 flex flex-col items-center">
      
      {/* 
        The thick gray line connecting all nodes. 
        It sits behind everything (z-[-1]) and spans vertically.
      */}
      <div className="absolute top-20 bottom-20 w-3 bg-gray-200 z-[-1] rounded-full" />

      {/* Map through missions to render nodes */}
      <div className="flex flex-col items-center space-y-16 w-full px-8">
        {missions.map((mission, index) => {
          // Odd indexes translate left, Even indexes translate right to create a Zig-Zag effect
          const isEven = index % 2 === 0;
          const translateClass = isEven ? "translate-x-12" : "-translate-x-12";

          const isDone = mission.state === "DONE";
          const isActive = mission.state === "ACTIVE";
          const isLocked = mission.state === "LOCKED";

          const nodeClasses = cn(
            "relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-[6px] transition-all duration-300",
            // 3 States styling:
            isDone && "bg-amber-400 border-white hover:scale-105 cursor-pointer", // Yellow/gold
            isActive && "bg-gradient-to-r from-purple-600 to-blue-500 border-white hover:scale-105 cursor-pointer", // Evoca Primary
            isLocked && "bg-gray-300 border-gray-100 cursor-not-allowed opacity-80", // Light gray
            translateClass
          );

          return (
            <div key={mission.id} className="relative flex flex-col items-center group">
              
              {/* MULAI Tooltip for Active Mission */}
              {isActive && (
                <div className={cn(
                  "absolute -top-12 bg-purple-600 text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest animate-bounce z-10 shadow-lg",
                  translateClass
                )}>
                  MULAI
                  {/* Triangle Pointer */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-600 rotate-45" />
                </div>
              )}

              {/* The Node Button */}
              <button
                onClick={() => handleNodeClick(mission)}
                disabled={isLocked}
                className={nodeClasses}
                aria-label={`Mission: ${mission.title}`}
              >
                {getMissionIcon(mission.type, mission.state)}
                
                {/* Ping animation effect behind active node */}
                {isActive && (
                  <span className="absolute w-full h-full rounded-full border-4 border-purple-400 opacity-20 animate-ping -z-10" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal / Dialog Overlay */}
      {activeMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                {activeMission.title}
              </h3>
              <button 
                onClick={() => setActiveMission(null)}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-6 py-12 text-center text-gray-600">
              <p className="font-medium text-lg">
                Content for <strong>{activeMission.title}</strong> goes here.
              </p>
              <p className="text-sm mt-2">
                Type: {activeMission.type}
              </p>
            </div>
            
            {/* Modal Footer / Action */}
            <div className="p-6 pt-0">
              <button 
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                onClick={() => setActiveMission(null)}
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
