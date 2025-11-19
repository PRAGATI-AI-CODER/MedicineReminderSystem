import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const patientSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  dob: z.string().optional(),
  timezone: z.string().max(50),
  privacy_mode: z.enum(["standard", "private"]),
  notify_mode: z.enum(["fallback", "parallel"]),
});

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [privacyMode, setPrivacyMode] = useState("standard");
  const [notifyMode, setNotifyMode] = useState("fallback");

  useEffect(() => {
    checkAuth();
    fetchPatients();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchPatients = async () => {
    try {
      // @ts-ignore - Supabase types need regeneration
      const { data, error } = await supabase
        // @ts-ignore
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validationResult = patientSchema.safeParse({
        full_name: fullName,
        dob: dob || undefined,
        timezone,
        privacy_mode: privacyMode,
        notify_mode: notifyMode,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(", ");
        toast.error(errors);
        setIsLoading(false);
        return;
      }

      // Get the first clinic or create one
      // @ts-ignore - Supabase types need regeneration
      let { data: clinics } = await supabase
        // @ts-ignore
        .from("clinics").select("id").limit(1);
      
      let clinicId;
      if (!clinics || clinics.length === 0) {
        // @ts-ignore - Supabase types need regeneration
        const { data: newClinic, error: clinicError } = await supabase
          // @ts-ignore
          .from("clinics")
          // @ts-ignore
          .insert({ name: "Default Clinic", timezone: "America/New_York" })
          .select()
          .single();
        
        if (clinicError) throw clinicError;
        // @ts-ignore
        clinicId = newClinic!.id;
      } else {
        // @ts-ignore
        clinicId = clinics[0].id;
      }

      // @ts-ignore - Supabase types need regeneration
      const { error } = await supabase
        // @ts-ignore
        .from("patients").insert([{
        full_name: validationResult.data.full_name,
        dob: validationResult.data.dob || null,
        clinic_id: clinicId,
        timezone: validationResult.data.timezone,
        privacy_mode: validationResult.data.privacy_mode,
        notify_mode: validationResult.data.notify_mode,
        consent_at: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast.success("Patient added successfully");
      setShowAddForm(false);
      setFullName("");
      setDob("");
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || "Failed to add patient");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Patient Management</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Search and Add */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>

          {/* Add Patient Form */}
          {showAddForm && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Add New Patient</CardTitle>
                <CardDescription>Register a new patient in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPatient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="privacyMode">Privacy Mode</Label>
                      <Select value={privacyMode} onValueChange={setPrivacyMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Patient"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Patients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && !showAddForm ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No patients found. Add your first patient to get started.
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <Card key={patient.id} className="shadow-card hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                    <CardDescription>
                      {patient.dob ? `DOB: ${new Date(patient.dob).toLocaleDateString()}` : "No DOB"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Timezone:</span>
                      <span className="font-medium">{patient.timezone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Privacy:</span>
                      <span className="font-medium capitalize">{patient.privacy_mode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Notification:</span>
                      <span className="font-medium capitalize">{patient.notify_mode}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Patients;
