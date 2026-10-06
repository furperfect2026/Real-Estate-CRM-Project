"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Users,
  PhoneCall,
  Shuffle,
  Inbox,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useLeads } from "@/hooks/use-leads";
import { useActiveRole } from "@/hooks/use-active-role";
import { useUsers, TathastuUser, BASELINE_TATHASTU_USERS } from "@/hooks/use-users";

export interface ParsedContact {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  normalized_phone: string;
  email?: string;
  budget: string;
  project_name: string;
  source: string;
  status: "VALID" | "DUPLICATE" | "INVALID";
  status_reason?: string;
  selected: boolean;
}

interface LeadBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadBulkImportModal({ isOpen, onClose }: LeadBulkImportModalProps) {
  const { leads, bulkCreateLeads } = useLeads();
  const { currentUser, isAdmin, isManager } = useActiveRole();
  const { useGetUsers } = useUsers();
  const { data: rawUsers } = useGetUsers();

  const allUsers: TathastuUser[] = (rawUsers && rawUsers.length > 0) ? rawUsers : BASELINE_TATHASTU_USERS;
  const managers = allUsers.filter(u => u.role === 'MANAGER');
  const callers = allUsers.filter(u => u.role === 'EMPLOYEE');

  const [activeTab, setActiveTab] = useState<"file" | "pile">("pile");
  const [rawText, setRawText] = useState("");
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [distributionMode, setDistributionMode] = useState<
    "TO_MANAGER" | "TO_CALLER" | "AUTO_SPLIT" | "UNASSIGNED"
  >(isAdmin ? "TO_MANAGER" : "TO_CALLER");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("mgr_1");
  const [selectedCallerId, setSelectedCallerId] = useState<string>("emp_1");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data to test "pile of data"
  const handleLoadSamplePile = () => {
    const sample = `9820192831 - Rajesh Verma, 3 BHK Kharadi, ₹1.2 Cr
+91 9871234509 Pooja Deshmukh (Interested in Tathastu Heights)
9988776655 Ramesh Kulkarni, Baner 2 BHK 75L
9765432190 - Rohan Mehra (MagicBricks lead)
9811233445, Ananya Iyer, Tathastu Greens
9822019999 - Dr. Sameer Joshi, ₹1.5 Cr, Pride World City
9890123456 Sunita Patel
9823456789 - Vijay Shinde, 2 BHK Tathastu Residency
9876543210 (Duplicate test - matches existing client)
88888 - Invalid Short Number`;
    setRawText(sample);
    parseRawText(sample);
  };

  // Helper to normalize phone
  const cleanPhoneDigits = (raw: string) => {
    return raw.replace(/[^0-9]/g, "");
  };

