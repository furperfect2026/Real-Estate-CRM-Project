export interface MobileLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  property_type: string;
  source: 'Facebook Ads' | '99acres' | 'MagicBricks' | 'Housing.com' | 'Referral';
  status: 'new' | 'contacted' | 'site_visit' | 'negotiation' | 'under_review' | 'booking_done' | 'lost';
  stage_label: string;
  score: number;
  is_hot: boolean;
  assigned_to: string;
  created_at: string;
  last_call_at?: string;
  call_duration?: string;
  recording_url?: string;
  has_recording?: boolean;
  notes?: string;
  site_visit_date?: string;
}

export interface MobileProperty {
  id: string;
  title: string;
  builder: string;
  location: string;
  configuration: string;
  carpet_area: string;
  price_range: string;
  status: 'Ready to Move' | 'Under Construction' | 'Pre-Launch';
  rera_id: string;
  matched_leads_count: number;
}

export const MOCK_LEADS: MobileLead[] = [
  {
    id: 'lead-1',
    name: 'Vikram Rao',
    email: 'vikram.rao@tcs.com',
    phone: '+91 98231 44521',
    budget: '₹85 L - ₹1.10 Cr',
    property_type: '3 BHK Luxury Apartment',
    source: '99acres',
    status: 'contacted',
    stage_label: 'Contacted',
    score: 96,
    is_hot: true,
    assigned_to: 'Gayatri',
    created_at: '2026-10-09T10:15:00Z',
    last_call_at: '2026-10-10T11:00:00Z',
    call_duration: '04m 12s',
    has_recording: true,
    notes: 'Very interested in Pride World City Charholi. Budget pre-approved from HDFC. Site visit scheduled for Sunday.',
    site_visit_date: 'Tomorrow, 11:30 AM',
  },
  {
    id: 'lead-2',
    name: 'Neha Deshmukh',
    email: 'neha.deshmukh@infosys.com',
    phone: '+91 97654 32189',
    budget: '₹1.25 Cr - ₹1.60 Cr',
    property_type: '3 BHK + Terrace Garden',
    source: 'Facebook Ads',
    status: 'site_visit',
    stage_label: 'Site Visit',
    score: 92,
    is_hot: true,
    assigned_to: 'Anmol',
    created_at: '2026-10-08T14:30:00Z',
    last_call_at: '2026-10-09T16:20:00Z',
    call_duration: '03m 45s',
    has_recording: true,
    notes: 'Completed 1st round discussion. Demands cab pickup from Baner to Hinjawadi site.',
    site_visit_date: 'Today, 03:00 PM',
  },
  {
    id: 'lead-3',
    name: 'Amit Verma',
    email: 'amit.verma@techm.com',
    phone: '+91 98901 23456',
    budget: '₹65 L - ₹80 L',
    property_type: '2 BHK Compact Flat',
    source: 'MagicBricks',
    status: 'negotiation',
    stage_label: 'Negotiation',
    score: 88,
    is_hot: false,
    assigned_to: 'Rohit Nalpe',
    created_at: '2026-10-07T09:45:00Z',
    last_call_at: '2026-10-09T18:10:00Z',
    call_duration: '05m 30s',
    has_recording: true,
    notes: 'Negotiating discount on floor rise charges for 12th floor unit.',
  },
  {
    id: 'lead-4',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@wipro.com',
    phone: '+91 91580 98765',
    budget: '₹1.80 Cr - ₹2.40 Cr',
    property_type: '4 BHK Independent Villa',
    source: 'Referral',
    status: 'booking_done',
    stage_label: 'Booking Done',
    score: 99,
    is_hot: true,
    assigned_to: 'Anmol',
    created_at: '2026-10-05T11:20:00Z',
    last_call_at: '2026-10-08T12:00:00Z',
    call_duration: '06m 18s',
    has_recording: true,
    notes: 'Token advance of ₹1,00,000 paid via RTGS. Agreement for sale scheduled next week.',
  },
  {
    id: 'lead-5',
    name: 'Rahul Kulkarni',
    email: 'rahul.kulkarni@accenture.com',
    phone: '+91 98220 54321',
    budget: '₹75 L - ₹95 L',
    property_type: '2.5 BHK East Facing',
    source: 'Facebook Ads',
    status: 'new',
    stage_label: 'New Lead',
    score: 84,
    is_hot: false,
    assigned_to: 'Gayatri',
    created_at: '2026-10-10T09:00:00Z',
    notes: 'Fresh inquiry from Facebook carousel ad. Waiting for first call.',
  },
  {
    id: 'lead-6',
    name: 'Suresh Patil',
    email: 'suresh.patil@kpit.com',
    phone: '+91 94220 11223',
    budget: '₹1.10 Cr - ₹1.35 Cr',
    property_type: '3 BHK High Rise',
    source: 'Housing.com',
    status: 'contacted',
    stage_label: 'Contacted',
    score: 79,
    is_hot: false,
    assigned_to: 'Gayatri',
    created_at: '2026-10-08T16:15:00Z',
    last_call_at: '2026-10-09T14:40:00Z',
    call_duration: '02m 10s',
    notes: 'Requested brochure over WhatsApp. Interested in Kharadi and Wagholi belt.',
  },
  {
    id: 'lead-7',
    name: 'Priya Nair',
    email: 'priya.nair@barclays.com',
    phone: '+91 99230 87654',
    budget: '₹1.50 Cr - ₹1.90 Cr',
    property_type: '3 BHK Penthouse',
    source: '99acres',
    status: 'under_review',
    stage_label: 'Under Review',
    score: 91,
    is_hot: true,
    assigned_to: 'Anmol',
    created_at: '2026-10-06T12:00:00Z',
    notes: 'Legal vetting of draft agreement underway with client lawyer.',
  },
  {
    id: 'lead-8',
    name: 'Rajesh Shinde',
    email: 'rajesh.shinde@cummins.com',
    phone: '+91 98811 77665',
    budget: '₹55 L - ₹68 L',
    property_type: '2 BHK Ready Possession',
    source: 'MagicBricks',
    status: 'site_visit',
    stage_label: 'Site Visit',
    score: 85,
    is_hot: false,
    assigned_to: 'Gayatri',
    created_at: '2026-10-07T15:30:00Z',
    site_visit_date: 'Tomorrow, 04:00 PM',
    notes: 'Looking for immediate possession for tax saving purposes.',
  },
];

