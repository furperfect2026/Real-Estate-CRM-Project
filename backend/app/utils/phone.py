import re

def normalize_phone(phone: str) -> str:
    """Normalize phone number to E.164 format roughly."""
    if not phone:
        return phone
    # Strip everything except digits and plus
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Handle indian numbers starting with 0
    if cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = '+91' + cleaned[1:]
    # Handle numbers without country code (assuming +91)
    elif len(cleaned) == 10:
        cleaned = '+91' + cleaned
        
    return cleaned
