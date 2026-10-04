import React, { useEffect } from 'react';
import { 
  Award, CheckCircle2, AlertTriangle, ArrowLeft, 
  Printer, TrendingUp, Sparkles, ChevronDown, ChevronUp, Bot, FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReportDetails({ reportData, onBackToDashboard, onNewInterview }) {
  useEffect(() => {
    // Trigger celebration if high score
    if (reportData?.overall_score >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [reportData]);

  if (!reportData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-slate-400">No report data found.</p>
        <button onClick={onBackToDashboard} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-200">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-teal-300 border-teal-500/30 bg-teal-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const getReadinessBadge = (score) => {
    if (score >= 75) {
      return (
        <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Placement Ready
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5" />
        Needs Practice / Refining
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-emerald-400" />
            Interview Performance Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role: <strong className="text-slate-200">{reportData.role_title}</strong> • Round: <strong className="text-slate-200">{reportData.round_type}</strong> • Level: <strong className="text-slate-200">{reportData.difficulty}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onNewInterview}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Primary Scorecard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-center flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Overall Score</span>
            <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent font-mono my-2">
              {reportData.overall_score}%
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            {getReadinessBadge(reportData.overall_score)}
          </div>
        </div>

        {/* 3 Metric Breakdown Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Accuracy</span>
            <div className="my-2 text-3xl font-bold font-mono text-emerald-400">
              {reportData.technical_score}%
            </div>
            <p className="text-[11px] text-slate-500">Core CS, algorithmic depth & concept coverage</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Communication & Clarity</span>
            <div className="my-2 text-3xl font-bold font-mono text-teal-300">
              {reportData.communication_score}%
            </div>
            <p className="text-[11px] text-slate-500">Sentence structure, articulation & precision</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confidence & Fluency</span>
            <div className="my-2 text-3xl font-bold font-mono text-cyan-300">
              {reportData.confidence_score}%
            </div>
            <p className="text-[11px] text-slate-500">Speech cadence, filler words & composure</p>
          </div>
        </div>
      </div>

      {/* Summary Evaluation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          Executive AI Evaluation Summary
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {reportData.summary_feedback}
        </p>
      </div>

      {/* Strengths & Weaknesses Grid (Slide 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Key Candidate Strengths
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {reportData.strengths && reportData.strengths.length > 0 ? (
              reportData.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No specific strengths captured.</li>
            )}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {reportData.weaknesses && reportData.weaknesses.length > 0 ? (
              reportData.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">None identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Recommendations Roadmap */}
      {reportData.recommendations && reportData.recommendations.length > 0 && (
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Actionable Improvement Roadmap
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            {reportData.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Question Breakdown & Speech Analytics
        </h3>

        <div className="space-y-4">
          {reportData.questions_breakdown && reportData.questions_breakdown.map((q, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                    {q.question_index}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {q.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Tech: <strong className="text-emerald-400">{q.technical_score}%</strong></span>
                  <span className="text-slate-400">Comm: <strong className="text-teal-300">{q.communication_score}%</strong></span>
                  <span className="text-slate-400">Conf: <strong className="text-cyan-300">{q.confidence_score}%</strong></span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-white leading-relaxed">
                  {q.question_text}
                </p>
              </div>

              {/* Candidate Answer */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Candidate Answer
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {q.user_answer || "(No response recorded)"}
                </p>
              </div>

              {/* Speech NLP Metrics */}
              {q.speech_metrics && Object.keys(q.speech_metrics).length > 0 && (
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Words Per Min:</span>
                    <span className="text-slate-200 font-bold font-mono">{q.speech_metrics.wpm || 'N/A'} WPM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Filler Words:</span>
                    <span className={`font-bold font-mono ${q.speech_metrics.filler_count > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {q.speech_metrics.filler_count || 0} ({q.speech_metrics.filler_ratio || 0}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Sentiment / Demeanor:</span>
                    <span className="text-slate-200 font-semibold">{q.speech_metrics.sentiment || 'Confident'}</span>
                  </div>
                </div>
              )}

              {/* Examiner Feedback */}
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Examiner Feedback
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {q.feedback}
                </p>
              </div>

              {/* Model Gold Standard Answer */}
              {q.ideal_answer && (
                <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-3 text-xs">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                    Model Benchmark Answer
                  </span>
                  <p className="text-emerald-200/90 leading-relaxed">
                    {q.ideal_answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
