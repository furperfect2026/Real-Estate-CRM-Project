import google.generativeai as genai
import os
import json
from app.models.lead import Lead

# Initialize genai, configure securely (we assume GEMINI_API_KEY is in env)
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "DUMMY_KEY"))

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_lead_score(self, lead: Lead) -> dict:
        prompt = f"""
        Analyze the following real estate lead and generate a lead score from 1 to 100 based on their likelihood to convert.
        Also provide a 2-sentence summary of the lead.
        
        Lead Details:
        - Source: {lead.source}
        - Status: {lead.status}
        - Budget/Preferences (if any from history/notes etc): N/A (assuming for MVP)
        - Contact details available: {'Yes' if (lead.phone or lead.email) else 'No'}
        
        Return the result as a valid JSON object with the exact format:
        {{
            "score": int,
            "summary": "string"
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            # Remove any markdown formatting like ```json ... ```
            content = response.text.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            return json.loads(content.strip())
        except Exception as e:
            return {"score": 50, "summary": f"Could not generate summary: {str(e)}"}

    def generate_follow_up(self, lead: Lead, tone: str = "friendly") -> str:
        prompt = f"""
        You are a real estate agent. Write a personalized WhatsApp message for a lead named {lead.first_name} {lead.last_name}.
        Tone: {tone}
        Keep it brief, engaging, and professional. The goal is to start a conversation and find out their exact requirements or schedule a call.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Hello {lead.first_name}, thank you for your interest! Please let us know when we can connect."
