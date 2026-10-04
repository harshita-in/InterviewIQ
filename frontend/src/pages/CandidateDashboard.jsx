import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Award, Clock, ArrowRight, Sparkles, 
  Calendar, CheckCircle2, AlertCircle, FileText 
} from 'lucide-react';
import { api } from '../utils/api';

export default function CandidateDashboard({ onOpenReport, onNewInterview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getHistory();
        setHistory(data);
      } catch (err) {
        console.warn("Could not fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const completedSessions = history.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.overall_score, 0) / completedSessions.length) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Candidate Performance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track interview practice progression, metrics, and placement readiness over time.
          </p>
        </div>

        <button
          onClick={onNewInterview}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* Top 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Readiness Score</span>
          <div className="mt-2 text-4xl font-extrabold font-mono text-emerald-400">
            {avgScore}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Based on completed rounds</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Interviews Completed</span>
          <div className="mt-2 text-4xl font-extrabold font-mono text-teal-300">
            {completedSessions.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{history.length} total sessions initiated</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Placement Status</span>
          <div className="mt-2 text-2xl font-bold">
            {avgScore >= 75 ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Placement Ready
              </span>
            ) : avgScore >= 50 ? (
              <span className="text-teal-300 flex items-center gap-1.5">
                <Award className="w-5 h-5" /> In Progress
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" /> Needs Practice
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Recommendation engine active</span>
        </div>
      </div>

      {/* Sessions History Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Interview History & Scorecards
          </h2>
          <span className="text-xs text-slate-500">{history.length} sessions recorded</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading sessions...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-3">
            <p>No interviews completed yet.</p>
            <button
              onClick={onNewInterview}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg"
            >
              Take Your First Mock Interview
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3 font-semibold">Target Job Role</th>
                  <th className="py-3 px-3 font-semibold">Round Type</th>
                  <th className="py-3 px-3 font-semibold">Difficulty</th>
                  <th className="py-3 px-3 font-semibold">Overall Score</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((s) => (
                  <tr key={s.session_id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{s.role_title}</td>
                    <td className="py-3 px-3 text-slate-400">{s.round_type}</td>
                    <td className="py-3 px-3 text-slate-400">{s.difficulty}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {s.status === 'completed' ? (
                        <span className={s.overall_score >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
                          {s.overall_score}%
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {s.status === 'completed' && (
                        <button
                          onClick={() => onOpenReport(s.session_id)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
