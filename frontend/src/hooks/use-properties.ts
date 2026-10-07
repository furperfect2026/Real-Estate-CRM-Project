import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property, PropertyMatchResult, Lead } from '@/lib/types';

export const BASELINE_PROPERTIES: Property[] = [
  {
    id: "prop_1",
    name: "Tathastu Residency - Tower A (3 BHK Luxury)",
    project_name: "Tathastu Residency",
    location: "Kharadi Bypass, Pune",
    city: "Pune",
    type: "3 BHK",
    carpet_area: "1,250 sq.ft.",
    price: 11500000,
    price_display: "₹1.15 Cr - ₹1.25 Cr",
    possession: "Dec 2026",
    rera_number: "P52100024891",
    description: "East-facing 3 BHK luxury residence with unobstructed river view, 2 dedicated covered parking spots, and Italian marble flooring in living and dining.",
    key_highlights: [
      "East Facing (100% Vastu Compliant)",
      "500m from World Trade Center Kharadi",
      "Clubhouse, Infinity Pool & Tennis Court",
      "2 Covered Car Parking Included"
    ],
    status: "FEW_UNITS_LEFT",
    added_by: "Rohit Nalpe (Admin)",
    added_by_role: "ADMIN",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "prop_2",
    name: "Tathastu Heights - Phase 2 (2 BHK Premium)",
    project_name: "Tathastu Heights",
    location: "Near Eon IT Park, Kharadi, Pune",
    city: "Pune",
    type: "2 BHK",
    carpet_area: "820 sq.ft.",
    price: 7800000,
    price_display: "₹75 Lakhs - ₹82 Lakhs",
    possession: "Ready to Move",
    rera_number: "P52100031120",
    description: "Ready-to-move-in 2 BHK with full Occupancy Certificate (OC received). Zero GST applicable. Designer modular kitchen and premium Jaquar bath fittings included.",
    key_highlights: [
      "Ready to Move (OC Received - 0% GST)",
      "High Floor with City Skyline View",
      "Pre-fitted Modular Kitchen & AC points",
      "Walking distance from Eon IT Park Phase 1"
    ],
    status: "AVAILABLE",
    added_by: "Gayatri (Caller)",
    added_by_role: "EMPLOYEE",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "prop_3",
    name: "Tathastu Greens - Hillview (2 BHK Garden View)",
    project_name: "Tathastu Greens",
    location: "Baner-Pashan Link Road, Baner, Pune",
    city: "Pune",
    type: "2 BHK",
    carpet_area: "895 sq.ft.",
    price: 8800000,
    price_display: "₹85 Lakhs - ₹92 Lakhs",
    possession: "Dec 2025",
    rera_number: "P52100019842",
    description: "Serene garden-facing residences bordering the protected Baner biodiversity park. High cross-ventilation, 2 balconies, and smart biometric door lock.",
    key_highlights: [
      "Scenic Baner Hill Bio-Reserve View",
      "5 Mins from Mumbai-Bangalore Highway",
      "Rooftop Infinity Jogging Track",
      "Pre-approved 8.4% Home Loan from HDFC & SBI"
    ],
    status: "AVAILABLE",
    added_by: "Anmol (Manager)",
    added_by_role: "MANAGER",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "prop_4",
    name: "Tathastu Enclave (2 BHK Smart Living)",
    project_name: "Tathastu Enclave",
    location: "Punawale, Near Hinjewadi Bridge, Pune",
    city: "Pune",
    type: "2 BHK",
    carpet_area: "740 sq.ft.",
    price: 5600000,
    price_display: "₹55 Lakhs - ₹62 Lakhs",
    possession: "Ready to Move",
    rera_number: "P52100045210",
    description: "Smart compact 2 BHK tailored for IT professionals working in Hinjewadi. High rental yields of ₹24,000/month with zero vacancy risk.",
    key_highlights: [
      "10 mins straight drive to Hinjewadi Phase 1",
      "Ready to Move with Full Amenities",
      "High Rental Yield (~5.2% p.a.)",
      "85% Bank Loan Pre-Sanctioned"
    ],
    status: "AVAILABLE",
    added_by: "Gayatri (Caller)",
    added_by_role: "EMPLOYEE",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "prop_5",
    name: "Pride World City - Tathastu Tower (3 BHK)",
    project_name: "Pride World City",
    location: "Charholi Budruk, Pune",
    city: "Pune",
    type: "3 BHK",
    carpet_area: "1,120 sq.ft.",
    price: 9800000,
    price_display: "₹95 Lakhs - ₹1.05 Cr",
    possession: "Dec 2025",
    rera_number: "P52100028911",
    description: "Spacious 3 BHK in master township with Olympic-size pool, CBSE school within township gates, and multi-cuisine high street retail.",
    key_highlights: [
      "Master Township with 15-Acre Central Park",
      "15 mins from Pune International Airport",
      "3 BHK with 3 En-Suite Bathrooms",
      "Zero Floor Rise on Special Early Booking"
    ],
    status: "AVAILABLE",
    added_by: "Anmol (Manager)",
    added_by_role: "MANAGER",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "prop_6",
    name: "Tathastu Sky Terraces (4 BHK Signature Duplex)",
    project_name: "Tathastu Sky Terraces",
    location: "Kalyani Nagar Waterfront, Pune",
    city: "Pune",
    type: "4 BHK",
    carpet_area: "2,450 sq.ft.",
    price: 27500000,
    price_display: "₹2.65 Cr - ₹2.90 Cr",
    possession: "Dec 2026",
    rera_number: "P52100051280",
    description: "Ultra-luxury penthouse duplex with private plunge pool on terrace deck, floor-to-ceiling glass panoramic facades, and 3 covered basement car parks.",
    key_highlights: [
      "Private Heated Plunge Pool on Deck",
      "Only 2 Signature Residences per Floor",
      "Direct Riverfront Unobstructed View",
      "Concierge Desk & Valet Parking Service"
    ],
    status: "FEW_UNITS_LEFT",
    added_by: "Rohit Nalpe (Admin)",
    added_by_role: "ADMIN",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

const STORAGE_KEY = "tathastu_properties_inventory_v1";

export function getStoredProperties(): Property[] {
  if (typeof window === "undefined") return BASELINE_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BASELINE_PROPERTIES));
      return BASELINE_PROPERTIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : BASELINE_PROPERTIES;
  } catch (e) {
    return BASELINE_PROPERTIES;
  }
}