  // Core parser for unstructured text ("pile of data")
  const parseRawText = (text: string) => {
    if (!text.trim()) {
      setParsedContacts([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const results: ParsedContact[] = [];

    lines.forEach((line, index) => {
      // Look for 10-12 digit sequence with optional +91 or leading 0
      const phoneMatch = line.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|\b\d{5,12}\b/);
      let phone = "";
      let remainingText = line;

      if (phoneMatch) {
        phone = phoneMatch[0].trim();
        remainingText = line.replace(phone, "").trim();
      }

      // Clean up name from remaining text
      let cleanedText = remainingText
        .replace(/^[-–—:,|/\s]+|[-–—:,|/\s]+$/g, "")
        .replace(/\(.*?\)/g, (match) => {
          return match;
        })
        .trim();

      const parts = cleanedText.split(/[-–—,;|]/).map((p) => p.trim()).filter(Boolean);
      let name = parts[0] || `Prospect #${index + 1}`;
      let budget = "₹65 L - ₹1.2 Cr";
      let project = "Tathastu Residency";

      // Detect budget in text
      const budgetMatch = line.match(/₹?\s*(\d+(?:\.\d+)?\s*(?:Cr|Lakhs?|L|Lac))/i);
      if (budgetMatch) {
        budget = budgetMatch[0];
      }

      // Detect project name
      if (line.toLowerCase().includes("heights")) project = "Tathastu Heights";
      else if (line.toLowerCase().includes("greens")) project = "Tathastu Greens";
      else if (line.toLowerCase().includes("pride")) project = "Pride World City";

      // Name splitting
      const nameParts = name.split(/\s+/);
      const firstName = nameParts[0] || "Valued";
      const lastName = nameParts.slice(1).join(" ") || "Client";

      // Phone validation & normalization
      const digits = cleanPhoneDigits(phone);
      let status: "VALID" | "DUPLICATE" | "INVALID" = "VALID";
      let status_reason: string | undefined;

      if (digits.length < 10) {
        status = "INVALID";
        status_reason = "Phone number has fewer than 10 digits";
      } else {
        const last10 = digits.slice(-10);
        // Check duplicate against existing leads
        const existingDuplicate = leads.find((l) => {
          const lDigits = (l.phone || "").replace(/[^0-9]/g, "");
          return lDigits.slice(-10) === last10;
        });

        // Check duplicate within the parsed batch itself
        const inBatchDuplicate = results.find(
          (r) => r.normalized_phone.slice(-10) === last10
        );

        if (existingDuplicate) {
          status = "DUPLICATE";
          status_reason = `Matches existing lead: ${existingDuplicate.first_name} ${existingDuplicate.last_name}`;
        } else if (inBatchDuplicate) {
          status = "DUPLICATE";
          status_reason = `Repeated within this uploaded file/pile`;
        }
      }

      let formattedPhone = phone;
      if (digits.length === 10) {
        formattedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }

      results.push({
        id: `parsed_${index}_${Math.random().toString(36).substring(2, 6)}`,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone || "No Phone",
        normalized_phone: digits,
        budget,
        project_name: project,
        source: "Direct Contact Pile",
        status,
        status_reason,
        selected: status !== "INVALID",
      });
    });

    setParsedContacts(results);
  };

  // File Upload Handler (CSV / XLSX / XLS / TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    const reader = new FileReader();

    if (fileExt === "csv" || fileExt === "txt") {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text, file.name);
      };
      reader.readAsText(file);
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          parseSpreadsheetRows(jsonData, file.name);
        } catch (err) {
          toast.error("Error parsing Excel file. Please ensure it is a valid .xlsx or .xls file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Please upload a .csv, .xlsx, or .xls file");
    }
  };

  // Parse structured CSV text
  const parseCSVText = (csvContent: string, originName: string) => {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    const rows = lines.map((line) => {
      return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
        val.replace(/^["']|["']$/g, "").trim()
      );
    });

    parseSpreadsheetRows(rows, originName);
  };

  // Universal row parser for CSV or Excel sheets
  const parseSpreadsheetRows = (rows: any[][], originName: string) => {
    if (!rows || rows.length === 0) return;

    const headerRow = rows[0].map((h) => String(h || "").toLowerCase());
    let phoneCol = headerRow.findIndex(
      (h) => h.includes("phone") || h.includes("mobile") || h.includes("contact") || h.includes("number")
    );
    let nameCol = headerRow.findIndex(
      (h) => h.includes("name") || h.includes("client") || h.includes("customer")
    );
    let emailCol = headerRow.findIndex((h) => h.includes("email") || h.includes("mail"));
    let budgetCol = headerRow.findIndex((h) => h.includes("budget") || h.includes("price"));
    let projectCol = headerRow.findIndex(
      (h) => h.includes("project") || h.includes("property") || h.includes("location")
    );

    const hasHeader = phoneCol !== -1;
    const startIndex = hasHeader ? 1 : 0;
    if (phoneCol === -1) phoneCol = 1;
    if (nameCol === -1) nameCol = 0;

    const results: ParsedContact[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every((c) => !c)) continue;

      const rawName = String(row[nameCol] || `Client #${i}`).trim();
      const rawPhone = String(row[phoneCol] || "").trim();
      const rawEmail = emailCol !== -1 ? String(row[emailCol] || "").trim() : "";
      const rawBudget = budgetCol !== -1 ? String(row[budgetCol] || "").trim() : "₹75,00,000";
      const rawProject =
        projectCol !== -1 ? String(row[projectCol] || "").trim() : "Tathastu Residency";

      const nameParts = rawName.split(/\s+/);
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.slice(1).join(" ") || "";

      const digits = cleanPhoneDigits(rawPhone);
      let status: "VALID" | "DUPLICATE" | "INVALID" = "VALID";
      let status_reason: string | undefined;

      if (digits.length < 10) {
        status = "INVALID";
        status_reason = "Phone number contains fewer than 10 digits";
      } else {
        const last10 = digits.slice(-10);
        const existingDuplicate = leads.find((l) => {
          const lDigits = (l.phone || "").replace(/[^0-9]/g, "");
          return lDigits.slice(-10) === last10;
        });

        const inBatchDuplicate = results.find(
          (r) => r.normalized_phone.slice(-10) === last10
        );

        if (existingDuplicate) {
          status = "DUPLICATE";
          status_reason = `Matches existing lead: ${existingDuplicate.first_name} ${existingDuplicate.last_name}`;
        } else if (inBatchDuplicate) {
          status = "DUPLICATE";
          status_reason = `Duplicate within this spreadsheet`;
        }
      }

      let formattedPhone = rawPhone;
      if (digits.length === 10) {
        formattedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }

      results.push({
        id: `parsed_sheet_${i}_${Math.random().toString(36).substring(2, 6)}`,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        normalized_phone: digits,
        email: rawEmail,
        budget: rawBudget || "₹75,00,000",
        project_name: rawProject || "Tathastu Residency",
        source: `Excel: ${originName}`,
        status,
        status_reason,
        selected: status !== "INVALID",
      });
    }

    setParsedContacts(results);
    toast.success(`Parsed ${results.length} contacts from ${originName}`);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = `Name,Phone,Budget,Project,Email,Notes
Rahul Sharma,+91 98201 92831,₹1.2 Cr,Tathastu Residency,rahul@example.com,Looking for 3 BHK top floor
Sneha Patil,+91 98712 34509,₹75 Lakhs,Tathastu Heights,sneha@example.com,Family visit next weekend
Amit Deshmukh,+91 99887 76655,₹95 Lakhs,Tathastu Greens,amit@example.com,Pre-approved home loan
Vikram Rao,+91 97654 32190,₹1.4 Cr,Pride World City,vikram@example.com,Investor buyer`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tathastu_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded sample CSV template!");
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setParsedContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedContacts((prev) =>
      prev.map((c) => (c.status !== "INVALID" ? { ...c, selected: select } : c))
    );
  };

  // Execute Bulk Import & Distribute
  const handleExecuteImport = async () => {
    const selectedToImport = parsedContacts.filter((c) => c.selected);
    if (selectedToImport.length === 0) {
      toast.error("Please select at least 1 valid contact to import.");
      return;
    }

    setIsProcessing(true);

    try {
      const payloadLeads = selectedToImport.map((c) => ({
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        email: c.email,
        budget: c.budget,
        project_name: c.project_name,
        source: c.source || "Bulk Ingestion",
        notes: `Imported via bulk batch. ${c.status === "DUPLICATE" ? "[FLAGGED DUPLICATE]" : ""}`,
      }));

      const chosenManager = managers.find(m => m.id === selectedManagerId) || managers[0];
      const chosenCaller = callers.find(c => c.id === selectedCallerId) || callers[0];
      const mgrName = chosenManager ? `${chosenManager.first_name} ${chosenManager.last_name}`.trim() : "Anmol";
      const callerName = chosenCaller ? `${chosenCaller.first_name} ${chosenCaller.last_name}`.trim() : "Gayatri";

      await bulkCreateLeads({
        leads: payloadLeads,
        distribution: {
          mode: distributionMode,
          managerId: chosenManager?.id || "mgr_1",
          managerName: mgrName,
          employeeId: chosenCaller?.id || "emp_1",
          employeeName: callerName,
        },
      });

      let destination = "Central Unassigned Pool";
      if (distributionMode === "TO_MANAGER") destination = `Manager ${mgrName}`;
      else if (distributionMode === "TO_CALLER") destination = `Caller ${callerName}'s Workbench`;
      else if (distributionMode === "AUTO_SPLIT") destination = `Dynamic Team Round-Robin (${callers.length} Active Callers)`;

      toast.success(
        `Successfully imported ${selectedToImport.length} leads and distributed to ${destination}!`,
        {
          duration: 5000,
        }
      );

      onClose();
      // Reset state
      setParsedContacts([]);
      setRawText("");
      setFileName(null);
    } catch (e: any) {
      toast.error("Failed to import leads: " + (e.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalDetected = parsedContacts.length;
  const validCount = parsedContacts.filter((c) => c.status === "VALID").length;
  const duplicateCount = parsedContacts.filter((c) => c.status === "DUPLICATE").length;
  const invalidCount = parsedContacts.filter((c) => c.status === "INVALID").length;
  const selectedCount = parsedContacts.filter((c) => c.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📥 Bulk Import & Distribute Leads</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                    Excel • CSV • Text Pile
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Upload spreadsheet files or paste unstructured raw contact numbers, then auto-distribute to your team.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 h-8"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Ingestion Source Tabs */}
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
            <div className="flex items-center justify-between mb-3">
              <TabsList className="bg-slate-100 border border-slate-200/80 p-1 rounded-xl">
                <TabsTrigger
                  value="pile"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-xs text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Paste Raw Pile of Numbers</span>
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-xs text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Excel / CSV File</span>
                </TabsTrigger>
              </TabsList>

              {activeTab === "pile" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadSamplePile}
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold h-8"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Load Sample Pile
                </Button>
              )}
            </div>

            {/* TAB 1: PASTE RAW PILE OF NUMBERS */}
            <TabsContent value="pile" className="m-0 space-y-2">
              <div className="relative">
                <Textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    parseRawText(e.target.value);
                  }}
                  placeholder={`Paste any text containing phone numbers and names, for example:
9820192831 - Rajesh Verma, 3 BHK Kharadi
+91 9871234509 Pooja Deshmukh
9988776655 Ramesh Kulkarni, Baner 75L
9765432190 - Rohan Mehra`}
                  className="min-h-[140px] text-xs font-mono bg-slate-50/70 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Smart regex automatically detects Indian mobile numbers (10 digits), strips punctuation, and associates client names.</span>
              </p>
            </TabsContent>

            {/* TAB 2: FILE UPLOAD */}
            <TabsContent value="file" className="m-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls, .txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {fileName ? fileName : "Click to select or drag & drop spreadsheet"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files with Name, Phone, Budget columns
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* PARSED SUMMARY BAR */}
          {totalDetected > 0 && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Detected Contacts: <span className="text-primary text-sm">{totalDetected}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {validCount} Clean
                  </Badge>
                  {duplicateCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-[11px]">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {duplicateCount} Duplicates
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 text-[11px]">
                      <XCircle className="w-3 h-3 mr-1" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  className="text-xs h-7 text-slate-600 hover:text-slate-900"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  className="text-xs h-7 text-slate-600 hover:text-slate-900"
                >
                  Deselect
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParsedContacts([]);
                    setRawText("");
                    setFileName(null);
                  }}
                  className="text-xs h-7 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* DISTRIBUTION SELECTOR */}
          {totalDetected > 0 && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                ⚡ Step 2: Instant Team Distribution Strategy
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* 1. Assign to Manager */}
                <div
                  onClick={() => setDistributionMode("TO_MANAGER")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    distributionMode === "TO_MANAGER"
                      ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Sales Manager</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{managers.length} Active</div>
                    </div>
                  </div>
                  {managers.length > 1 ? (
                    <select 
                      value={selectedManagerId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full mt-1.5 p-1 bg-white border border-emerald-300 rounded text-[11px] font-semibold text-slate-800"
                    >
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.first_name} {m.last_name} ({m.emp_id || 'MGR'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Direct into Manager {managers[0]?.first_name || 'Anmol'}&apos;s intake pool.
                    </p>
                  )}
                </div>

                {/* 2. Assign to Caller */}
                <div
                  onClick={() => setDistributionMode("TO_CALLER")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    distributionMode === "TO_CALLER"
                      ? "border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Direct to Caller</div>
                      <div className="text-[10px] text-purple-700 font-semibold">{callers.length} Callers</div>
                    </div>
                  </div>
                  {callers.length > 1 ? (
                    <select 
                      value={selectedCallerId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setSelectedCallerId(e.target.value)}
                      className="w-full mt-1.5 p-1 bg-white border border-purple-300 rounded text-[11px] font-semibold text-slate-800"
                    >
                      {callers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.first_name} {c.last_name} ({c.emp_id || 'CLR'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Direct into {callers[0]?.first_name || 'Gayatri'}&apos;s workbench with Callen ready.
                    </p>
                  )}
                </div>

                {/* 3. Auto-Split Round Robin */}
                <div
                  onClick={() => setDistributionMode("AUTO_SPLIT")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    distributionMode === "AUTO_SPLIT"
                      ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      <Shuffle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Round-Robin Split</div>
                      <div className="text-[10px] text-blue-700 font-semibold">{callers.length} Active Callers</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Equally balances lead allocation across all active callers.
                  </p>
                </div>

                {/* 4. Leave Unassigned */}
                <div
                  onClick={() => setDistributionMode("UNASSIGNED")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    distributionMode === "UNASSIGNED"
                      ? "border-slate-600 bg-slate-100 ring-2 ring-slate-400/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold text-xs">
                      <Inbox className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Central Pool</div>
                      <div className="text-[10px] text-slate-600 font-semibold">Unassigned</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Keep in new lead pool for manual batch assignment later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW TABLE */}
          {totalDetected > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  📋 Contacts Preview ({selectedCount} of {totalDetected} selected)
                </label>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-8">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                          checked={selectedCount === parsedContacts.filter((c) => c.status !== "INVALID").length && selectedCount > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="py-2 px-3">Client Name</th>
                      <th className="py-2 px-3">Phone Number</th>
                      <th className="py-2 px-3">Budget</th>
                      <th className="py-2 px-3">Project</th>
                      <th className="py-2 px-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !contact.selected ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            disabled={contact.status === "INVALID"}
                            checked={contact.selected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {contact.first_name} {contact.last_name}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700">
                          {contact.phone}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{contact.budget}</td>
                        <td className="py-2 px-3 text-slate-600">{contact.project_name}</td>
                        <td className="py-2 px-3">
                          {contact.status === "VALID" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          )}
                          {contact.status === "DUPLICATE" && (
                            <span
                              title={contact.status_reason}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-help"
                            >
                              <AlertTriangle className="w-3 h-3" /> Duplicate
                            </span>
                          )}
                          {contact.status === "INVALID" && (
                            <span
                              title={contact.status_reason}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-help"
                            >
                              <XCircle className="w-3 h-3" /> Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedCount > 0 ? (
              <span>
                Ready to ingest <strong className="text-slate-900">{selectedCount} leads</strong> and route to{" "}
                <strong className="text-primary font-semibold">
                  {distributionMode === "TO_MANAGER"
                    ? "Manager Anmol"
                    : distributionMode === "TO_CALLER"
                    ? "Caller Gayatri"
                    : distributionMode === "AUTO_SPLIT"
                    ? "50/50 Team Split"
                    : "Central Inbound Pool"}
                </strong>
              </span>
            ) : (
              <span>Paste contacts or upload a spreadsheet to begin.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
              className="border-slate-200 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteImport}
              disabled={selectedCount === 0 || isProcessing}
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 h-9 px-4"
            >
              {isProcessing ? (
                <>Importing & Distributing...</>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Import & Distribute ({selectedCount})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
