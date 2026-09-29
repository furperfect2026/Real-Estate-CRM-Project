"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Bot, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  User, 
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  COPILOT_PRESETS, 
  CADENCE_TEMPLATES, 
  generateSmartMessage, 
  FollowUpOptions 
} from "@/hooks/use-ai";
import { useLeads } from "@/hooks/use-leads";
import { Lead } from "@/lib/types";
import { useActiveRole } from "@/hooks/use-active-role";

export default function AIAssistantPage() {
  const { leads } = useLeads();
  const { currentUser } = useActiveRole();

  // Active Tab
  const [activeTab, setActiveTab] = useState("followup");

  // Follow-Up Studio State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [context, setContext] = useState<FollowUpOptions["context"]>("post_call");
  const [tone, setTone] = useState<FollowUpOptions["tone"]>("urgent");
  const [customLeadName, setCustomLeadName] = useState("");
  const [customProperty, setCustomProperty] = useState("Tathastu Grandeur");
  const [customBudget, setCustomBudget] = useState("₹1.20 Cr");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Selected lead object
  const activeLead = leads.find((l: Lead) => l.id === selectedLeadId) || leads[0];

  // Initialize draft when lead or options change
  const currentLeadName = activeLead ? `${activeLead.first_name} ${activeLead.last_name}` : (customLeadName || "Amit Sharma");
  const currentProperty = activeLead?.project_name || customProperty;
  const currentBudget = activeLead?.budget || customBudget;

  const handleGenerate = () => {
    const text = generateSmartMessage({
      leadName: currentLeadName,
      property: currentProperty,
      budget: currentBudget,
      context: context,
      tone: tone,
      agentName: currentUser.name,
    });
    setGeneratedDraft(text);
    toast.success("AI follow-up message generated!");
  };

  // Run generation initially if empty
  if (!generatedDraft && (activeLead || customLeadName)) {
    const initialText = generateSmartMessage({
      leadName: currentLeadName,
      property: currentProperty,
      budget: currentBudget,
      context: context,
      tone: tone,
      agentName: currentUser.name,
    });
    setGeneratedDraft(initialText);
  }

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = activeLead?.phone || "919876543210";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(generatedDraft);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    toast.success("Launching WhatsApp...");
  };

  const handleCreateTask = () => {
    toast.success(`Follow-up task scheduled for ${currentLeadName} on tomorrow's calendar!`);
  };

  // Copilot Chat State
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([
    {
      role: 'assistant',
      text: "👋 Hello! I am your Tathastu Infra Sales Copilot. Ask me how to handle client objections, generate competitive comparisons, or close pending site visits for our projects!"
    }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  const handleSendCopilot = (questionText?: string) => {
    const query = questionText || copilotInput;
    if (!query.trim()) return;

    // Add user query
    setCopilotHistory(prev => [...prev, { role: 'user', text: query }]);
    setCopilotInput("");
    setIsCopilotThinking(true);

    setTimeout(() => {
      // Find matching preset or generate default
      const matched = COPILOT_PRESETS.find(p => 
        p.query.toLowerCase().includes(query.toLowerCase()) || 
        query.toLowerCase().includes(p.title.toLowerCase()) ||
        (query.toLowerCase().includes("price") && p.id === 'objection-price') ||
        (query.toLowerCase().includes("delay") && p.id === 'objection-possession') ||
        (query.toLowerCase().includes("site visit") && p.id === 'closing-site-visit') ||
        (query.toLowerCase().includes("loan") && p.id === 'finance-loan') ||
        (query.toLowerCase().includes("competitor") && p.id === 'objection-comparison')
      );

      const reply = matched 
        ? matched.response 
        : `💡 **Tathastu Sales Strategy Advice:**\n\nFor queries regarding "${query}":\n\n1. Always pivot back to Tathastu Infra's superior carpet ratio (74%) and immediate arterial road access.\n2. Propose a zero-risk 10-minute preview of our furnished model unit.\n3. Reassure the buyer that all booking deposits are 100% refundable within 7 days prior to agreement signing.`;

      setCopilotHistory(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsCopilotThinking(false);
    }, 450);
  };

  // Cadence State
  const [cadences, setCadences] = useState(CADENCE_TEMPLATES);

  const toggleCadence = (idx: number) => {
    setCadences(prev => prev.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
    toast.success("Cadence rule updated");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
            Tathastu Sales Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            AI Sales Copilot & Follow-Up Studio
          </h1>
          <p className="text-sm text-blue-200/90 max-w-2xl">
            Real estate objection handling, personalized WhatsApp follow-ups, and automated lead nurturing for high-conversion closings.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[100px]">
            <span className="text-xs text-blue-200 font-medium">Outreach Boost</span>
            <span className="text-xl font-extrabold text-emerald-400">+42%</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[100px]">
            <span className="text-xs text-blue-200 font-medium">Response Speed</span>
            <span className="text-xl font-extrabold text-blue-300">&lt; 3 mins</span>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200 inline-flex">
          <TabsTrigger 
            value="followup" 
            className="rounded-xl px-5 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Smart Follow-Up Studio
          </TabsTrigger>
          <TabsTrigger 
            value="copilot" 
            className="rounded-xl px-5 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            Deal Copilot & Objection Buster
          </TabsTrigger>
          <TabsTrigger 
            value="cadence" 
            className="rounded-xl px-5 py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            14-Day Nurture Cadence
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: SMART FOLLOW-UP STUDIO */}
        {/* ========================================================= */}
        <TabsContent value="followup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Lead Selection & Parameter Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Lead Selector Card */}
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Target Lead Selection
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Pick an active lead to inject live CRM parameters automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Active Inbound Leads
                    </label>
                    <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                      {leads.map((l: Lead) => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSelectedLeadId(l.id);
                            const name = `${l.first_name} ${l.last_name}`;
                            const proj = l.project_name || "Tathastu Grandeur";
                            const budg = l.budget || "₹95 Lakhs";
                            setGeneratedDraft(generateSmartMessage({
                              leadName: name,
                              property: proj,
                              budget: budg,
                              context: context,
                              tone: tone,
                              agentName: currentUser.name,
                            }));
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            selectedLeadId === l.id
                              ? "bg-blue-50/80 border-blue-500 shadow-2xs text-blue-950"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span>{l.first_name} {l.last_name}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-100 border-slate-300 font-medium">
                                {l.pipeline_stage_id.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>📞 {l.phone}</span>
                              <span>•</span>
                              <span>{l.budget}</span>
                            </div>
                          </div>
                          {selectedLeadId === l.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Lead Snapshot Badge */}
                  {activeLead && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center justify-between">
                        <span>Selected: {activeLead.first_name} {activeLead.last_name}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          HOT LEAD
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Project: <strong className="text-slate-900">{activeLead.project_name || "Tathastu Grandeur"}</strong> | Budget: <strong className="text-slate-900">{activeLead.budget || "₹95 Lakhs"}</strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Context & Tone Modifiers */}
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Scenario & Tone Modifiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Scenario Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Follow-Up Scenario
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'post_call', label: 'Post-Call Summary', icon: PhoneCall },
                        { id: 'intro', label: 'New Intro & Brochure', icon: MessageSquare },
                        { id: 'site_visit_invite', label: 'Site Visit + Cab', icon: Calendar },
                        { id: 'post_visit_close', label: 'Post-Visit Decision', icon: CheckCircle2 },
                        { id: 'limited_offer', label: '48h Launch Offer', icon: Flame },
                        { id: 'cold_revival', label: 'Cold Lead Revival', icon: RefreshCw },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setContext(item.id as any);
                            setGeneratedDraft(generateSmartMessage({
                              leadName: currentLeadName,
                              property: currentProperty,
                              budget: currentBudget,
                              context: item.id as any,
                              tone: tone,
                              agentName: currentUser.name,
                            }));
                          }}
                          className={`h-auto py-2.5 px-3 text-xs justify-start rounded-xl font-medium border ${
                            context === item.id
                              ? "bg-blue-50/80 border-blue-500 text-blue-800 font-bold"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5 mr-1.5 shrink-0 text-blue-600" />
                          <span className="truncate">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Communication Tone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'urgent', label: 'Urgent & Limited-Time', desc: 'Price hike alert' },
                        { id: 'short_whatsapp', label: 'Short & Punchy', desc: 'Quick WhatsApp ping' },
                        { id: 'consultative', label: 'Warm & Consultative', desc: 'Friendly guidance' },
                        { id: 'vip', label: 'VIP Executive', desc: 'Luxury buyer tone' },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setTone(item.id as any);
                            setGeneratedDraft(generateSmartMessage({
                              leadName: currentLeadName,
                              property: currentProperty,
                              budget: currentBudget,
                              context: context,
                              tone: item.id as any,
                              agentName: currentUser.name,
                            }));
                          }}
                          className={`h-auto py-2 px-3 text-xs flex-col items-start rounded-xl font-medium border ${
                            tone === item.id
                              ? "bg-purple-50/80 border-purple-500 text-purple-900 font-bold"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-bold">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Regenerate Follow-Up Message
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Live Message Canvas & 1-Click Outlets */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-white h-full flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Smart WhatsApp & Pitch Preview
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Personalized and ready for instant delivery to {currentLeadName}.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
                    WhatsApp Optimized
                  </Badge>
                </CardHeader>

                <CardContent className="pt-4 flex-1 flex flex-col space-y-4">
                  {/* Message Canvas Box */}
                  <div className="relative flex-1">
                    <Textarea
                      value={generatedDraft}
                      onChange={(e) => setGeneratedDraft(e.target.value)}
                      rows={12}
                      className="w-full font-sans text-xs leading-relaxed text-slate-900 bg-slate-50/50 border-slate-200 rounded-xl p-4 resize-y focus-visible:ring-blue-600 focus-visible:bg-white"
                      placeholder="Generating personalized message..."
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {generatedDraft.length} characters
                    </div>
                  </div>

                  {/* Dynamic Fields Inspector */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Lead Name</span>
                      <strong className="text-slate-900 text-xs truncate block">{currentLeadName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Project</span>
                      <strong className="text-slate-900 text-xs truncate block">{currentProperty}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Sender Rep</span>
                      <strong className="text-slate-900 text-xs truncate block">{currentUser.name}</strong>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {/* Direct WhatsApp Launch */}
                    <Button
                      onClick={handleWhatsApp}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      Send via WhatsApp (wa.me)
                    </Button>

                    {/* Copy to Clipboard */}
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold h-10 px-4 rounded-xl flex items-center gap-2"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? "Copied!" : "Copy Text"}
                    </Button>

                    {/* Schedule Task in CRM */}
                    <Button
                      variant="outline"
                      onClick={handleCreateTask}
                      className="border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-semibold h-10 px-4 rounded-xl flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Log Follow-Up Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: DEAL COPILOT & OBJECTION BUSTER */}
        {/* ========================================================= */}
        <TabsContent value="copilot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Prompt Chips & Presets */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Objection Presets
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Click any scenario to ask Copilot for the winning sales script.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  {COPILOT_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSendCopilot(preset.query)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 flex items-center justify-between">
                        <span>{preset.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{preset.query}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tathastu Project Cheat-sheet */}
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-slate-50/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Active Project Fast Facts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-700">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Tathastu Grandeur:</strong> 3 & 4 BHK Luxury, 74% usable carpet, ₹1.2 Cr - ₹2.1 Cr. Possession Dec 2027.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Tathastu Heights:</strong> 2 & 3 BHK High-rise, ₹75 L - ₹1.1 Cr. 10 mins from IT Hub.
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong>Tathastu Green Acres:</strong> Villa plots & row houses, ₹50 L - ₹95 L. Gated community with clubhouse.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversational Copilot Chat Display */}
            <div className="lg:col-span-8">
              <Card className="border-slate-200 shadow-xs rounded-2xl bg-white flex flex-col h-[600px]">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Tathastu Sales Copilot
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Ask any client negotiation question or objection.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                    Real Estate Specialist
                  </Badge>
                </CardHeader>

                {/* Chat Stream Body */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {copilotHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        item.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {item.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          item.role === 'user'
                            ? 'bg-blue-600 text-white font-medium rounded-tr-xs'
                            : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-xs whitespace-pre-wrap'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}

                  {isCopilotThinking && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      Analyzing Tathastu project inventory and crafting strategy...
                    </div>
                  )}
                </CardContent>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  <Input
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendCopilot();
                    }}
                    placeholder="Type objection, e.g. 'Client says Tathastu is farther than township'..."
                    className="bg-white border-slate-200 text-xs rounded-xl h-10"
                  />
                  <Button
                    onClick={() => handleSendCopilot()}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-4 text-xs font-bold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Ask
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: 14-DAY NURTURE CADENCE */}
        {/* ========================================================= */}
        <TabsContent value="cadence" className="space-y-6">
          <Card className="border-slate-200 shadow-xs rounded-2xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Automated Inbound Lead Nurturing Timeline
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Pre-configured real estate engagement touchpoints to eliminate lead drop-offs.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs">
                  Active Drip Rules
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
                {cadences.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[33px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      step.active 
                        ? "bg-emerald-600 border-white text-white shadow-xs" 
                        : "bg-slate-200 border-white text-slate-500"
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {step.day}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-medium border-slate-300">
                            {step.channel}
                          </Badge>
                          <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
                          "{step.message}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          size="sm"
                          variant={step.active ? "outline" : "secondary"}
                          onClick={() => toggleCadence(idx)}
                          className={`text-xs h-8 rounded-xl font-semibold ${
                            step.active 
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100" 
                              : "text-slate-500 bg-slate-100"
                          }`}
                        >
                          {step.active ? "Active Cadence" : "Paused"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
