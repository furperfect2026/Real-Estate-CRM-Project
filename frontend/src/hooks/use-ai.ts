import { useQuery, useMutation } from '@tanstack/react-query';

export interface FollowUpOptions {
  leadName?: string;
  phone?: string;
  property?: string;
  budget?: string;
  stage?: string;
  context?: 'intro' | 'post_call' | 'site_visit_invite' | 'post_visit_close' | 'limited_offer' | 'cold_revival' | 'payment_reminder';
  tone?: 'urgent' | 'consultative' | 'vip' | 'short_whatsapp';
  agentName?: string;
}

export interface CopilotPrompt {
  id: string;
  title: string;
  category: 'objection' | 'closing' | 'pitch' | 'followup';
  query: string;
  response: string;
}

export const COPILOT_PRESETS: CopilotPrompt[] = [
  {
    id: 'objection-price',
    title: 'Client Says: "Price is too high / Out of budget"',
    category: 'objection',
    query: 'How to overcome budget resistance for a ₹1.2 Cr luxury 3BHK flat?',
    response: `💡 **Tactical Objection Response for Tathastu Infra:**\n\n1. **Acknowledge & Validate:** "I completely understand, sir. When making an investment of this scale, value for money is paramount."\n2. **Break Down Carpet vs Super Built-up:** "Most projects in this micro-market quote lower headline numbers but have only 62% efficiency. Tathastu Grandeur offers a verified 74% usable carpet area — effectively saving you ₹850/sq.ft on pure usable space."\n3. **Calculate EMI Differential:** "Between a ₹1.1 Cr property and this ₹1.25 Cr luxury residence, the actual monthly EMI variance is less than ₹11,800/month, yet you gain lifelong amenities, gated security, and higher rental yield."\n4. **Call to Action:** "Let us review the floor plan on a quick 10-minute site visit so you can judge the construction quality firsthand."`
  },
  {
    id: 'objection-possession',
    title: 'Client Says: "Concerned about construction delay / Possession timeline"',
    category: 'objection',
    query: 'How to reassure a buyer concerned about delivery timelines?',
    response: `🛡️ **Possession Assurance Framework:**\n\n1. **RERA Escrow Protection:** "Every buyer payment into Tathastu Infra is routed through a MahaRERA designated escrow account (70% strictly locked for construction materials and labor)."\n2. **Milestone-Linked Plan:** "You do not pay upfront; your disbursements strictly mirror completed construction slabs verified by our structural engineers."\n3. **Live Site Telecast:** "We offer monthly drone progress video logs and 24/7 site visitation access so you can inspect slab curing and brickwork anytime."\n4. **Penalty Clause Assurance:** "Our agreement includes a RERA-mandated interest compensation clause for any untoward delay."`
  },
  {
    id: 'closing-site-visit',
    title: 'Closing: Convert Inbound Inquiry into Confirmed Site Visit',
    category: 'closing',
    query: 'What is the highest-converting script to book a site visit today?',
    response: `🎯 **High-Conversion Site Visit Booking Pitch:**\n\n"Mr. Sharma, we currently have the sample duplex ready for preview, but starting next Monday we are hiking the launch price by ₹300/sq.ft as Phase 1 sells out.\n\nI have two VIP tour slots available with our Senior Project Architect:\n• Tomorrow (Saturday) at 11:30 AM\n• Sunday at 4:00 PM\n\nWe can also arrange our private executive cab to pick up you and your family from your residence. Which of these two timings works best for you?"`
  },
  {
    id: 'objection-comparison',
    title: 'Client Says: "Comparing with Pride World City / Competitor"',
    category: 'objection',
    query: 'How to position Tathastu Infra against large township competitors?',
    response: `⚖️ **Competitive Positioning Strategy:**\n\n1. **Density Advantage:** "Townships pack 4,000+ units, meaning overcrowded lifts, noisy clubhouses, and delayed possession of individual towers. Tathastu Infra offers boutique luxury with only 4 units per floor and 2 dedicated high-speed elevators."\n2. **Immediate Road Access:** "You don't have to spend 15 minutes navigating township internal roads; our property connects directly to the 120-ft arterial road."\n3. **Superior Interior Specifications:** "We include Italian marble flooring in living areas, Kohler/Grohe sanitary fittings, and pre-fitted EV charging points at every car parking slot as standard."`
  },
  {
    id: 'finance-loan',
    title: 'Client Says: "Waiting for bank loan sanction / CIBIL concerns"',
    category: 'pitch',
    query: 'How to fast-track financing doubts and keep the deal warm?',
    response: `📑 **In-House Financial Fast-Track Solution:**\n\n"Don't worry at all regarding the paperwork. Tathastu Infra has in-house desk relationships with SBI, HDFC, and ICICI Bank. Our dedicated loan desk can do an instant pre-qualification within 4 hours with zero processing charges. Let me connect you with our direct HDFC credit manager right now so we can lock in the lowest interest tier."`
  }
];

