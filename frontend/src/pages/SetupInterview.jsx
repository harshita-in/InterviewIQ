import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FileUp, Sparkles, Check, ChevronRight, 
  Layers, Sliders, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { api } from '../utils/api';

const ROLES = [
  "Software Development Engineer",
  "Machine Learning Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Scientist"
];

const ROUNDS = [
  { id: "Technical", label: "Technical Round", desc: "Core CS, Algorithms, System Design & Architecture" },
  { id: "HR", label: "HR & Behavioral", desc: "Culture fit, STAR scenario, teamwork & aspirations" },
  { id: "Mix", label: "Comprehensive (Tech + HR)", desc: "Combined rounds simulating campus placement finals" }
];

const DIFFICULTIES = ["Fresher", "Mid-Level", "Senior"];

export default function SetupInterview({ onInterviewStarted }) {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [selectedRound, setSelectedRound] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Fresher");
  const [questionCount, setQuestionCount] = useState(5);
  const [useResume, setUseResume] = useState(true);

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedResume, setParsedResume] = useState(null);
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Start interview loader
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user already has a resume on file
    async function loadResume() {
      try {
        const res = await api.getLatestResume();
        if (res) {
          setParsedResume(res);
        }
      } catch (e) {
        console.warn("Could not fetch latest resume", e);
      }
    }
    loadResume();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeFile(file);
    setIsUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await api.uploadResume(formData);
      setParsedResume(data);
    } catch (err) {
      setErrorMsg("Failed to parse resume: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setIsUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("raw_text", manualText);

    try {
      const data = await api.uploadResume(formData);
      setParsedResume(data);
      setShowManualInput(false);
    } catch (err) {
      setErrorMsg("Failed to parse resume text: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    setErrorMsg("");

    const targetRole = customRole.trim() ? customRole.trim() : selectedRole;

    try {
      const sessionData = await api.startInterview({
        role_title: targetRole,
        round_type: selectedRound,
        difficulty: difficulty,
        total_questions: questionCount,
        use_resume_context: useResume && !!parsedResume
      });

      onInterviewStarted(sessionData);
    } catch (err) {
      setErrorMsg("Error generating interview session: " + err.message);
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select target job profile, interview parameters, and attach your resume for tailored question generation.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1: Resume Upload / Parsing */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-white">Resume Context (Optional but Recommended)</h2>
            </div>
            {parsedResume && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resume Attached
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Our AI will parse your technical skills and past projects to generate targeted questions reflecting your actual background.
          </p>

          {!parsedResume ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-750 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-200">
                  {isUploading ? "Extracting skills from resume..." : "Click to upload Resume (PDF / TXT)"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports standard ATS PDF formats</p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  {showManualInput ? "Hide text paste" : "Or paste your resume text / skills manually"}
                </button>
              </div>

              {showManualInput && (
                <div className="space-y-2 mt-2">
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste your skills, projects, and summary here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    disabled={isUploading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg"
                  >
                    Parse Pasted Text
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">
                  📄 {parsedResume.filename}
                </span>
                <label className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                  Replace Resume
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Extracted Technical Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResume.skills && parsedResume.skills.length > 0 ? (
                    parsedResume.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">General Technical Stack detected</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Role & Round Selection */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-white">Target Job Role & Interview Format</h2>
          </div>

          <div className="space-y-6">
            {/* Target Role */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Target Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setSelectedRole(role); setCustomRole(""); }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      selectedRole === role && !customRole
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or specify custom role (e.g. Cloud DevOps Engineer)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="mt-3 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Round Type */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Interview Round Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ROUNDS.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRound(r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedRound === r.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between mb-1">
                      <span>{r.label}</span>
                      {selectedRound === r.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty & Number of Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Experience / Difficulty Level
                </label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        difficulty === d
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Total Questions: <span className="text-emerald-400">{questionCount}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="8"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 font-mono w-6 text-right">{questionCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Tailored Interview Room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Launch Interview Room</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
