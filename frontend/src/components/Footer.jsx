import React from 'react';
import { Brain, Award, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-850 bg-slate-950 py-10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold mb-2 text-sm">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>InterviewIQ Platform</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-Powered Mock Interview & Performance Analyzer designed to help candidates prepare for technical and HR interviews with real-time speech NLP feedback.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold mb-2 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Core Modules</span>
            </div>
            <ul className="space-y-1 text-slate-400">
              <li>• Resume Parsing & Skill Extraction</li>
              <li>• Real-Time Speech & Cadence NLP</li>
              <li>• Multi-Turn Question Engine</li>
              <li>• Cohort Readiness Dashboard</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold mb-2 text-sm">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Placement Readiness</span>
            </div>
            <p className="text-slate-300 font-medium text-xs leading-relaxed">
              Designed to help students build interview composure, technical depth, and communication confidence for campus placements.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-850 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 InterviewIQ. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-slate-400">
            Powered by FastAPI, React, NLP & LLM Evaluation
          </p>
        </div>
      </div>
    </footer>
  );
}