export const CADENCE_TEMPLATES = [
  {
    day: "Day 0",
    channel: "WhatsApp",
    title: "Instant Brochure & Intro",
    message: "Namaste {name}! Thank you for your interest in {project}. Here is the official digital brochure & floor plan catalog: [Brochure PDF]. Let me know your preferred configuration!",
    active: true
  },
  {
    day: "Day 1",
    channel: "Direct Call",
    title: "Requirement Discovery Call",
    message: "Discovery call by telecaller to verify 2BHK vs 3BHK requirement, budget range ({budget}), and timeline for purchase.",
    active: true
  },
  {
    day: "Day 3",
    channel: "WhatsApp",
    title: "Site Visit Invitation + Cab Offer",
    message: "Hi {name}, we are hosting an exclusive walkthrough of the {project} show flat this weekend. We can arrange a complimentary executive cab for your family. Would Saturday or Sunday suit you best?",
    active: true
  },
  {
    day: "Day 7",
    channel: "WhatsApp",
    title: "Price Lock / Inventory Urgency",
    message: "Important update for {project}, {name}: 3 corner units in your budget ({budget}) have been reserved this week. Would you like to place a refundable token to lock your preferred floor before prices revise?",
    active: true
  },
  {
    day: "Day 14",
    channel: "SMS / Call",
    title: "Management Direct Connect",
    message: "Personal connect from Sales Management: 'Mr. {name}, Anmol here from Tathastu Infra sales management. I wanted to personally ensure all your property queries have been addressed.'",
    active: false
  }
];

