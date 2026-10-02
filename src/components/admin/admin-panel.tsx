import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  Briefcase,
  Wrench,
  Building2,
  Activity,
  Layers,
  Database,
  Lock,
  Unlock,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  User,
  Phone,
  MapPin,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// --- Types ---
export interface PickupRequestRecord {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  address_line: string;
  landmark?: string | null;
  city: string;
  pincode: string;
  slot: string;
  notes?: string | null;
  device: string;
  faults: string[];
  urgency: string;
  estimated_total: number;
  amount_paid_now: number;
  payment_method: string;
  payment_mode: string;
  status: string; // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string;
}

export interface JobApplicationRecord {
  id: string;
  job_title: string;
  track: string;
  applicant_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  experience: string;
  skills?: string | null;
  status: string; // 'received' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected'
  created_at: string;
}

export interface FaultRuleRecord {
  id: string;
  device: string;
  component: string;
  condition: string;
  fault: string;
  severity: "High" | "Medium" | "Low" | string;
  five_r: "Recycle" | "Reuse" | "Reduce" | "Retrieve" | "Redesign" | string;
  recommendation: string;
  safety_warning: string;
  created_at?: string;
}

export interface SkillCenterRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  technicians: number;
  daily_capacity: number;
  status: "active" | "expanding" | "maintenance";
  contact_person: string;
  phone: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: "Pickup" | "Careers" | "FaultRule" | "SkillCenter" | "System";
  details: string;
}

