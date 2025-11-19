import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Clock, Bell } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const scheduleSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  medication_id: z.string().uuid("Invalid medication ID"),
  dose_value: z.string().min(1, "Dose value is required"),
  dose_unit: z.string().min(1, "Dose unit is required"),
  start_date: z.string().min(1, "Start date is required"),
  times: z.array(z.string()).min(1, "At least one time is required"),
  notify_channels: z.array(z.string()).min(1, "Select at least one notification channel"),
});

const Schedules = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedMedication, setSelectedMedication] = useState("");
  const [doseValue, setDoseValue] = useState("");
  const [doseUnit, setDoseUnit] = useState("mg");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [notifyChannels, setNotifyChannels] = useState<string[]>(["push"]);
  const [notifyFamily, setNotifyFamily] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      // @ts-ignore
      const { data: schedulesData } = await supabase
        // @ts-ignore
        .from("schedules")
        .select(`
          *,
          patient:patients(full_name),
          medication:medications(name, strength)
        `)
        .order("created_at", { ascending: false });

      // @ts-ignore
      const { data: patientsData } = await supabase
        // @ts-ignore
        .from("patients")
        .select("id, full_name")
        .order("full_name");

      // @ts-ignore
      const { data: medicationsData } = await supabase
        // @ts-ignore
        .from("medications")
        .select("id, name, strength")
        .order("name");

      setSchedules(schedulesData || []);
      setPatients(patientsData || []);
      setMedications(medicationsData || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTime = () => {
    setTimes([...times, "12:00"]);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const toggleChannel = (channel: string) => {
    if (notifyChannels.includes(channel)) {
      setNotifyChannels(notifyChannels.filter(c => c !== channel));
    } else {
      setNotifyChannels([...notifyChannels, channel]);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validationResult = scheduleSchema.safeParse({
        patient_id: selectedPatient,
        medication_id: selectedMedication,
        dose_value: doseValue,
        dose_unit: doseUnit,
        start_date: startDate,
        times: times,
        notify_channels: notifyChannels,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(", ");
        toast.error(errors);
        setIsLoading(false);
        return;
      }

      // Create regimen JSON with notification settings
      const regimenJson = {
        frequency: "daily",
        times: times,
        notifications: {
          channels: notifyChannels,
          notify_family: notifyFamily,
          reminder_minutes: [0, 15], // Notify at scheduled time and 15 minutes before
        }
      };

      // @ts-ignore - Supabase types need regeneration
      const { error } = await supabase
        .from("schedules")
        // @ts-ignore
        .insert([{
          patient_id: selectedPatient,
          medication_id: selectedMedication,
          dose_value: parseFloat(doseValue),
          dose_unit: doseUnit,
          start_date: startDate,
          end_date: endDate || null,
          regimen_json: regimenJson,
          timezone: "Asia/Kolkata",
          prn: false,
        }]);

      if (error) throw error;

      toast.success("Schedule created successfully with notification settings!");
      setShowAddForm(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient("");
    setSelectedMedication("");
    setDoseValue("");
    setDoseUnit("mg");
    setStartDate("");
    setEndDate("");
    setTimes(["08:00"]);
    setNotifyChannels(["push"]);
    setNotifyFamily(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Medication Schedules</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Schedules & Notifications</h2>
              <p className="text-muted-foreground">Set medication schedules with SMS, WhatsApp, and Push notifications</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Schedule
            </Button>
          </div>

          {/* Add Schedule Form */}
          {showAddForm && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Create New Schedule</CardTitle>
                <CardDescription>Set up medication schedule with notification alarms</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSchedule} className="space-y-6">
                  {/* Patient and Medication Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient">Patient *</Label>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medication">Medication *</Label>
                      <Select value={selectedMedication} onValueChange={setSelectedMedication} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name} {med.strength && `(${med.strength})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dose Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doseValue">Dose Value *</Label>
                      <Input
                        id="doseValue"
                        type="number"
                        step="0.1"
                        value={doseValue}
                        onChange={(e) => setDoseValue(e.target.value)}
                        placeholder="e.g., 500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doseUnit">Dose Unit *</Label>
                      <Select value={doseUnit} onValueChange={setDoseUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="tablets">tablets</SelectItem>
                          <SelectItem value="capsules">capsules</SelectItem>
                          <SelectItem value="drops">drops</SelectItem>
                          <SelectItem value="puffs">puffs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Times */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Notification Times
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddTime}>
                        Add Time
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(index, e.target.value)}
                            required
                          />
                          {times.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTime(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Channels */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notification Channels *
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant={notifyChannels.includes("push") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleChannel("push")}
                      >
                        📱 Push Notification
                      </Button>
                      <Button
                        type="button"
                        variant={notifyChannels.includes("sms") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleChannel("sms")}
                      >
                        💬 SMS
                      </Button>
                      <Button
                        type="button"
                        variant={notifyChannels.includes("whatsapp") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleChannel("whatsapp")}
                      >
                        📲 WhatsApp
                      </Button>
                    </div>
                  </div>

                  {/* Family Notification */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notifyFamily"
                      checked={notifyFamily}
                      onChange={(e) => setNotifyFamily(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="notifyFamily" className="cursor-pointer">
                      Also notify registered family members/caregivers
                    </Label>
                  </div>

                  {/* End Date (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Schedule"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Schedules List */}
          <div className="grid grid-cols-1 gap-4">
            {isLoading && !showAddForm ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading schedules...
              </div>
            ) : schedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  No schedules found. Create your first schedule to get started.
                </CardContent>
              </Card>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="shadow-card hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{schedule.patient?.full_name || "Unknown Patient"}</CardTitle>
                        <CardDescription>
                          {schedule.medication?.name || "Unknown Medication"} - {schedule.dose_value} {schedule.dose_unit}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {schedule.regimen_json?.notifications?.channels?.map((channel: string) => (
                          <span key={channel} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {channel === "push" && "📱"}
                            {channel === "sms" && "💬"}
                            {channel === "whatsapp" && "📲"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Schedule Times:</span>
                      <span className="font-medium">
                        {schedule.regimen_json?.times?.join(", ") || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">
                        {new Date(schedule.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    {schedule.end_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="font-medium">
                          {new Date(schedule.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {schedule.regimen_json?.notifications?.notify_family && (
                      <div className="text-sm text-primary">
                        ✓ Family members will be notified
                      </div>
                    )}
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

export default Schedules;
