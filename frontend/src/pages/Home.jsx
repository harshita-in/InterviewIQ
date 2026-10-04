import React from 'react';
import { 
  Sparkles, Bot, Mic, FileText, CheckCircle2, TrendingUp, 
  ArrowRight, ShieldCheck, Zap, Award, Layers, Video
} from 'lucide-react';

export default function Home({ onStartPractice, onOpenAdmin, onOpenDashboard }) {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Interview Simulation & Performance Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master Your Interviews with <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            AI-Powered Mock Sessions
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          <strong>InterviewIQ</strong> simulates real-time HR and technical interviews tailored directly to your resume. Receive instant AI-driven scoring on technical accuracy, speech fluency, and communication confidence.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartPractice}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Practice Interview</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-750 hover:border-slate-650 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>View Progress & History</span>
          </button>
        </div>

        {/* Quick badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resume-Based Dynamic Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Voice & Text Answer Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Speech NLP & Filler Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Detailed Scorecards & Metrics</span>
          </div>
        </div>
      </section>

      {/* Feature Grid (Slide 2 & 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Key Architecture & Features
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Engineered with modern AI, Speech Recognition, and Natural Language Processing to elevate candidate placement readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resume Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your PDF resume to parse tech stacks, experience levels, and past projects. The AI crafts customized technical questions specifically targeting your profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Voice & Speech NLP</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Answer questions verbally using real-time speech-to-text. The engine evaluates cadence, words-per-minute (WPM), hesitation, and detects subconscious filler words.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Detailed Reports</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive comprehensive scorecards with category breakdowns: Technical Accuracy, Communication Clarity, and Confidence metrics alongside model gold-standard answers.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional vs AI-Powered (Slide 4) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Comparative Advantage</span>
            <h3 className="text-2xl font-bold text-white mt-1">Traditional Approach vs. AI-Powered Approach</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Traditional Interview Preparation</th>
                  <th className="py-3 px-4 font-semibold text-emerald-400">AI-Powered (InterviewIQ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 text-slate-400">Manual practice with limited or delayed feedback</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">Real-time instant AI feedback & performance analysis</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">Subjective & dependent on mentor availability</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">Objective automated evaluation using NLP & ML models</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">Generic static questions from common question lists</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">Tailored questions generated based on candidate's resume</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">No measurable tracking of long-term progress</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">Tracks historic scores, strengths, and improvement areas</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">Time-consuming, expensive, and stressful</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">Fast, interactive, and available 24/7 on demand</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recruiter / Admin Teaser (Slide 7) */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="border border-indigo-500/20 bg-indigo-950/20 rounded-3xl p-8 sm:p-10">
          <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Interviewer & Admin Control Dashboard
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            Review cohort progress, inspect candidate interview recordings and transcripts, analyze college batch placement readiness, and export performance reports.
          </p>
          <button
            onClick={onOpenAdmin}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/20"
          >
            Open Admin & Recruiter View
          </button>
        </div>
      </section>
    </div>
  );
}