export const MOCK_PROPERTIES: MobileProperty[] = [
  {
    id: 'prop-1',
    title: 'Pride World City — Kingsbury',
    builder: 'Pride Group & Tathastu Infra',
    location: 'Charholi BK, Near Lohegaon, Pune',
    configuration: '2 & 3 BHK Luxury Units',
    carpet_area: '745 - 1,120 sq.ft.',
    price_range: '₹68 L - ₹1.15 Cr',
    status: 'Under Construction',
    rera_id: 'P52100019640',
    matched_leads_count: 5,
  },
  {
    id: 'prop-2',
    title: 'Godrej Hillside Phase 2',
    builder: 'Godrej Properties',
    location: 'Mahalunge, Baner Annexe, Pune',
    configuration: '2 & 3 BHK Nature Homes',
    carpet_area: '690 - 980 sq.ft.',
    price_range: '₹75 L - ₹1.45 Cr',
    status: 'Under Construction',
    rera_id: 'P52100022415',
    matched_leads_count: 4,
  },
  {
    id: 'prop-3',
    title: 'Life Republic by Kolte Patil',
    builder: 'Kolte Patil Developers',
    location: 'Hinjawadi IT Park, Pune',
    configuration: '2, 3 & 4 BHK Smart Homes',
    carpet_area: '810 - 1,450 sq.ft.',
    price_range: '₹82 L - ₹1.85 Cr',
    status: 'Ready to Move',
    rera_id: 'P52100027629',
    matched_leads_count: 6,
  },
  {
    id: 'prop-4',
    title: 'VTP Bellissimo Township',
    builder: 'VTP Realty',
    location: 'Hinjawadi Phase 1, Pune',
    configuration: '2 & 3 BHK Premium High-Rise',
    carpet_area: '780 - 1,090 sq.ft.',
    price_range: '₹78 L - ₹1.35 Cr',
    status: 'Under Construction',
    rera_id: 'P52100033888',
    matched_leads_count: 3,
  },
  {
    id: 'prop-5',
    title: 'Amanora Park Town — Gold Towers',
    builder: 'City Corporation',
    location: 'Hadapsar, Magarpatta Road, Pune',
    configuration: '3 & 4 BHK Signature Suites',
    carpet_area: '1,250 - 2,100 sq.ft.',
    price_range: '₹1.60 Cr - ₹3.20 Cr',
    status: 'Ready to Move',
    rera_id: 'P52100000340',
    matched_leads_count: 2,
  },
];

export const PIPELINE_STAGES = [
  { id: 'new', label: 'New Lead', count: 245, value: '₹12.4 Cr', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', count: 382, value: '₹18.6 Cr', color: '#8b5cf6' },
  { id: 'site_visit', label: 'Site Visit', count: 148, value: '₹9.2 Cr', color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', count: 89, value: '₹5.4 Cr', color: '#ec4899' },
  { id: 'under_review', label: 'Under Review', count: 34, value: '₹2.8 Cr', color: '#6366f1' },
  { id: 'booking_done', label: 'Booking Done', count: 42, value: '₹18.4 Cr', color: '#10b981' },
  { id: 'lost', label: 'Lost / Inactive', count: 58, value: '₹3.1 Cr', color: '#ef4444' },
];

export const TEAM_LEADERBOARD = [
  { rank: 1, name: 'Anmol', role: 'Sales Head', deals: 16, revenue: '₹7.8 Cr', conversion: '32%' },
  { rank: 2, name: 'Gayatri', role: 'Sr. Telecaller', deals: 12, revenue: '₹4.6 Cr', conversion: '28%' },
  { rank: 3, name: 'Priya Sharma', role: 'Executive', deals: 9, revenue: '₹3.9 Cr', conversion: '24%' },
  { rank: 4, name: 'Rohit Nalpe', role: 'Director', deals: 5, revenue: '₹2.1 Cr', conversion: '45%' },
];
