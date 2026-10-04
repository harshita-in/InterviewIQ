import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, ArrowRight, 
  Clock, AlertCircle, CheckCircle2, Bot, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import WebcamPreview from '../components/WebcamPreview';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/speech';
import { api } from '../utils/api';

export default function LiveInterview({ sessionData, onInterviewFinished }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEval, setLastEval] = useState(null);
  const [speechError, setSpeechError] = useState("");

  const speechRecognizerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const questions = sessionData?.questions || [];
  const currentQuestion = questions[currentIdx] || null;
  const isLastQuestion = currentIdx === questions.length - 1;

  // Question timer
  useEffect(() => {
    setTimerSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIdx]);

  // Read question automatically on load
  useEffect(() => {
    if (currentQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(true);
      speakText(currentQuestion.question_text, () => {
        setIsSpeakingQuestion(false);
      });
    }

    return () => {
      stopSpeaking();
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch(e) {}
      }
    };
  }, [currentIdx, currentQuestion]);

  // Setup speech-to-text
  const toggleMicrophone = () => {
    if (isListeningMic) {
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch(e) {}
      }
      setIsListeningMic(false);
    } else {
      setSpeechError("");
      const recognizer = createSpeechRecognizer(
        (finalTranscript, interim) => {
          if (finalTranscript) {
            setAnswerText(prev => (prev ? prev + " " + finalTranscript : finalTranscript).trim());
          }
        },
        (error) => {
          setSpeechError("Microphone input notice: " + error);
          setIsListeningMic(false);
        }
      );

      if (!recognizer) {
        setSpeechError("Speech-to-text is not supported in this browser. You can type your answer.");
        return;
      }

      speechRecognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListeningMic(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleManualSpeakToggle = () => {
    if (isSpeakingQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
    } else if (currentQuestion) {
      setIsSpeakingQuestion(true);
      speakText(currentQuestion.question_text, () => {
        setIsSpeakingQuestion(false);
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert("Please provide an answer before submitting.");
      return;
    }

    // Stop mic and voice
    if (isListeningMic && speechRecognizerRef.current) {
      try { speechRecognizerRef.current.stop(); } catch(e) {}
      setIsListeningMic(false);
    }
    stopSpeaking();

    setIsSubmitting(true);
    try {
      const evalResponse = await api.submitAnswer(
        sessionData.session_id,
        currentQuestion.question_index,
        answerText,
        timerSeconds
      );

      setLastEval(evalResponse);

      if (isLastQuestion) {
        // Complete interview
        const finalReport = await api.completeInterview(sessionData.session_id);
        onInterviewFinished(finalReport);
      } else {
        // Advance to next question after short delay or user click
        setTimeout(() => {
          setAnswerText("");
          setLastEval(null);
          setCurrentIdx(prev => prev + 1);
          setIsSubmitting(false);
        }, 1200);
      }
    } catch (err) {
      alert("Error submitting answer: " + err.message);
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Session Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Live Interview Session</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-300">{sessionData?.role_title}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Round: <span className="text-emerald-400">{sessionData?.round_type}</span> | Level: <span className="text-slate-300">{sessionData?.difficulty}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Question progress */}
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Progress:</span>
            <span className="text-emerald-400 font-mono">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          {/* Timer */}
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold font-mono text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Interview Room Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Interviewer & Webcam Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Avatar Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isSpeakingQuestion 
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 scale-105 shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-800 text-emerald-400'
                }`}>
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    AI Interviewer
                    {isSpeakingQuestion && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isSpeakingQuestion ? 'Speaking question aloud...' : 'Listening to candidate'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleManualSpeakToggle}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSpeakingQuestion
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title={isSpeakingQuestion ? "Mute Voice" : "Repeat Question Aloud"}
              >
                {isSpeakingQuestion ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSpeakingQuestion ? "Speaking" : "Repeat"}</span>
              </button>
            </div>

            {/* Speaking visualizer bars */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Speech Audio Track</span>
              <div className="flex items-center gap-1 h-3">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 rounded-full bg-emerald-400 transition-all duration-150 ${
                      isSpeakingQuestion ? 'h-3 animate-pulse' : 'h-1 bg-slate-700'
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          {/* Webcam Preview Feed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Camera</span>
              <span className="text-[10px] text-slate-500">Live Posture & Presence Analysis</span>
            </div>
            <WebcamPreview isListening={isListeningMic} />
          </div>
        </div>

        {/* Right Column: Active Question & Interactive Response (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Display Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Question {currentIdx + 1} • {currentQuestion?.category || 'Technical Round'}
              </span>
              <span className="text-xs text-slate-400">
                Answer via Speech or Text
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentQuestion?.question_text}
            </h2>
          </div>

          {/* Candidate Response Workspace */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Your Answer
                </label>
                <p className="text-[11px] text-slate-400">
                  Speak naturally into your microphone or write code / text below.
                </p>
              </div>

              {/* Voice toggle button */}
              <button
                onClick={toggleMicrophone}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isListeningMic
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                {isListeningMic ? (
                  <>
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>Listening... (Click to Pause)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Speak Answer (Start Mic)</span>
                  </>
                )}
              </button>
            </div>

            {speechError && (
              <p className="text-xs text-amber-400/90 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5">
                {speechError}
              </p>
            )}

            {/* Answer Text Area */}
            <div className="relative">
              <textarea
                rows={7}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Start speaking or type your response here... (e.g. explain core architecture, mention practical examples, write code snippets)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 leading-relaxed font-mono"
              />
              <div className="absolute bottom-3 right-3 text-[11px] text-slate-500">
                {answerText.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {/* Evaluation preview if submitted */}
            {lastEval && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between font-bold">
                  <span>Evaluation Recorded!</span>
                  <span>Technical Score: {lastEval.technical_score}%</span>
                </div>
                <p className="text-slate-300">{lastEval.feedback}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answerText.trim()}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Answer via NLP...</span>
                  </>
                ) : isLastQuestion ? (
                  <>
                    <span>Submit & Finish Interview</span>
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
