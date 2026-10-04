import json
import httpx
import re
from typing import List, Dict, Any, Optional
from .speech_nlp import analyze_speech_metrics
from ..config import settings

# Pre-curated high quality question bank for fallback / zero-config instant use
CURATED_QUESTIONS = {
    "Technical": {
        "Software Development Engineer": [
            {
                "question": "Can you explain the difference between Process and Thread, and how multi-threading works in modern OS?",
                "category": "Operating Systems & Concurrency",
                "expected": ["Independent memory space vs shared memory", "Context switching overhead", "Race conditions", "Thread synchronization"]
            },
            {
                "question": "How does a Hash Map work internally, and how does it handle hash collisions?",
                "category": "Data Structures",
                "expected": ["Hash function & bucket indexing", "Separate Chaining / Linked list or Tree", "Open Addressing", "Load factor and rehashing", "O(1) average time complexity"]
            },
            {
                "question": "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
                "category": "Databases",
                "expected": ["ACID compliance vs BASE", "Fixed schema vs flexible document/KV", "Horizontal vs vertical scaling", "Transactional consistency"]
            },
            {
                "question": "Explain the four core principles of Object-Oriented Programming (OOP) with real-world examples.",
                "category": "Core CS",
                "expected": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"]
            },
            {
                "question": "How does the REST architecture work, and what are idempotent HTTP methods?",
                "category": "System Design & APIs",
                "expected": ["Statelessness", "Client-server separation", "GET/PUT/DELETE idempotence", "Standard status codes"]
            }
        ],
        "Machine Learning Engineer": [
            {
                "question": "Explain the Bias-Variance tradeoff and how regularization techniques (L1/L2) help address it.",
                "category": "Machine Learning Fundamentals",
                "expected": ["Underfitting vs Overfitting", "Model complexity", "L1 Lasso feature selection", "L2 Ridge coefficient penalty"]
            },
            {
                "question": "What is the difference between precision, recall, and F1-score? When would you prioritize recall over precision?",
                "category": "Evaluation Metrics",
                "expected": ["False positives vs False negatives", "Medical diagnosis or fraud detection favoring recall", "Harmonic mean in F1"]
            },
            {
                "question": "How does the Self-Attention mechanism in Transformer architectures work compared to traditional RNNs?",
                "category": "Deep Learning & NLP",
                "expected": ["Query, Key, Value vectors", "Parallelization vs sequential recurrence", "Long-range dependency capture", "Attention weights softmax"]
            },
            {
                "question": "How do you handle severe class imbalance in a classification dataset?",
                "category": "Data Preprocessing",
                "expected": ["SMOTE / Oversampling", "Undersampling", "Class weights in loss function", "Focal loss", "Stratified sampling"]
            },
            {
                "question": "Explain gradient descent, the vanishing gradient problem, and how modern activation functions like ReLU alleviate it.",
                "category": "Deep Learning",
                "expected": ["Learning rate and backpropagation", "Sigmoid derivative saturation", "ReLU non-saturating gradient"]
            }
        ],
        "Frontend Developer": [
            {
                "question": "How does the Virtual DOM in React work, and how does reconciliation optimize rendering?",
                "category": "React & Frontend Architecture",
                "expected": ["Diffing algorithm", "Batching DOM mutations", "Key prop in lists", "Minimizing direct DOM repaints"]
            },
            {
                "question": "Explain the JavaScript Event Loop, Call Stack, Microtask queue, and Macrotask queue.",
                "category": "JavaScript Core",
                "expected": ["Single-threaded nature", "Promise vs setTimeout execution priority", "Non-blocking I/O"]
            },
            {
                "question": "What are the common strategies for optimizing web performance and Core Web Vitals?",
                "category": "Web Performance",
                "expected": ["Code splitting / Lazy loading", "LCP, FID/INP, CLS", "Image optimization", "Caching & CDN"]
            },
            {
                "question": "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
                "category": "Web Architecture",
                "expected": ["SEO benefits of SSR", "Initial page load vs client hydration", "Server load trade-offs"]
            },
            {
                "question": "How do you manage complex application state in React applications?",
                "category": "State Management",
                "expected": ["Context API", "Redux Toolkit / Zustand", "Server state caching with React Query/SWR"]
            }
        ]
    },
    "HR": {
        "General": [
            {
                "question": "Tell me about yourself, your academic background, and what inspired you to pursue engineering.",
                "category": "Introduction & Background",
                "expected": ["Clear chronology", "Key projects and achievements", "Passion for problem solving", "Confidence and clarity"]
            },
            {
                "question": "Describe a challenging situation in a team project where conflicts arose. How did you resolve it?",
                "category": "Conflict Resolution & Teamwork",
                "expected": ["STAR method: Situation, Task, Action, Result", "Active listening and compromise", "Professional outcome"]
            },
            {
                "question": "Where do you see yourself professionally in the next 3 to 5 years?",
                "category": "Career Aspirations",
                "expected": ["Growth mindset", "Technical depth & leadership", "Commitment to learning"]
            },
            {
                "question": "Tell me about a time you failed or made a mistake on a project. What did you learn?",
                "category": "Self-Reflection & Resilience",
                "expected": ["Accountability", "Root-cause understanding", "Constructive lessons applied"]
            },
            {
                "question": "Why are you interested in joining our organization and what makes you a great fit for this role?",
                "category": "Culture & Alignment",
                "expected": ["Company alignment", "Unique strengths and enthusiasm", "Value contribution"]
            }
        ]
    }
}