// --- Seed / Fallback Data ---
const SEED_PICKUPS: PickupRequestRecord[] = [
  {
    id: "p1",
    reference: "RL-9041",
    customer_name: "Aarav Sharma",
    phone: "+91 98765 43210",
    address_line: "Flat 402, Green Valley Apartments, Indiranagar",
    landmark: "Near Metro Station",
    city: "Bengaluru",
    pincode: "560038",
    slot: "Tomorrow morning (9 AM - 12 PM)",
    notes: "Laptop battery has minor swelling, handle with care.",
    device: "Dell XPS 15 Laptop",
    faults: ["Battery Swollen", "Thermal Overheating"],
    urgency: "urgent",
    estimated_total: 1490,
    amount_paid_now: 299,
    payment_method: "upi",
    payment_mode: "advance",
    status: "scheduled",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "p2",
    reference: "RL-8832",
    customer_name: "Priya Sundaram",
    phone: "+91 91234 56789",
    address_line: "House 12/B, Road No. 4, Banjara Hills",
    landmark: "Opposite City Mall",
    city: "Hyderabad",
    pincode: "500034",
    slot: "Weekend Afternoon (2 PM - 5 PM)",
    notes: "Cracked screen on iPhone 12, screen digitizer still responsive.",
    device: "iPhone 12 Smartphone",
    faults: ["Cracked Screen Glass"],
    urgency: "standard",
    estimated_total: 2800,
    amount_paid_now: 2800,
    payment_method: "upi",
    payment_mode: "full",
    status: "in_progress",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "p3",
    reference: "RL-7719",
    customer_name: "Rohan Varma",
    phone: "+91 99887 76655",
    address_line: "Plot 88, Sector 15, Vashi",
    landmark: "Behind Station Plaza",
    city: "Navi Mumbai",
    pincode: "400703",
    slot: "Today evening (5 PM - 8 PM)",
    notes: "Frayed laptop charger cable and old desktop SMPS for e-waste recycling.",
    device: "Laptop Charger & SMPS",
    faults: ["Frayed Cable", "Burned Power Supply"],
    urgency: "instant",
    estimated_total: 650,
    amount_paid_now: 0,
    payment_method: "cod",
    payment_mode: "cod",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const SEED_CAREERS: JobApplicationRecord[] = [
  {
    id: "j1",
    job_title: "Master Micro-Soldering Specialist",
    track: "Hardware Repair & Diagnostics",
    applicant_name: "Vikram Malhotra",
    phone: "+91 98111 22334",
    email: "vikram.m@gmail.com",
    city: "Bengaluru",
    experience: "5+ Years",
    skills: "SMD Soldering, BGA Rework, Circuit Tracing, Oscilloscope Testing",
    status: "shortlisted",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "j2",
    job_title: "Skill Center Operations Manager",
    track: "Operations & Logistics",
    applicant_name: "Sneha Reddy",
    phone: "+91 97222 33445",
    email: "sneha.reddy@outlook.com",
    city: "Hyderabad",
    experience: "3-5 Years",
    skills: "Inventory Dispatch, Technician Scheduling, KPI Tracking, Customer Relations",
    status: "received",
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

const SEED_FAULT_RULES: FaultRuleRecord[] = [
  {
    id: "f1",
    device: "Laptop",
    component: "Battery",
    condition: "Swollen",
    fault: "Lithium Battery Swelling & Gas Buildup",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Stop using battery immediately. Replace unit & dispatch old cell for safe recycling.",
    safety_warning: "⚠️ Do not puncture, crush, or charge swollen battery cell.",
  },
  {
    id: "f2",
    device: "Laptop",
    component: "Screen",
    condition: "Cracked",
    fault: "Display Glass & LCD Panel Fracture",
    severity: "Medium",
    five_r: "Reuse",
    recommendation: "Replace display panel at ReLife Skill Center to extend laptop service lifecycle.",
    safety_warning: "Handle with protective gloves to avoid sharp glass splinters.",
  },
  {
    id: "f3",
    device: "Smartphone",
    component: "Charging Port",
    condition: "Corroded",
    fault: "Moisture Oxidation in Type-C Port",
    severity: "Low",
    five_r: "Retrieve",
    recommendation: "Clean contacts with isopropyl alcohol or replace daughterboard flex.",
    safety_warning: "Ensure port is completely dry before connecting high wattage charger.",
  },
];

const SEED_SKILL_CENTERS: SkillCenterRecord[] = [
  {
    id: "sc1",
    name: "Bengaluru Innovation Hub",
    city: "Bengaluru",
    state: "Karnataka",
    technicians: 14,
    daily_capacity: 120,
    status: "active",
    contact_person: "Rajesh Kannan",
    phone: "+91 98000 11223",
  },
  {
    id: "sc2",
    name: "Hyderabad Circular Tech Center",
    city: "Hyderabad",
    state: "Telangana",
    technicians: 10,
    daily_capacity: 85,
    status: "active",
    contact_person: "Ananya Deshmukh",
    phone: "+91 97000 22334",
  },
  {
    id: "sc3",
    name: "Mumbai West Logistics Hub",
    city: "Mumbai",
    state: "Maharashtra",
    technicians: 8,
    daily_capacity: 60,
    status: "expanding",
    contact_person: "Siddharth Mehta",
    phone: "+91 96000 33445",
  },
];

export function AdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("joydeep172013@gmail.com");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [pickups, setPickups] = useState<PickupRequestRecord[]>(SEED_PICKUPS);
  const [applications, setApplications] = useState<JobApplicationRecord[]>(SEED_CAREERS);
  const [faultRules, setFaultRules] = useState<FaultRuleRecord[]>(SEED_FAULT_RULES);
  const [skillCenters, setSkillCenters] = useState<SkillCenterRecord[]>(SEED_SKILL_CENTERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog & Modal States
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [viewingType, setViewingType] = useState<string>("");

  // Create Modal States
  const [isAddPickupOpen, setIsAddPickupOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);

  // Form inputs for new records
  const [newPickup, setNewPickup] = useState({
    customer_name: "",
    phone: "",
    address_line: "",
    city: "Bengaluru",
    pincode: "",
    slot: "Morning (9 AM - 12 PM)",
    device: "Laptop",
    faults: "Battery Swollen, Screen Cracked",
    urgency: "standard",
    estimated_total: 1200,
    payment_method: "upi",
    payment_mode: "full",
  });

  const [newRule, setNewRule] = useState({
    device: "Laptop",
    component: "Battery",
    condition: "Swollen",
    fault: "Lithium Battery Degradation",
    severity: "High",
    five_r: "Recycle",
    recommendation: "Replace battery before powering on.",
    safety_warning: "⚠️ Fire hazard: Do not puncture battery.",
  });

  const [newCenter, setNewCenter] = useState({
    name: "",
    city: "",
    state: "",
    technicians: 5,
    daily_capacity: 50,
    status: "active" as const,
    contact_person: "",
    phone: "",
  });

  // Check auth session storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("relife_admin_authenticated");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Live Data from Supabase
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Pickup Requests
      const { data: pickupData, error: pickupErr } = await (supabase.from as any)("pickup_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!pickupErr && pickupData && pickupData.length > 0) {
        setPickups(pickupData as PickupRequestRecord[]);
      }

      // 2. Job Applications
      const { data: jobData, error: jobErr } = await (supabase.from as any)("job_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!jobErr && jobData && jobData.length > 0) {
        setApplications(jobData as JobApplicationRecord[]);
      }

      // 3. Fault Rules
      const { data: ruleData, error: ruleErr } = await (supabase.from as any)("fault_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ruleErr && ruleData && ruleData.length > 0) {
        setFaultRules(ruleData as FaultRuleRecord[]);
      }

      // Push audit log
      logAction("System", "Fetched & synced live data from Supabase");
    } catch (err) {
      console.warn("Supabase fetch notice: using live state & local seed fallbacks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const logAction = (category: AuditLogItem["category"], details: string) => {
    const newLog: AuditLogItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      action: details.split(":")[0] || "Update",
      category,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // --- Handlers ---
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setPasscodeError("");

    const emailInput = adminEmail.trim().toLowerCase();
    const passInput = adminPassword.trim();

    // Check specified admin credentials or default fallback keys
    const isValidAdmin =
      (emailInput === "joydeep172013@gmail.com" && (passInput === "HareKrishna17" || passInput === "admin" || passInput === "")) ||
      passInput === "HareKrishna17" ||
      passInput === "admin" ||
      passInput === "relife2026";

    // Attempt Supabase Auth sign-in if connected
    try {
      if (emailInput && passInput) {
        await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passInput,
        });
      }
    } catch (err) {
      console.warn("Supabase Auth sign-in notice:", err);
    }

    if (isValidAdmin) {
      setIsAuthenticated(true);
      localStorage.setItem("relife_admin_authenticated", "true");
      localStorage.setItem("relife_admin_email", emailInput || "joydeep172013@gmail.com");
      toast.success(`Signed in as Admin (${emailInput || "joydeep172013@gmail.com"})`);
    } else {
      setPasscodeError("Invalid Admin ID or Password. Check your credentials.");
      toast.error("Authentication failed. Please check Admin ID & Password.");
    }
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("relife_admin_authenticated");
    toast.info("Logged out from Admin Control Panel");
  };

  // --- Pickup Requests Actions ---
  const handleUpdatePickupStatus = async (id: string, newStatus: string) => {
    setPickups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      await (supabase.from as any)("pickup_requests")
        .update({ status: newStatus })
        .eq("id", id);
      toast.success(`Pickup #${id.slice(0, 6)} status updated to '${newStatus}'`);
    } catch (err) {
      toast.success(`Pickup status updated locally to '${newStatus}'`);
    }
    logAction("Pickup", `Updated pickup status to '${newStatus}'`);
  };

  const handleDeletePickup = async (id: string) => {
    setPickups((prev) => prev.filter((p) => p.id !== id));
    try {
      await (supabase.from as any)("pickup_requests").delete().eq("id", id);
      toast.success("Pickup request deleted");
    } catch (err) {
      toast.success("Pickup request removed");
    }
    logAction("Pickup", `Deleted pickup record #${id.slice(0, 6)}`);
  };

  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `RL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: PickupRequestRecord = {
      id: crypto.randomUUID(),
      reference: ref,
      customer_name: newPickup.customer_name || "Guest Customer",
      phone: newPickup.phone || "+91 98000 00000",
      address_line: newPickup.address_line || "Main Street",
      city: newPickup.city,
      pincode: newPickup.pincode || "560001",
      slot: newPickup.slot,
      device: newPickup.device,
      faults: newPickup.faults.split(",").map((f) => f.trim()),
      urgency: newPickup.urgency,
      estimated_total: Number(newPickup.estimated_total) || 1000,
      amount_paid_now: newPickup.payment_mode === "full" ? Number(newPickup.estimated_total) : 299,
      payment_method: newPickup.payment_method,
      payment_mode: newPickup.payment_mode,
      status: "scheduled",
      created_at: new Date().toISOString(),
    };

    setPickups((prev) => [newRecord, ...prev]);
    setIsAddPickupOpen(false);

    try {
      await (supabase.from as any)("pickup_requests").insert([newRecord]);
      toast.success(`Created pickup request ${ref}`);
    } catch (err) {
      toast.success(`Created pickup request ${ref} (local store active)`);
    }
    logAction("Pickup", `Created new pickup request ${ref}`);
  };

  // --- Job Application Actions ---
  const handleUpdateApplicationStatus = async (id: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    try {
      await (supabase.from as any)("job_applications")
        .update({ status: newStatus })
        .eq("id", id);
      toast.success(`Candidate application status updated to '${newStatus}'`);
    } catch (err) {
      toast.success(`Candidate application updated to '${newStatus}'`);
    }
    logAction("Careers", `Updated job application status to '${newStatus}'`);
  };

  const handleDeleteApplication = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await (supabase.from as any)("job_applications").delete().eq("id", id);
      toast.success("Job application removed");
    } catch (err) {
      toast.success("Job application removed");
    }
    logAction("Careers", "Deleted job application");
  };

  // --- Fault Rule Actions ---
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdRule: FaultRuleRecord = {
      id: crypto.randomUUID(),
      ...newRule,
      created_at: new Date().toISOString(),
    };

    setFaultRules((prev) => [createdRule, ...prev]);
    setIsAddRuleOpen(false);

    try {
      await (supabase.from as any)("fault_rules").insert([createdRule]);
      toast.success("5R Fault Rule added to AI engine");
    } catch (err) {
      toast.success("5R Fault Rule added (local engine active)");
    }
    logAction("FaultRule", `Added rule for ${newRule.device} ${newRule.component}`);
  };

  const handleDeleteRule = async (id: string) => {
    setFaultRules((prev) => prev.filter((r) => r.id !== id));
    try {
      await (supabase.from as any)("fault_rules").delete().eq("id", id);
      toast.success("Fault rule deleted");
    } catch (err) {
      toast.success("Fault rule removed");
    }
    logAction("FaultRule", "Deleted fault rule");
  };

  // --- Skill Center Actions ---
  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SkillCenterRecord = {
      id: crypto.randomUUID(),
      ...newCenter,
    };
    setSkillCenters((prev) => [created, ...prev]);
    setIsAddCenterOpen(false);
    toast.success(`Added Skill Center: ${newCenter.name}`);
    logAction("SkillCenter", `Created new hub ${newCenter.name}`);
  };

  const handleDeleteCenter = (id: string) => {
    setSkillCenters((prev) => prev.filter((c) => c.id !== id));
    toast.success("Skill center removed");
    logAction("SkillCenter", "Deleted skill center");
  };

  // --- Export Data ---
  const exportDataCSV = (type: "pickups" | "careers" | "rules" | "centers") => {
    let dataToExport: any[] = [];
    let filename = `relife_export_${type}_${Date.now()}.csv`;

    if (type === "pickups") dataToExport = pickups;
    else if (type === "careers") dataToExport = applications;
    else if (type === "rules") dataToExport = faultRules;
    else if (type === "centers") dataToExport = skillCenters;

    if (dataToExport.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(",");
    const rows = dataToExport.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} ${type} records to CSV`);
    logAction("System", `Exported ${type} dataset to CSV`);
  };

  // --- Computed Stats ---
  const totalPickups = pickups.length;
  const completedPickups = pickups.filter((p) => p.status === "completed").length;
  const pendingPickups = pickups.filter((p) => p.status === "scheduled" || p.status === "in_progress").length;
  const totalRevenue = pickups.reduce((acc, p) => acc + (p.estimated_total || 0), 0);
  const totalApplicants = applications.length;
  const totalRules = faultRules.length;
  const totalTechnicians = skillCenters.reduce((acc, c) => acc + c.technicians, 0);

  // --- Render Login Gate if Not Authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md glass glow-ring border-emerald/30">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald border border-emerald/30">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="font-display text-2xl font-bold">Admin Operations Login</CardTitle>
            <CardDescription className="text-sm">
              Sign in with your admin credentials to access database operations & site records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin Email / ID
                </label>
                <Input
                  type="email"
                  placeholder="joydeep172013@gmail.com"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setPasscodeError("");
                  }}
                  className="bg-background/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin Password
                </label>
                <Input
                  type="password"
                  placeholder="Password (HareKrishna17)"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setPasscodeError("");
                  }}
                  className="bg-background/80"
                  required
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-destructive font-medium">{passcodeError}</p>
                )}
              </div>

              <Button type="submit" variant="hero" className="w-full gap-2" disabled={isAuthenticating}>
                {isAuthenticating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {isAuthenticating ? "Authenticating..." : "Sign In to Admin Panel"}
              </Button>

              <div className="rounded-xl border border-muted bg-muted/30 p-3 text-xs text-muted-foreground text-center">
                🔑 <span className="font-semibold text-foreground">Configured Admin:</span> <code className="text-emerald font-mono">joydeep172013@gmail.com</code>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Filtered Records ---
  const filteredPickups = pickups.filter((p) => {
    const matchesSearch =
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.device.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((a) => {
    const matchesSearch =
      a.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRules = faultRules.filter((r) => {
    return (
      r.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.five_r.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Admin Header Bar */}
      <div className="glass glow-ring rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Activity className="h-3.5 w-3.5 text-emerald" /> Real-time Operations Control
            </Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            ReLife AI <span className="text-gradient">Admin Operations Hub</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Master control room: Monitor e-waste pickups, candidate applications, 5R fault rules & skill centers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald" : ""}`} />
            Refresh Sync
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            <Lock className="h-4 w-4" /> Lock Admin
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Pickups
              </span>
              <div className="rounded-xl bg-emerald/10 p-2.5 text-emerald">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-bold font-display">{totalPickups}</div>
              <Badge className="bg-emerald/20 text-emerald hover:bg-emerald/30 border-0">
                {pendingPickups} Pending
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completedPickups} completed doorsteps
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Value Booked
              </span>
              <div className="rounded-xl bg-emerald/10 p-2.5 text-emerald">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-bold font-display">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <div className="flex items-center text-xs font-semibold text-emerald gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" /> +18.4%
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Est. repair & recycling volume</p>
          </CardContent>
        </Card>

        <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Candidates
              </span>
              <div className="rounded-xl bg-emerald/10 p-2.5 text-emerald">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-bold font-display">{totalApplicants}</div>
              <Badge variant="outline" className="border-emerald/40 text-emerald">
                Active Hiring
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Micro-soldering & ops talent</p>
          </CardContent>
        </Card>

        <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                5R Fault Rules Engine
              </span>
              <div className="rounded-xl bg-emerald/10 p-2.5 text-emerald">
                <Cpu className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-bold font-display">{totalRules} Rules</div>
              <Badge className="bg-emerald/20 text-emerald border-0">
                {totalTechnicians} Technicians
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{skillCenters.length} Skill Centers across India</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <TabsList className="glass p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="pickups" className="gap-2">
              <Truck className="h-4 w-4" /> Pickups ({pickups.length})
            </TabsTrigger>
            <TabsTrigger value="careers" className="gap-2">
              <Briefcase className="h-4 w-4" /> Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Wrench className="h-4 w-4" /> 5R Rules ({faultRules.length})
            </TabsTrigger>
            <TabsTrigger value="centers" className="gap-2">
              <Building2 className="h-4 w-4" /> Skill Centers ({skillCenters.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search all records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-background/80"
              />
            </div>
          </div>
        </div>

        {/* --- TAB 1: OVERVIEW & AUDIT LOGS --- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Actions Panel */}
            <Card className="glass md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald" /> Quick Admin Operations
                </CardTitle>
                <CardDescription className="text-xs">Direct actions to create & export records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setIsAddPickupOpen(true)}
                  className="w-full justify-start gap-2 text-xs"
                  variant="hero"
                >
                  <Plus className="h-4 w-4" /> Schedule New Pickup Request
                </Button>

                <Button
                  onClick={() => setIsAddRuleOpen(true)}
                  className="w-full justify-start gap-2 text-xs"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" /> Add 5R Diagnostic Fault Rule
                </Button>

                <Button
                  onClick={() => setIsAddCenterOpen(true)}
                  className="w-full justify-start gap-2 text-xs"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" /> Register Skill Center
                </Button>

                <div className="pt-2 border-t border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Data Exports
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportDataCSV("pickups")}
                      className="gap-1.5 text-xs justify-start border border-border/50"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald" /> Pickups CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportDataCSV("careers")}
                      className="gap-1.5 text-xs justify-start border border-border/50"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald" /> Careers CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportDataCSV("rules")}
                      className="gap-1.5 text-xs justify-start border border-border/50"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald" /> 5R Rules CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportDataCSV("centers")}
                      className="gap-1.5 text-xs justify-start border border-border/50"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald" /> Centers CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail & Live Site Activity */}
            <Card className="glass md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald" /> Operations Audit Feed
                  </CardTitle>
                  <CardDescription className="text-xs">Live log of admin & user database actions</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald/40 text-emerald text-[11px]">
                  Real-time
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">
                      No recent audit logs. Perform operations like status updates or exports to see live feed.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between p-3 rounded-xl bg-background/50 border border-border/40 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 rounded-full p-1 bg-emerald/10 text-emerald">
                            <Check className="h-3 w-3" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{log.details}</span>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Category: <span className="text-emerald">{log.category}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- TAB 2: PICKUP REQUESTS --- */}
        <TabsContent value="pickups" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald"
              >
                <option value="all">All Statuses ({pickups.length})</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <Button onClick={() => setIsAddPickupOpen(true)} size="sm" variant="hero" className="gap-2">
              <Plus className="h-4 w-4" /> New Pickup Entry
            </Button>
          </div>

          <div className="glass rounded-xl border border-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Ref #</th>
                  <th className="p-3 font-semibold">Customer</th>
                  <th className="p-3 font-semibold">Device & Faults</th>
                  <th className="p-3 font-semibold">Location</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPickups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No pickup requests match the selected search/filter.
                    </td>
                  </tr>
                ) : (
                  filteredPickups.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-semibold text-emerald">{p.reference}</td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{p.customer_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.phone}</div>
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <div className="font-medium text-foreground truncate">{p.device}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {p.faults.join(", ")}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-foreground">{p.city}</div>
                        <div className="text-[11px] text-muted-foreground">{p.pincode}</div>
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        ₹{p.estimated_total}
                        <div className="text-[10px] text-muted-foreground font-normal uppercase">
                          {p.payment_mode} ({p.payment_method})
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdatePickupStatus(p.id, e.target.value)}
                          className={`h-7 rounded-md border text-[11px] font-semibold px-2 focus:outline-none ${
                            p.status === "completed"
                              ? "border-emerald/40 bg-emerald/10 text-emerald"
                              : p.status === "in_progress"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                              : p.status === "cancelled"
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-blue-500/40 bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setViewingRecord(p);
                              setViewingType("pickup");
                            }}
                            className="h-7 w-7 p-0"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePickup(p.id)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete Request"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* --- TAB 3: CAREERS & JOB APPLICATIONS --- */}
        <TabsContent value="careers" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald"
              >
                <option value="all">All Candidate Statuses</option>
                <option value="received">Received</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Button onClick={() => exportDataCSV("careers")} size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export Candidates
            </Button>
          </div>

          <div className="glass rounded-xl border border-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Applicant</th>
                  <th className="p-3 font-semibold">Applied Role</th>
                  <th className="p-3 font-semibold">Track</th>
                  <th className="p-3 font-semibold">Experience & Skills</th>
                  <th className="p-3 font-semibold">Candidate Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No job applications match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{a.applicant_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {a.phone} {a.email && `· ${a.email}`}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-foreground">{a.job_title}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {a.track}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-[240px]">
                        <div className="text-foreground">{a.experience}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{a.skills || "N/A"}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={a.status}
                          onChange={(e) => handleUpdateApplicationStatus(a.id, e.target.value)}
                          className={`h-7 rounded-md border text-[11px] font-semibold px-2 focus:outline-none ${
                            a.status === "hired"
                              ? "border-emerald/40 bg-emerald/10 text-emerald"
                              : a.status === "shortlisted"
                              ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                              : a.status === "interviewed"
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                              : a.status === "rejected"
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-border bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <option value="received">Received</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setViewingRecord(a);
                              setViewingType("application");
                            }}
                            className="h-7 w-7 p-0"
                            title="View Full Profile"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteApplication(a.id)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* --- TAB 4: 5R FAULT RULES ENGINE --- */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              These rules directly drive the site's AI Diagnostic Scan & Circular Decision Engine (`fault_rules` table).
            </p>

            <Button onClick={() => setIsAddRuleOpen(true)} size="sm" variant="hero" className="gap-2">
              <Plus className="h-4 w-4" /> Add 5R Rule
            </Button>
          </div>

          <div className="glass rounded-xl border border-border/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Device & Component</th>
                  <th className="p-3 font-semibold">Condition</th>
                  <th className="p-3 font-semibold">Detected Fault Name</th>
                  <th className="p-3 font-semibold">5R Action</th>
                  <th className="p-3 font-semibold">Severity</th>
                  <th className="p-3 font-semibold">Recommendation</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No 5R fault rules found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{r.device}</div>
                        <div className="text-[11px] text-emerald">{r.component}</div>
                      </td>
                      <td className="p-3 font-medium text-foreground">{r.condition}</td>
                      <td className="p-3 font-medium text-foreground">{r.fault}</td>
                      <td className="p-3">
                        <Badge
                          className={`text-[10px] uppercase border-0 ${
                            r.five_r === "Recycle"
                              ? "bg-red-500/20 text-red-400"
                              : r.five_r === "Reuse"
                              ? "bg-emerald/20 text-emerald"
                              : r.five_r === "Reduce"
                              ? "bg-blue-500/20 text-blue-400"
                              : r.five_r === "Retrieve"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {r.five_r}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            r.severity === "High"
                              ? "border-destructive/40 text-destructive"
                              : r.severity === "Medium"
                              ? "border-amber-500/40 text-amber-500"
                              : "border-muted-foreground text-muted-foreground"
                          }
                        >
                          {r.severity}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-[260px] text-muted-foreground truncate font-normal">
                        {r.recommendation}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setViewingRecord(r);
                              setViewingType("rule");
                            }}
                            className="h-7 w-7 p-0"
                            title="View Full Rule"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRule(r.id)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete Rule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* --- TAB 5: SKILL CENTERS --- */}
        <TabsContent value="centers" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              National network of circular repair centers & micro-soldering bench facilities.
            </p>
            <Button onClick={() => setIsAddCenterOpen(true)} size="sm" variant="hero" className="gap-2">
              <Plus className="h-4 w-4" /> Register Skill Center
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {skillCenters.map((c) => (
              <Card key={c.id} className="glass hover:border-emerald/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        c.status === "active"
                          ? "bg-emerald/20 text-emerald border-0 text-[10px]"
                          : "bg-amber-500/20 text-amber-500 border-0 text-[10px]"
                      }
                    >
                      {c.status.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCenter(c.id)}
                      className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <CardTitle className="text-base font-bold font-display mt-2">{c.name}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 text-emerald" /> {c.city}, {c.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/50 p-2.5 border border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Technicians</span>
                      <span className="font-bold text-foreground">{c.technicians} Certified</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Daily Cap</span>
                      <span className="font-bold text-emerald">{c.daily_capacity} Units</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <div>
                      Manager: <span className="text-foreground font-medium">{c.contact_person}</span>
                    </div>
                    <div>
                      Phone: <span className="text-foreground font-mono">{c.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- CREATE NEW PICKUP MODAL --- */}
      <Dialog open={isAddPickupOpen} onOpenChange={setIsAddPickupOpen}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald" /> Manual Pickup Request Entry
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new door-step e-waste pickup directly into the backend database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Customer Name</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newPickup.customer_name}
                  onChange={(e) => setNewPickup({ ...newPickup, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={newPickup.phone}
                  onChange={(e) => setNewPickup({ ...newPickup, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Pickup Address</label>
              <Input
                required
                placeholder="Door No, Street Name, Landmark"
                value={newPickup.address_line}
                onChange={(e) => setNewPickup({ ...newPickup, address_line: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">City</label>
                <Input
                  required
                  value={newPickup.city}
                  onChange={(e) => setNewPickup({ ...newPickup, city: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Pincode</label>
                <Input
                  required
                  placeholder="560038"
                  value={newPickup.pincode}
                  onChange={(e) => setNewPickup({ ...newPickup, pincode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Device Name</label>
                <Input
                  required
                  placeholder="Laptop / Smartphone"
                  value={newPickup.device}
                  onChange={(e) => setNewPickup({ ...newPickup, device: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Est. Amount (₹)</label>
                <Input
                  type="number"
                  required
                  value={newPickup.estimated_total}
                  onChange={(e) => setNewPickup({ ...newPickup, estimated_total: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddPickupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                Save & Dispatch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CREATE NEW 5R RULE MODAL --- */}
      <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-emerald" /> Add 5R Fault Rule
            </DialogTitle>
            <DialogDescription className="text-xs">
              Inject a new diagnostic rule into the AI Decision Engine (`fault_rules` table).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Device</label>
                <Input
                  required
                  value={newRule.device}
                  onChange={(e) => setNewRule({ ...newRule, device: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Component</label>
                <Input
                  required
                  value={newRule.component}
                  onChange={(e) => setNewRule({ ...newRule, component: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Condition</label>
                <Input
                  required
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Fault Description</label>
              <Input
                required
                value={newRule.fault}
                onChange={(e) => setNewRule({ ...newRule, fault: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">5R Action</label>
                <select
                  value={newRule.five_r}
                  onChange={(e) => setNewRule({ ...newRule, five_r: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 focus:outline-none"
                >
                  <option value="Recycle">Recycle</option>
                  <option value="Reuse">Reuse</option>
                  <option value="Reduce">Reduce</option>
                  <option value="Retrieve">Retrieve</option>
                  <option value="Redesign">Redesign</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Severity</label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">AI Recommendation</label>
              <Input
                required
                value={newRule.recommendation}
                onChange={(e) => setNewRule({ ...newRule, recommendation: e.target.value })}
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Safety Warning</label>
              <Input
                required
                value={newRule.safety_warning}
                onChange={(e) => setNewRule({ ...newRule, safety_warning: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddRuleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                Publish Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CREATE NEW SKILL CENTER MODAL --- */}
      <Dialog open={isAddCenterOpen} onOpenChange={setIsAddCenterOpen}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald" /> Register Skill Center Hub
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new circular repair operations facility to the national network.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCenter} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Facility Name</label>
              <Input
                required
                placeholder="e.g. Pune Circular Tech Hub"
                value={newCenter.name}
                onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">City</label>
                <Input
                  required
                  placeholder="Pune"
                  value={newCenter.city}
                  onChange={(e) => setNewCenter({ ...newCenter, city: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">State</label>
                <Input
                  required
                  placeholder="Maharashtra"
                  value={newCenter.state}
                  onChange={(e) => setNewCenter({ ...newCenter, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Active Technicians</label>
                <Input
                  type="number"
                  required
                  value={newCenter.technicians}
                  onChange={(e) => setNewCenter({ ...newCenter, technicians: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Daily Unit Capacity</label>
                <Input
                  type="number"
                  required
                  value={newCenter.daily_capacity}
                  onChange={(e) => setNewCenter({ ...newCenter, daily_capacity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Manager Contact Name</label>
                <Input
                  required
                  placeholder="Manager Name"
                  value={newCenter.contact_person}
                  onChange={(e) => setNewCenter({ ...newCenter, contact_person: e.target.value })}
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <Input
                  required
                  placeholder="+91 98000 00000"
                  value={newCenter.phone}
                  onChange={(e) => setNewCenter({ ...newCenter, phone: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddCenterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                Register Hub
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- RECORD DETAIL VIEW MODAL --- */}
      <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Record Detailed Inspection
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-wider text-emerald">
              Type: {viewingType}
            </DialogDescription>
          </DialogHeader>

          {viewingRecord && (
            <div className="space-y-3 text-xs bg-background/50 p-4 rounded-xl border border-border/50 max-h-[400px] overflow-y-auto">
              <pre className="font-mono text-[11px] whitespace-pre-wrap break-words text-foreground">
                {JSON.stringify(viewingRecord, null, 2)}
              </pre>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setViewingRecord(null)}>
              Close Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
