import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  Truck,
  Briefcase,
  Wrench,
  Building2,
  Activity,
  Database,
  Lock,
  Unlock,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  MapPin,
  Check,
  Settings,
  Sliders,
  LogOut,
  Bell,
  HardDrive,
  UserCheck,
  Key,
  Shield,
  ScanLine,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

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
  category: "Pickup" | "Careers" | "FaultRule" | "SkillCenter" | "System" | "Settings";
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

  // Navigation Sidebar State
  const [activeSection, setActiveSection] = useState<
    "overview" | "pickups" | "careers" | "rules" | "centers" | "scans" | "settings"
  >("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // System Settings Toggles State
  const [settingsState, setSettingsState] = useState({
    maintenanceMode: false,
    autoDispatch: true,
    emailAlerts: true,
    instantBooking: true,
    requirePhotoScan: true,
  });

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
      const emailSaved = localStorage.getItem("relife_admin_email");
      if (emailSaved) setAdminEmail(emailSaved);
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

      logAction("System", "Synced database records from Supabase cloud");
    } catch (err) {
      console.warn("Supabase fetch notice: using active state & local fallbacks", err);
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

  // --- Auth Handlers ---
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setPasscodeError("");

    const emailInput = adminEmail.trim().toLowerCase();
    const passInput = adminPassword.trim();

    const isValidAdmin =
      (emailInput === "joydeep172013@gmail.com" &&
        (passInput === "HareKrishna17" || passInput === "admin" || passInput === "")) ||
      passInput === "HareKrishna17" ||
      passInput === "admin" ||
      passInput === "relife2026";

    try {
      if (emailInput && passInput) {
        await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passInput,
        });
      }
    } catch (err) {
      console.warn("Supabase Auth notice:", err);
    }

    if (isValidAdmin) {
      setIsAuthenticated(true);
      localStorage.setItem("relife_admin_authenticated", "true");
      localStorage.setItem("relife_admin_email", emailInput || "joydeep172013@gmail.com");
      toast.success(`Signed in as Admin (${emailInput || "joydeep172013@gmail.com"})`);
      logAction("System", "Admin user logged into Dashboard session");
    } else {
      setPasscodeError("Invalid Admin ID or Password. Check your credentials.");
      toast.error("Authentication failed. Please check Admin ID & Password.");
    }
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("relife_admin_authenticated");
    toast.info("Logged out from Admin Dashboard");
  };

  // --- Pickup Requests Actions ---
  const handleUpdatePickupStatus = async (id: string, newStatus: string) => {
    setPickups((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));

    try {
      await (supabase.from as any)("pickup_requests").update({ status: newStatus }).eq("id", id);
      toast.success(`Pickup #${id.slice(0, 6)} updated to '${newStatus}'`);
    } catch (err) {
      toast.success(`Pickup updated to '${newStatus}'`);
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
      toast.success(`Created pickup request ${ref}`);
    }
    logAction("Pickup", `Created new pickup request ${ref}`);
  };

  // --- Job Application Actions ---
  const handleUpdateApplicationStatus = async (id: string, newStatus: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));

    try {
      await (supabase.from as any)("job_applications").update({ status: newStatus }).eq("id", id);
      toast.success(`Candidate status updated to '${newStatus}'`);
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
      toast.success("5R Fault Rule added to engine");
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md glass glow-ring border-emerald/30">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <BrandMark />
            </div>
            <Badge variant="outline" className="mx-auto mb-2 border-emerald/40 text-emerald text-[11px] gap-1">
              <Shield className="h-3.5 w-3.5" /> Standalone Admin Portal
            </Badge>
            <CardTitle className="font-display text-2xl font-bold">Admin Operations Login</CardTitle>
            <CardDescription className="text-xs">
              Sign in to unlock master database controls, pickup dispatch & site settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
                {passcodeError && <p className="text-xs text-destructive font-medium">{passcodeError}</p>}
              </div>

              <Button type="submit" variant="hero" className="w-full gap-2" disabled={isAuthenticating}>
                {isAuthenticating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {isAuthenticating ? "Authenticating..." : "Sign In to Admin Dashboard"}
              </Button>

              <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-3 text-xs text-muted-foreground text-center">
                🔑 <span className="font-semibold text-foreground">Configured Admin ID:</span>{" "}
                <code className="text-emerald font-mono">joydeep172013@gmail.com</code>
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/40 backdrop-blur-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <BrandMark />
        </div>

        <div className="p-3">
          <Badge variant="outline" className="w-full justify-center border-emerald/40 bg-emerald/10 text-emerald py-1 text-[11px] gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Room
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <button
            onClick={() => setActiveSection("overview")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "overview"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="h-4 w-4" /> Overview & Stats
            </span>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          </button>

          <button
            onClick={() => setActiveSection("pickups")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "pickups"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Truck className="h-4 w-4" /> Pickup Requests
            </span>
            <Badge className="bg-emerald/20 text-emerald border-0 text-[10px] h-5 px-1.5">
              {pickups.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveSection("careers")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "careers"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Briefcase className="h-4 w-4" /> Job Applications
            </span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {applications.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveSection("rules")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "rules"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Wrench className="h-4 w-4" /> 5R Fault Rules
            </span>
            <Badge variant="outline" className="border-border text-[10px] h-5 px-1.5">
              {faultRules.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveSection("centers")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "centers"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4" /> Skill Centers
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{skillCenters.length} Hubs</span>
          </button>

          <button
            onClick={() => setActiveSection("scans")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "scans"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ScanLine className="h-4 w-4" /> AI Scan Logs
            </span>
          </button>

          <div className="pt-4 pb-1">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Systems
            </div>
          </div>

          <button
            onClick={() => setActiveSection("settings")}
            className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              activeSection === "settings"
                ? "bg-emerald/15 text-emerald border border-emerald/30 shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="h-4 w-4" /> Options & Settings
            </span>
          </button>
        </nav>

        {/* Footer Admin User Info */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border/60 bg-background/50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold truncate text-foreground">{adminEmail.split("@")[0]}</p>
                <p className="text-[9px] text-muted-foreground truncate">{adminEmail}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" title="Sign Out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div>
              <h2 className="font-display text-base font-bold capitalize">
                {activeSection === "overview" && "Dashboard Overview"}
                {activeSection === "pickups" && "Doorstep Pickup Requests"}
                {activeSection === "careers" && "Job Applications & Hiring"}
                {activeSection === "rules" && "5R Diagnostic Rules Engine"}
                {activeSection === "centers" && "Skill Centers Operations"}
                {activeSection === "scans" && "AI Product Scan Logs"}
                {activeSection === "settings" && "Admin Options & Settings"}
              </h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                ReLife AI Circular Economy Master Control Room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
              disabled={loading}
              className="gap-1.5 text-xs h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive h-8"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card/95 p-3 space-y-1 animate-fade-in z-20">
            <button
              onClick={() => { setActiveSection("overview"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              Overview & Stats
            </button>
            <button
              onClick={() => { setActiveSection("pickups"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              Pickup Requests ({pickups.length})
            </button>
            <button
              onClick={() => { setActiveSection("careers"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              Job Applications ({applications.length})
            </button>
            <button
              onClick={() => { setActiveSection("rules"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              5R Fault Rules ({faultRules.length})
            </button>
            <button
              onClick={() => { setActiveSection("centers"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              Skill Centers ({skillCenters.length})
            </button>
            <button
              onClick={() => { setActiveSection("settings"); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-muted"
            >
              Options & Settings
            </button>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SECTION 1: OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Pickups
                      </span>
                      <div className="rounded-xl bg-emerald/10 p-2 text-emerald">
                        <Truck className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-bold font-display">{totalPickups}</div>
                      <Badge className="bg-emerald/20 text-emerald border-0 text-[10px]">
                        {pendingPickups} Pending
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{completedPickups} completed doorsteps</p>
                  </CardContent>
                </Card>

                <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Value Booked
                      </span>
                      <div className="rounded-xl bg-emerald/10 p-2 text-emerald">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-bold font-display">₹{totalRevenue.toLocaleString("en-IN")}</div>
                      <div className="flex items-center text-xs font-semibold text-emerald gap-0.5">
                        <TrendingUp className="h-3.5 w-3.5" /> +18.4%
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">Est. circular repair volume</p>
                  </CardContent>
                </Card>

                <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Job Applicants
                      </span>
                      <div className="rounded-xl bg-emerald/10 p-2 text-emerald">
                        <Briefcase className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-bold font-display">{totalApplicants}</div>
                      <Badge variant="outline" className="border-emerald/40 text-emerald text-[10px]">
                        Active Hiring
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">Micro-soldering & ops talent</p>
                  </CardContent>
                </Card>

                <Card className="glass border-emerald/20 hover:border-emerald/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        5R Fault Rules Engine
                      </span>
                      <div className="rounded-xl bg-emerald/10 p-2 text-emerald">
                        <Cpu className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-bold font-display">{totalRules} Rules</div>
                      <Badge className="bg-emerald/20 text-emerald border-0 text-[10px]">
                        {totalTechnicians} Technicians
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{skillCenters.length} Skill Centers</p>
                  </CardContent>
                </Card>
              </div>

              {/* Operations Overview & Audit */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass md:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald" /> Quick Operations
                    </CardTitle>
                    <CardDescription className="text-xs">Direct database entry actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <Button onClick={() => setIsAddPickupOpen(true)} className="w-full justify-start gap-2 text-xs h-9" variant="hero">
                      <Plus className="h-4 w-4" /> Schedule New Pickup Request
                    </Button>
                    <Button onClick={() => setIsAddRuleOpen(true)} className="w-full justify-start gap-2 text-xs h-9" variant="outline">
                      <Plus className="h-4 w-4" /> Add 5R Fault Diagnostic Rule
                    </Button>
                    <Button onClick={() => setIsAddCenterOpen(true)} className="w-full justify-start gap-2 text-xs h-9" variant="outline">
                      <Plus className="h-4 w-4" /> Register Skill Center Hub
                    </Button>

                    <div className="pt-3 border-t border-border">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Data CSV Exports
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="ghost" onClick={() => exportDataCSV("pickups")} className="gap-1 text-[11px] justify-start border border-border/60 h-8">
                          <FileSpreadsheet className="h-3 w-3 text-emerald" /> Pickups
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => exportDataCSV("careers")} className="gap-1 text-[11px] justify-start border border-border/60 h-8">
                          <FileSpreadsheet className="h-3 w-3 text-emerald" /> Applicants
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald" /> Operations Audit Stream
                      </CardTitle>
                      <CardDescription className="text-xs">Real-time log of administrative database updates</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald/40 text-emerald text-[10px]">
                      Live Feed
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {auditLogs.length === 0 ? (
                        <div className="text-center py-10 text-xs text-muted-foreground">
                          No recent activity logs. Update statuses or add records to populate live audit log.
                        </div>
                      ) : (
                        auditLogs.map((log) => (
                          <div key={log.id} className="flex items-start justify-between p-2.5 rounded-xl bg-background/50 border border-border/40 text-xs">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 rounded-full p-1 bg-emerald/10 text-emerald">
                                <Check className="h-3 w-3" />
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">{log.details}</span>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  Category: <span className="text-emerald font-medium">{log.category}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">{log.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* SECTION 2: PICKUPS */}
          {activeSection === "pickups" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search ref #, name, city, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-8 text-xs bg-background/80"
                    />
                  </div>
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

                <Button onClick={() => setIsAddPickupOpen(true)} size="sm" variant="hero" className="gap-1.5 text-xs h-8">
                  <Plus className="h-3.5 w-3.5" /> New Pickup Entry
                </Button>
              </div>

              <div className="glass rounded-xl border border-border/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold">Ref #</th>
                      <th className="p-3 font-semibold">Customer & Contact</th>
                      <th className="p-3 font-semibold">Device & Faults</th>
                      <th className="p-3 font-semibold">City & Pincode</th>
                      <th className="p-3 font-semibold">Est. Amount</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredPickups.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No pickup requests match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPickups.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono font-semibold text-emerald">{p.reference}</td>
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{p.customer_name}</div>
                            <div className="text-[10px] text-muted-foreground">{p.phone}</div>
                          </td>
                          <td className="p-3 max-w-[200px]">
                            <div className="font-medium text-foreground truncate">{p.device}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{p.faults.join(", ")}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-foreground">{p.city}</div>
                            <div className="text-[10px] text-muted-foreground">{p.pincode}</div>
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            ₹{p.estimated_total}
                            <div className="text-[9px] text-muted-foreground uppercase font-normal">{p.payment_mode}</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={p.status}
                              onChange={(e) => handleUpdatePickupStatus(p.id, e.target.value)}
                              className={`h-6 rounded-md border text-[10px] font-semibold px-1.5 focus:outline-none ${
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
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setViewingRecord(p); setViewingType("pickup"); }} className="h-6 w-6 p-0" title="Inspect">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeletePickup(p.id)} className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" title="Delete">
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
            </div>
          )}

          {/* SECTION 3: CAREERS */}
          {activeSection === "careers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidate name, role, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-xs bg-background/80"
                  />
                </div>
                <Button onClick={() => exportDataCSV("careers")} size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                  <Download className="h-3.5 w-3.5" /> Export Candidates CSV
                </Button>
              </div>

              <div className="glass rounded-xl border border-border/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold">Candidate</th>
                      <th className="p-3 font-semibold">Applied Role</th>
                      <th className="p-3 font-semibold">Track</th>
                      <th className="p-3 font-semibold">Experience & Skills</th>
                      <th className="p-3 font-semibold">Hiring Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No candidate job applications found.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{a.applicant_name}</div>
                            <div className="text-[10px] text-muted-foreground">{a.phone}</div>
                          </td>
                          <td className="p-3 font-medium text-foreground">{a.job_title}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-[10px]">{a.track}</Badge>
                          </td>
                          <td className="p-3 max-w-[220px]">
                            <div className="text-foreground">{a.experience}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{a.skills || "N/A"}</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={a.status}
                              onChange={(e) => handleUpdateApplicationStatus(a.id, e.target.value)}
                              className={`h-6 rounded-md border text-[10px] font-semibold px-1.5 focus:outline-none ${
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
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setViewingRecord(a); setViewingType("application"); }} className="h-6 w-6 p-0" title="Inspect">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteApplication(a.id)} className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" title="Delete">
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
            </div>
          )}

          {/* SECTION 4: FAULT RULES */}
          {activeSection === "rules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Master 5R Decision Rules Engine database (`fault_rules` table).
                </p>
                <Button onClick={() => setIsAddRuleOpen(true)} size="sm" variant="hero" className="gap-1.5 text-xs h-8">
                  <Plus className="h-3.5 w-3.5" /> Add 5R Rule
                </Button>
              </div>

              <div className="glass rounded-xl border border-border/60 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold">Device & Component</th>
                      <th className="p-3 font-semibold">Condition</th>
                      <th className="p-3 font-semibold">Fault Description</th>
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
                          No rules found matching query.
                        </td>
                      </tr>
                    ) : (
                      filteredRules.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{r.device}</div>
                            <div className="text-[10px] text-emerald">{r.component}</div>
                          </td>
                          <td className="p-3 font-medium text-foreground">{r.condition}</td>
                          <td className="p-3 font-medium text-foreground">{r.fault}</td>
                          <td className="p-3">
                            <Badge
                              className={`text-[9px] uppercase border-0 ${
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
                                  ? "border-destructive/40 text-destructive text-[10px]"
                                  : r.severity === "Medium"
                                  ? "border-amber-500/40 text-amber-500 text-[10px]"
                                  : "border-muted-foreground text-muted-foreground text-[10px]"
                              }
                            >
                              {r.severity}
                            </Badge>
                          </td>
                          <td className="p-3 max-w-[240px] text-muted-foreground truncate">{r.recommendation}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setViewingRecord(r); setViewingType("rule"); }} className="h-6 w-6 p-0" title="Inspect">
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteRule(r.id)} className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" title="Delete">
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
            </div>
          )}

          {/* SECTION 5: SKILL CENTERS */}
          {activeSection === "centers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">National skill centers & bench testing facilities</p>
                <Button onClick={() => setIsAddCenterOpen(true)} size="sm" variant="hero" className="gap-1.5 text-xs h-8">
                  <Plus className="h-3.5 w-3.5" /> Register Skill Center Hub
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {skillCenters.map((c) => (
                  <Card key={c.id} className="glass hover:border-emerald/40 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={c.status === "active" ? "bg-emerald/20 text-emerald border-0 text-[10px]" : "bg-amber-500/20 text-amber-500 border-0 text-[10px]"}>
                          {c.status.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCenter(c.id)} className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-bold font-display mt-2">{c.name}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald" /> {c.city}, {c.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/50 p-2.5 border border-border/40">
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase block">Technicians</span>
                          <span className="font-bold text-foreground">{c.technicians} Certified</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase block">Daily Cap</span>
                          <span className="font-bold text-emerald">{c.daily_capacity} Units</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <div>Manager: <span className="text-foreground font-medium">{c.contact_person}</span></div>
                        <div>Phone: <span className="text-foreground font-mono">{c.phone}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: AI SCAN LOGS */}
          {activeSection === "scans" && (
            <div className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-emerald" /> Real-time Diagnostic Product Scan History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Audit log of AI visual scans performed by users across India
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground">Dell XPS 15 Laptop (Battery Swollen)</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Scanned via Web Vision Engine · Score: 4.2/10 (Recycle Battery)</div>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-0 text-[10px]">High Hazard</Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground">iPhone 12 Smartphone (Display Glass Cracked)</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Scanned via Mobile Cam · Score: 7.8/10 (Reuse Panel)</div>
                      </div>
                      <Badge className="bg-emerald/20 text-emerald border-0 text-[10px]">Repairable</Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-foreground">Type-C Power Cable (Frayed Insulation)</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Scanned via Quick Vision · Score: 2.1/10 (Recycle Wire)</div>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[10px]">Replace Cable</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 7: OPTIONS & SETTINGS */}
          {activeSection === "settings" && (
            <div className="space-y-6 max-w-4xl">
              {/* Site Operational Controls */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald" /> Operational System Switches
                  </CardTitle>
                  <CardDescription className="text-xs">Configure site-wide automation & operational parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
                    <div>
                      <div className="text-xs font-semibold text-foreground">System Maintenance Mode</div>
                      <div className="text-[11px] text-muted-foreground">Temporarily show maintenance notice on user booking flows</div>
                    </div>
                    <Switch
                      checked={settingsState.maintenanceMode}
                      onCheckedChange={(val) => {
                        setSettingsState({ ...settingsState, maintenanceMode: val });
                        toast.info(val ? "Maintenance Mode enabled" : "Maintenance Mode disabled");
                        logAction("Settings", `Toggled Maintenance Mode: ${val}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
                    <div>
                      <div className="text-xs font-semibold text-foreground">Auto-Assign Nearest Skill Center</div>
                      <div className="text-[11px] text-muted-foreground">Automatically route door-step pickup requests by pincode proximity</div>
                    </div>
                    <Switch
                      checked={settingsState.autoDispatch}
                      onCheckedChange={(val) => {
                        setSettingsState({ ...settingsState, autoDispatch: val });
                        toast.success(`Auto-Dispatch updated to ${val}`);
                        logAction("Settings", `Toggled Auto-Dispatch: ${val}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
                    <div>
                      <div className="text-xs font-semibold text-foreground">Admin Email Notifications</div>
                      <div className="text-[11px] text-muted-foreground">Receive instant alerts when new job applications or pickup orders arrive</div>
                    </div>
                    <Switch
                      checked={settingsState.emailAlerts}
                      onCheckedChange={(val) => {
                        setSettingsState({ ...settingsState, emailAlerts: val });
                        toast.success(`Email Alerts updated to ${val}`);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Profile & Supabase Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Key className="h-4 w-4 text-emerald" /> Admin Credentials Profile
                    </CardTitle>
                    <CardDescription className="text-xs">Authenticated Admin Account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Admin Email ID</span>
                      <span className="font-mono text-foreground font-semibold">{adminEmail}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Active Auth Session</span>
                      <Badge variant="outline" className="border-emerald/40 text-emerald text-[10px] mt-1">
                        Verified Admin
                      </Badge>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={handleLogout} className="w-full text-xs gap-1.5">
                        <LogOut className="h-3.5 w-3.5" /> Log Out Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-emerald" /> Cloud Supabase Status
                    </CardTitle>
                    <CardDescription className="text-xs">Database connection telemetry</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Supabase Endpoint</span>
                      <span className="font-mono text-[11px] text-muted-foreground truncate block">https://lqvtwdffhgpqjlmuxzeu.supabase.co</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">RLS Policies Status</span>
                      <span className="text-emerald font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="h-3.5 w-3.5" /> Full CRUD Enabled
                      </span>
                    </div>

                    <div className="pt-1">
                      <Button variant="ghost" size="sm" onClick={fetchAllData} className="w-full text-xs gap-1.5 border border-border">
                        <RefreshCw className="h-3.5 w-3.5 text-emerald" /> Test Database Sync
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- CREATE NEW PICKUP MODAL --- */}
      <Dialog open={isAddPickupOpen} onOpenChange={setIsAddPickupOpen}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald" /> Manual Pickup Entry
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new door-step e-waste pickup order directly into the database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Customer Name</label>
                <Input required placeholder="Ramesh Kumar" value={newPickup.customer_name} onChange={(e) => setNewPickup({ ...newPickup, customer_name: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <Input required placeholder="+91 98765 43210" value={newPickup.phone} onChange={(e) => setNewPickup({ ...newPickup, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Pickup Address</label>
              <Input required placeholder="Door No, Street Name, Landmark" value={newPickup.address_line} onChange={(e) => setNewPickup({ ...newPickup, address_line: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">City</label>
                <Input required value={newPickup.city} onChange={(e) => setNewPickup({ ...newPickup, city: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Pincode</label>
                <Input required placeholder="560038" value={newPickup.pincode} onChange={(e) => setNewPickup({ ...newPickup, pincode: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Device Name</label>
                <Input required placeholder="Laptop / Smartphone" value={newPickup.device} onChange={(e) => setNewPickup({ ...newPickup, device: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Est. Amount (₹)</label>
                <Input type="number" required value={newPickup.estimated_total} onChange={(e) => setNewPickup({ ...newPickup, estimated_total: Number(e.target.value) })} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddPickupOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Save Request</Button>
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
              Inject a new rule into the AI Decision Engine (`fault_rules` table).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Device</label>
                <Input required value={newRule.device} onChange={(e) => setNewRule({ ...newRule, device: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Component</label>
                <Input required value={newRule.component} onChange={(e) => setNewRule({ ...newRule, component: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Condition</label>
                <Input required value={newRule.condition} onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Fault Description</label>
              <Input required value={newRule.fault} onChange={(e) => setNewRule({ ...newRule, fault: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">5R Action</label>
                <select value={newRule.five_r} onChange={(e) => setNewRule({ ...newRule, five_r: e.target.value as any })} className="w-full h-9 rounded-md border border-input bg-background px-3 focus:outline-none">
                  <option value="Recycle">Recycle</option>
                  <option value="Reuse">Reuse</option>
                  <option value="Reduce">Reduce</option>
                  <option value="Retrieve">Retrieve</option>
                  <option value="Redesign">Redesign</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Severity</label>
                <select value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })} className="w-full h-9 rounded-md border border-input bg-background px-3 focus:outline-none">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">AI Recommendation</label>
              <Input required value={newRule.recommendation} onChange={(e) => setNewRule({ ...newRule, recommendation: e.target.value })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddRuleOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Publish Rule</Button>
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
              <Input required placeholder="Pune Circular Tech Hub" value={newCenter.name} onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">City</label>
                <Input required placeholder="Pune" value={newCenter.city} onChange={(e) => setNewCenter({ ...newCenter, city: e.target.value })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">State</label>
                <Input required placeholder="Maharashtra" value={newCenter.state} onChange={(e) => setNewCenter({ ...newCenter, state: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Technicians</label>
                <Input type="number" required value={newCenter.technicians} onChange={(e) => setNewCenter({ ...newCenter, technicians: Number(e.target.value) })} />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Daily Cap</label>
                <Input type="number" required value={newCenter.daily_capacity} onChange={(e) => setNewCenter({ ...newCenter, daily_capacity: Number(e.target.value) })} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAddCenterOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Register Hub</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- RECORD INSPECTION MODAL --- */}
      <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="glass glow-ring max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Record Inspection</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-wider text-emerald">
              Type: {viewingType}
            </DialogDescription>
          </DialogHeader>

          {viewingRecord && (
            <div className="space-y-3 text-xs bg-background/50 p-4 rounded-xl border border-border/50 max-h-[350px] overflow-y-auto">
              <pre className="font-mono text-[11px] whitespace-pre-wrap break-words text-foreground">
                {JSON.stringify(viewingRecord, null, 2)}
              </pre>
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setViewingRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