export function saveStoredProperties(props: Property[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(props));
    window.dispatchEvent(new Event("tathastu-properties-updated"));
  } catch (e) {}
}

// Helper to extract approx numeric budget from string
export function parseBudgetToNumeric(budgetStr?: string): number {
  if (!budgetStr) return 8000000;
  const clean = budgetStr.toLowerCase().replace(/,/g, '');
  
  // Check for Cr
  const crMatch = clean.match(/([\d\.]+)\s*(?:cr|crore)/);
  if (crMatch) {
    return parseFloat(crMatch[1]) * 10000000;
  }
  
  // Check for Lakhs / L
  const lakhMatch = clean.match(/([\d\.]+)\s*(?:lakh|lakhs|l)/);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000;
  }
  
  // Fallback digits
  const digits = clean.replace(/[^0-9]/g, '');
  const parsed = parseInt(digits, 10);
  return isNaN(parsed) || parsed === 0 ? 8000000 : parsed;
}

// AI Matching Algorithm between a Client Requirement and Property Inventory
export function matchClientWithProperties(lead: Lead, properties: Property[]): PropertyMatchResult[] {
  const clientBudgetNum = parseBudgetToNumeric(lead.budget);
  const clientProject = (lead.project_name || "").toLowerCase();
  const clientNotes = (lead.notes || "").toLowerCase();
  const clientPropertyType = (lead.property_type || "").toLowerCase();

  const results: PropertyMatchResult[] = properties.map((prop) => {
    let score = 50; // baseline
    const reasons: string[] = [];

    // 1. Budget Fit Analysis
    const priceDiffRatio = Math.abs(prop.price - clientBudgetNum) / clientBudgetNum;
    let budgetFit: PropertyMatchResult['budgetFit'] = 'MISMATCH';

    if (priceDiffRatio <= 0.10) {
      budgetFit = 'PERFECT';
      score += 30;
      reasons.push(`Budget match within 10% (Client: ${lead.budget} vs Property: ${prop.price_display})`);
    } else if (prop.price < clientBudgetNum) {
      budgetFit = 'UNDER_BUDGET';
      score += 25;
      reasons.push(`Under client budget - High cost savings incentive (${prop.price_display})`);
    } else if (priceDiffRatio <= 0.25) {
      budgetFit = 'STRETCH';
      score += 15;
      reasons.push(`Slight budget stretch with luxury amenities (+${Math.round(priceDiffRatio * 100)}%)`);
    } else {
      budgetFit = 'MISMATCH';
      score -= 20;
    }

    // 2. Project & Location Match
    let locationFit: PropertyMatchResult['locationFit'] = 'DIFFERENT';
    const propNameLower = prop.name.toLowerCase();
    const propProjectLower = prop.project_name.toLowerCase();
    const propLocationLower = prop.location.toLowerCase();

    if (clientProject && (propNameLower.includes(clientProject) || propProjectLower.includes(clientProject))) {
      locationFit = 'EXACT';
      score += 25;
      reasons.push(`Exact project match for ${prop.project_name}`);
    } else if (
      (clientNotes.includes("kharadi") && propLocationLower.includes("kharadi")) ||
      (clientNotes.includes("baner") && propLocationLower.includes("baner")) ||
      (clientNotes.includes("hinjewadi") && (propLocationLower.includes("hinjewadi") || propLocationLower.includes("punawale")))
    ) {
      locationFit = 'NEARBY';
      score += 20;
      reasons.push(`Preferred micro-location fit (${prop.location})`);
    } else {
      locationFit = 'DIFFERENT';
      score += 5;
    }

    // 3. Configuration Match (BHK)
    let typeFit: PropertyMatchResult['typeFit'] = 'ALTERNATIVE';
    const propTypeLower = prop.type.toLowerCase();
    if (clientNotes.includes("3 bhk") || clientNotes.includes("3bhk") || clientPropertyType.includes("3")) {
      if (propTypeLower.includes("3 bhk")) {
        typeFit = 'EXACT';
        score += 15;
        reasons.push("Requested 3 BHK configuration");
      }
    } else if (clientNotes.includes("2 bhk") || clientNotes.includes("2bhk") || clientPropertyType.includes("2")) {
      if (propTypeLower.includes("2 bhk")) {
        typeFit = 'EXACT';
        score += 15;
        reasons.push("Requested 2 BHK configuration");
      }
    } else {
      typeFit = 'EXACT';
      score += 10;
    }

    const finalScore = Math.min(Math.max(score, 45), 98);

    // Direct pitch script for caller to speak directly to client
    const pitchScript = `Namaste ${lead.first_name}! Regarding your property requirement in ${prop.project_name}, I have an ideal ${prop.type} ready at ${prop.name} in ${prop.location}. It offers ${prop.carpet_area} carpet area at ${prop.price_display}. Key highlights include ${prop.key_highlights[0]}, and possession is ${prop.possession}. Since units in this tower sell out rapidly, can I schedule our executive cab to bring you and your family for a private show-flat tour tomorrow at 11:30 AM?`;

    // WhatsApp formatted brochure pitch
    const highlightsText = prop.key_highlights.map(h => `• ${h}`).join("\n");
    const whatsappMessage = `🏢 *TATHASTU INFRA PROPERTY PROPOSAL*\n\nNamaste *${lead.first_name} ji*,\nFollowing our discussion regarding your property requirement, here is our recommended inventory match:\n\n🌟 *${prop.name}*\n📍 *Location:* ${prop.location}\n📐 *Configuration:* ${prop.type} (${prop.carpet_area})\n💰 *Investment:* ${prop.price_display}\n🔑 *Possession:* ${prop.possession}\n📜 *MahaRERA:* ${prop.rera_number || "Verified"}\n\n✨ *Key Highlights:*\n${highlightsText}\n\n${prop.description}\n\n📅 *Site Visit:* We have arranged complimentary private cab pick-up for you and your family this weekend.\nWould Saturday 11:30 AM or Sunday 4:00 PM suit you best?\n\n*Tathastu Infra Sales Desk*\nDirect Dial: +91 98765 00001`;

    return {
      property: prop,
      lead,
      matchScore: finalScore,
      budgetFit,
      locationFit,
      typeFit,
      reasons,
      pitchScript,
      whatsappMessage,
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function useProperties() {
  const queryClient = useQueryClient();

  const useGetProperties = () => {
    return useQuery({
      queryKey: ['properties'],
      queryFn: async () => {
        return getStoredProperties();
      },
      staleTime: 1000 * 30,
    });
  };

  const addPropertyMutation = useMutation({
    mutationFn: async (propData: Omit<Property, 'id' | 'created_at'>) => {
      const current = getStoredProperties();
      const newProp: Property = {
        ...propData,
        id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      const updated = [newProp, ...current];
      saveStoredProperties(updated);
      return newProp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = getStoredProperties();
      const updated = current.filter(p => p.id !== id);
      saveStoredProperties(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  return {
    useGetProperties,
    addPropertyMutation,
    deletePropertyMutation,
    matchClientWithProperties,
  };
}
