import re
import io
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader

COMMON_SKILLS_DICTIONARY = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "html", "css", "sql", "r", "go", "rust", "php",
    # AI / Data Science
    "machine learning", "deep learning", "nlp", "natural language processing", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "opencv", "huggingface", "llm", "transformers",
    # Web & Frameworks
    "react", "react.js", "next.js", "vue", "angular", "node.js", "express", "fastapi", "flask", "django", "spring boot", "tailwind",
    # Databases & Cloud
    "mongodb", "postgresql", "mysql", "sqlite", "redis", "firebase", "aws", "azure", "gcp", "docker", "kubernetes", "git", "github",
    # CS Core & Others
    "data structures", "algorithms", "dsa", "system design", "oop", "object oriented programming", "rest api", "graphql", "microservices"
]

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def parse_resume_content(text: str) -> Dict[str, Any]:
    """Parses text to extract skills, experience hints, and projects."""
    text_lower = text.lower()
    
    # 1. Skill Extraction
    detected_skills = set()
    for skill in COMMON_SKILLS_DICTIONARY:
        # Check boundary matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize casing
            if skill == "dsa":
                detected_skills.add("Data Structures & Algorithms")
            elif skill == "nlp":
                detected_skills.add("NLP")
            elif skill == "llm":
                detected_skills.add("LLMs")
            elif skill == "oop":
                detected_skills.add("OOP")
            else:
                detected_skills.add(skill.title())
    
    # 2. Experience Estimation
    exp_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience', text_lower)
    exp_years = 0.0
    if exp_matches:
        try:
            exp_years = float(exp_matches[0])
        except ValueError:
            exp_years = 0.0
    
    # 3. Projects extraction snippet
    project_snippets = []
    lines = text.split("\n")
    capture_project = False
    for line in lines:
        line_clean = line.strip()
        if re.search(r'^(?:projects?|academic projects?|key projects?):?', line_clean, re.IGNORECASE):
            capture_project = True
            continue
        elif capture_project and re.search(r'^(?:education|experience|certifications?|skills?|achievements?):?', line_clean, re.IGNORECASE):
            capture_project = False
        
        if capture_project and line_clean:
            project_snippets.append(line_clean)
            if len(project_snippets) >= 6:
                break
    
    projects_summary = " ".join(project_snippets) if project_snippets else "Projects highlighted in profile."
    
    return {
        "skills": sorted(list(detected_skills)),
        "experience_years": exp_years,
        "projects_summary": projects_summary,
        "preview": text[:500] + ("..." if len(text) > 500 else "")
    }