async def generate_interview_questions(
    role_title: str,
    round_type: str,
    difficulty: str,
    total_questions: int = 5,
    skills: List[str] = None,
    projects_summary: str = ""
) -> List[Dict[str, Any]]:
    """
    Generates tailored interview questions. If Groq API key is present, calls LLM.
    Otherwise uses the intelligent curated bank adapted to candidate's skills.
    """
    skills = skills or []
    
    # Check if Groq API is available
    if settings.GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                prompt = f"""You are a senior technical interviewer conducting an interview for the role of '{role_title}'.
Round Type: {round_type}
Difficulty Level: {difficulty}
Candidate Extracted Skills: {', '.join(skills) if skills else 'General CS fundamentals'}
Candidate Projects: {projects_summary if projects_summary else 'Standard academic projects'}
Total Questions Needed: {total_questions}

Generate exactly {total_questions} interview questions formatted as a valid JSON array of objects with keys:
- "question_index": (integer starting from 1)
- "question_text": (string question text)
- "category": (string e.g. Technical, Behavioral, System Design)
- "expected_concepts": (array of 3-4 strings detailing what a good answer must cover)

Return ONLY valid JSON. No markdown codeblock backticks if possible."""

                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are an expert technical interviewer JSON generator."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.4
                    }
                )
                
                if response.status_code == 200:
                    raw_content = response.json()["choices"][0]["message"]["content"]
                    # Extract json if wrapped in ```json
                    json_match = re.search(r'\[.*\]', raw_content, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if len(parsed) >= 1:
                            return parsed[:total_questions]
        except Exception as e:
            print(f"LLM generation fallback triggered: {e}")

    # Fallback to intelligent curated bank
    questions_list = []
    
    # Determine base domain
    domain = "Software Development Engineer"
    role_lower = role_title.lower()
    if any(k in role_lower for k in ["ml", "ai", "machine learning", "data", "deep learning"]):
        domain = "Machine Learning Engineer"
    elif any(k in role_lower for k in ["front", "react", "ui", "web design"]):
        domain = "Frontend Developer"

    if round_type == "HR":
        pool = CURATED_QUESTIONS["HR"]["General"]
    elif round_type == "Mix":
        tech_pool = CURATED_QUESTIONS["Technical"].get(domain, CURATED_QUESTIONS["Technical"]["Software Development Engineer"])
        hr_pool = CURATED_QUESTIONS["HR"]["General"]
        pool = tech_pool[:3] + hr_pool[:2]
    else:
        pool = CURATED_QUESTIONS["Technical"].get(domain, CURATED_QUESTIONS["Technical"]["Software Development Engineer"])

    # If candidate has special skills in resume, craft a customized question
    if skills and round_type != "HR":
        top_skills = skills[:3]
        custom_q = {
            "question": f"In your profile, you mentioned experience with {', '.join(top_skills)}. Can you describe how you architected one of your key projects using these tools and what major technical hurdles you overcame?",
            "category": "Resume & Practical Experience",
            "expected": [f"Architecture explanation with {top_skills[0]}", "Tradeoffs made", "Debugging & resolution steps", "Measurable outcomes"]
        }
        pool = [custom_q] + pool

    idx = 1
    for item in pool[:total_questions]:
        questions_list.append({
            "question_index": idx,
            "question_text": item["question"],
            "category": item.get("category", round_type),
            "expected_concepts": item.get("expected", ["Clarity", "Technical accuracy", "Practical application"])
        })
        idx += 1

    return questions_list

async def evaluate_candidate_answer(
    question_text: str,
    category: str,
    expected_concepts: List[str],
    user_answer: str,
    audio_duration_seconds: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates candidate's answer using LLM (if configured) or robust NLP heuristics.
    Returns technical score, communication score, confidence score, feedback, ideal answer, and speech metrics.
    """
    speech_metrics = analyze_speech_metrics(user_answer, audio_duration_seconds)

    # If Groq LLM available, evaluate with AI model
    if settings.GROQ_API_KEY and len(user_answer.strip()) > 5:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                eval_prompt = f"""You are an expert AI interview examiner.
Question: {question_text}
Category: {category}
Expected Concepts: {json.dumps(expected_concepts)}
Candidate Answer: {user_answer}

Evaluate the candidate's answer and return a JSON object with:
- "technical_score": (float 0 to 100 assessing technical correctness & depth)
- "communication_score": (float 0 to 100 assessing clarity & structure)
- "feedback": (detailed constructive feedback pointing out what was good and what was missed)
- "ideal_answer": (a concise 3-4 sentence gold standard answer for this question)

Return ONLY valid JSON."""

                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are an objective AI interview evaluator JSON outputter."},
                            {"role": "user", "content": eval_prompt}
                        ],
                        "temperature": 0.2
                    }
                )
                if response.status_code == 200:
                    raw_content = response.json()["choices"][0]["message"]["content"]
                    json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        parsed["confidence_score"] = speech_metrics["confidence_score"]
                        parsed["speech_metrics"] = speech_metrics
                        return parsed
        except Exception as e:
            print(f"LLM answer evaluation fallback: {e}")

    # Heuristic NLP Evaluation
    user_lower = user_answer.lower()
    words = re.findall(r'\b\w+\b', user_lower)
    word_count = len(words)

    if word_count < 5:
        return {
            "technical_score": 15.0,
            "communication_score": 20.0,
            "confidence_score": speech_metrics["confidence_score"],
            "feedback": "Answer was too brief or incomplete. Try providing concrete definitions, step-by-step logic, and practical examples.",
            "ideal_answer": f"A comprehensive response should address the key concepts: {', '.join(expected_concepts)} with specific architectural context.",
            "speech_metrics": speech_metrics
        }

    # Concept overlap matching
    concept_hits = 0
    for concept in expected_concepts:
        concept_tokens = [w for w in re.findall(r'\b\w+\b', concept.lower()) if len(w) > 3]
        if any(token in user_lower for token in concept_tokens):
            concept_hits += 1

    ratio = concept_hits / max(len(expected_concepts), 1)
    
    # Calculate scores
    base_tech = 40.0 + (ratio * 45.0)
    if word_count > 40:
        base_tech += 10.0
    technical_score = min(95.0, max(25.0, round(base_tech, 1)))

    communication_score = speech_metrics["clarity_score"]
    confidence_score = speech_metrics["confidence_score"]

    feedback_parts = []
    if concept_hits == len(expected_concepts):
        feedback_parts.append("Great job! You covered all the critical technical concepts.")
    elif concept_hits > 0:
        feedback_parts.append(f"Good effort. You addressed key aspects, but could elaborate more on: {', '.join(expected_concepts[concept_hits:])}.")
    else:
        feedback_parts.append("Your response lacks specific depth. Make sure to define the core terminology and explain why this pattern or concept is used.")

    if speech_metrics["filler_count"] > 2:
        feedback_parts.append(f"Noticeable filler words detected ({', '.join(speech_metrics['detected_fillers'])}). Practice pausing instead of using filler phrases.")

    return {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "feedback": " ".join(feedback_parts),
        "ideal_answer": f"A strong answer highlights: {'; '.join(expected_concepts)}. For instance, discussing real-world performance implications, tradeoff considerations, and how you practically apply them in production code.",
        "speech_metrics": speech_metrics
    }

def aggregate_session_report(responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes overall session scores, strengths, weaknesses, and improvement roadmap."""
    if not responses:
        return {
            "overall_score": 0.0,
            "technical_score": 0.0,
            "communication_score": 0.0,
            "confidence_score": 0.0,
            "summary_feedback": "No answers submitted.",
            "strengths": [],
            "weaknesses": ["Interview was exited before completing any questions."],
            "recommendations": ["Re-attempt the mock interview and provide detailed answers."]
        }

    avg_tech = sum(r.get("technical_score", 0.0) for r in responses) / len(responses)
    avg_comm = sum(r.get("communication_score", 0.0) for r in responses) / len(responses)
    avg_conf = sum(r.get("confidence_score", 0.0) for r in responses) / len(responses)
    overall = round((avg_tech * 0.45) + (avg_comm * 0.30) + (avg_conf * 0.25), 1)

    strengths = []
    weaknesses = []
    recommendations = []

    if avg_tech >= 75:
        strengths.append("Solid technical foundation and correct understanding of core concepts.")
    else:
        weaknesses.append("Technical explanations could be deeper and include more specific industry terminology.")
        recommendations.append("Review foundational concepts and practice explaining them with architecture diagrams or code syntax.")

    if avg_comm >= 75:
        strengths.append("Clear articulation, well-structured answers, and easy to follow thought process.")
    else:
        weaknesses.append("Communication structure could be improved using the STAR (Situation, Task, Action, Result) format.")
        recommendations.append("Structure answers with clear beginning, explanation of trade-offs, and final conclusion.")

    if avg_conf >= 75:
        strengths.append("High confidence, steady cadence, and minimal speech hesitation.")
    else:
        weaknesses.append("Hesitation markers and filler words detected during explanation.")
        recommendations.append("Practice mock interviews with video recording to get comfortable maintaining eye contact and confident pacing.")

    if overall >= 80:
        summary_feedback = "Exceptional performance! The candidate is placement-ready with strong technical knowledge and polished interview presence."
    elif overall >= 65:
        summary_feedback = "Good performance with high potential. With focused refinement on technical depth and confidence, the candidate will excel in top-tier interviews."
    else:
        summary_feedback = "Foundational stage. Recommend dedicated practice rounds focusing on fundamental CS topics and speech fluency."

    return {
        "overall_score": overall,
        "technical_score": round(avg_tech, 1),
        "communication_score": round(avg_comm, 1),
        "confidence_score": round(avg_conf, 1),
        "summary_feedback": summary_feedback,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations
    }
