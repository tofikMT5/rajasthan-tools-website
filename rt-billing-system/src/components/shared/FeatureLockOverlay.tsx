"use client";
import React from "react";
import { Lock } from "lucide-react";

export function FeatureLockOverlay({ isLocked, children }: { isLocked: boolean, children: React.ReactNode }) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Underlying content - slightly blurred and disabled pointer events */}
      <div className="opacity-40 pointer-events-none select-none filter blur-[2px] transition-all duration-300">
        {children}
      </div>
      
      {/* Lock Overlay Content Centered */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
        <div className="bg-slate-900/95 border border-slate-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 flex items-center justify-center rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Feature Locked</h2>
          <p className="text-slate-400 text-sm mb-6">
            This module is currently disabled. You can view the layout, but actions are restricted.
            <br/><br/>
            Contact the Super Admin to unlock this premium feature.
          </p>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
