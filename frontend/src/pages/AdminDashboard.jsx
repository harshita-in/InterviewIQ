import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, BarChart3, TrendingUp, CheckCircle2, 
  AlertCircle, Search, ArrowRight, Award, GraduationCap 
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ onOpenReport }) {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, candidatesData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminCandidates()
        ]);
        setStats(statsData);
        setCandidates(candidatesData);
      } catch (err) {
        console.warn("Could not load admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.roll_number && c.roll_number.toLowerCase().includes(search.toLowerCase())) ||
    c.target_role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
              Faculty & Recruiter Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            Interviewer & Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate Assessment & Placement Readiness Cohort Analytics
          </p>
        </div>
      </div>

      {/* Cohort Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Candidates</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-white">
            {stats?.total_candidates || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Registered in batch</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Completed Sessions</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-400">
            {stats?.completed_interviews || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">AI-evaluated interviews</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Batch Avg. Score</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-indigo-400">
            {stats?.averages?.overall || 0}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tech: {stats?.averages?.technical || 0}% | Comm: {stats?.averages?.communication || 0}%</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Placement Ready</span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-teal-300">
            {stats?.readiness_distribution?.placement_ready || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Score ≥ 75% benchmark</span>
        </div>
      </div>

      {/* Candidate Roster & Evaluation Records */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Candidate Batch Records & Readiness
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AIML Student cohort with individual evaluation metrics.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, roll no, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading candidates...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No candidates match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3 font-semibold">Candidate Name</th>
                  <th className="py-3 px-3 font-semibold">University Roll No</th>
                  <th className="py-3 px-3 font-semibold">Branch / College</th>
                  <th className="py-3 px-3 font-semibold">Target Role</th>
                  <th className="py-3 px-3 font-semibold">Interviews Taken</th>
                  <th className="py-3 px-3 font-semibold">Latest Score</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{c.roll_number}</td>
                    <td className="py-3 px-3 text-slate-400">{c.branch}</td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{c.target_role}</td>
                    <td className="py-3 px-3 font-mono text-center sm:text-left">{c.interviews_count}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {c.latest_score > 0 ? (
                        <span className={c.latest_score >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
                          {c.latest_score}%
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'Placement Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'Developing'
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
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