export function generateSmartMessage(opts: FollowUpOptions): string {
  const name = opts.leadName || "Valued Client";
  const project = opts.property || "Tathastu Grandeur";
  const budget = opts.budget || "₹95 L - ₹1.4 Cr";
  const agent = opts.agentName || "Tathastu Sales Desk";
  const context = opts.context || "post_call";
  const tone = opts.tone || "urgent";

  if (context === 'intro') {
    if (tone === 'short_whatsapp') {
      return `Hello ${name}! 👋 Thank you for inquiring about ${project} with Tathastu Infra. We have premium 2 & 3 BHK residences in your budget (${budget}). Here's the project brochure: https://tathastuinfra.com/brochure. When is a good time for a quick 2-min chat?`;
    }
    if (tone === 'vip') {
      return `Dear Mr./Ms. ${name},\n\nIt is our pleasure to introduce Tathastu Infra's flagship development: ${project}. Crafted for distinguished homeowners seeking expansive carpet efficiency, private decks, and bespoke clubhouse amenities.\n\nI would be delighted to share our VIP architectural dossier with you. At your convenience, please let me know when we may schedule a private consultation.\n\nWarm regards,\n${agent}\nTathastu Infra`;
    }
    return `Hi ${name}, thank you for connecting with Tathastu Infra! ✨\n\nRegarding your interest in ${project} within the ${budget} budget, we have exclusive inventory released on higher floors with panoramic views.\n\nWould you like me to share the floor plans and payment schedules on WhatsApp?\n\nBest regards,\n${agent}`;
  }

  if (context === 'site_visit_invite') {
    if (tone === 'short_whatsapp') {
      return `Hi ${name}! The show residence at ${project} is ready for private viewings this weekend. Would you prefer a Saturday or Sunday morning slot? We can also arrange a doorstep cab pickup for you! 🚗`;
    }
    return `Hello ${name},\n\nNothing compares to experiencing the actual carpet space and lighting in person! We are hosting private family walkthroughs at ${project} this coming weekend.\n\n📍 Location: Tathastu Experience Pavilion\n⏰ Available Slots: 11:00 AM | 3:30 PM | 5:30 PM\n🚗 Doorstep executive cab pickup can be arranged.\n\nPlease let me know your preferred slot so I can reserve your personalized project tour!\n\nBest,\n${agent}\nTathastu Infra`;
  }

  if (context === 'post_visit_close') {
    if (tone === 'urgent') {
      return `Hi ${name}, thank you for visiting ${project} yesterday! 🌟\n\nThe corner unit you shortlisted on the 11th floor has received inquiry from another buyer today. To hold this specific unit and protect your launch pricing benefit, we can place a priority hold with a refundable token.\n\nShall I send the bank allotment details so you don't miss out?\n\nWarm regards,\n${agent}`;
    }
    return `Dear ${name},\n\nIt was great hosting you and your family at ${project}! We hope you loved the spacious layout and clubhouse concept.\n\nI have attached the customized payment schedule tailored to your ${budget} plan. Let me know if you would like to discuss final unit allotment terms tomorrow.\n\nBest regards,\n${agent}`;
  }

  if (context === 'limited_offer') {
    return `⚡ Limited Launch Incentive Alert: ${project}\n\nDear ${name},\n\nFor the next 48 hours, Tathastu Infra is offering a complimentary Modular Kitchen voucher + Zero Floor Rise Charges on selected 3BHK units in your target range of ${budget}.\n\nThis offer is limited to the first 5 bookings this month. Let's connect today to lock in your preferential pricing!\n\nBest,\n${agent}\nTathastu Infra`;
  }

  if (context === 'cold_revival') {
    return `Hello ${name}, checking in from Tathastu Infra! 👋\n\nWe spoke earlier regarding your home search for ${project}. We have recently released a new premium wing with scenic green views and relaxed construction-linked payment milestones (pay only 10% on booking).\n\nAre you still exploring property options in this area? Would love to share the updated layout plans with you.\n\nBest,\n${agent}`;
  }

  if (context === 'payment_reminder') {
    return `Dear ${name},\n\nGreetings from Tathastu Infra Accounts Desk.\n\nThis is a gentle reminder regarding the upcoming booking milestone payment for your unit at ${project}. Kindly find the payment gateway link and RTGS details enclosed.\n\nPlease reply or call me if you require any assistance with the transaction.\n\nWarm regards,\n${agent}\nTathastu Infra`;
  }

  // Default: post_call
  if (tone === 'short_whatsapp') {
    return `Hi ${name}, great speaking with you! As discussed, ${project} fits your ${budget} requirements perfectly. I've sent the pricing sheet above. Let me know what time tomorrow works for our follow-up call. 👍`;
  }
  return `Hi ${name},\n\nThank you for your time on the call today! As discussed, ${project} is an ideal match for your ${budget} requirements, offering superior carpet efficiency and prime connectivity.\n\nAs promised, I have prepared the detailed floor plans and current inventory list for your review. Would you like to schedule a site tour this weekend?\n\nBest regards,\n${agent}\nTathastu Infra`;
}

export function useAI() {
  const useScoreLead = (id: string) => {
    return useQuery({
      queryKey: ['ai', 'score', id],
      queryFn: async () => {
        await new Promise(r => setTimeout(r, 400));
        return {
          score: 88,
          tier: "Hot",
          summary: "High conversion probability. Budget verified in target luxury band. Ready for site visit invitation."
        };
      },
      enabled: !!id,
    });
  };

  const useGenerateMessage = () => {
    return useMutation({
      mutationFn: async (opts: FollowUpOptions | string) => {
        await new Promise(r => setTimeout(r, 350));
        if (typeof opts === 'string') {
          return {
            message: generateSmartMessage({ leadName: "Valued Client", context: 'post_call' }),
            text: generateSmartMessage({ leadName: "Valued Client", context: 'post_call' }),
          };
        }
        const text = generateSmartMessage(opts);
        return {
          message: text,
          text: text,
        };
      },
    });
  };

  return {
    useScoreLead,
    useGenerateMessage,
  };
}
