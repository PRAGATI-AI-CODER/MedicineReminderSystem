import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pill, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().trim().min(1, "Medication name is required").max(200, "Name must be less than 200 characters"),
  form: z.enum(["tablet", "capsule", "liquid", "injection", "cream", "inhaler", "patch", "other"]),
  strength: z.string().trim().max(50, "Strength must be less than 50 characters").optional(),
  code_type: z.enum(["NDC", "GTIN", "UPC", "OTHER"]),
  code_value: z.string().trim().max(100, "Code must be less than 100 characters").optional(),
  notes: z.string().trim().max(500, "Notes must be less than 500 characters").optional(),
});

const Medications = () => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [form, setForm] = useState("tablet");
  const [strength, setStrength] = useState("");
  const [codeType, setCodeType] = useState("NDC");
  const [codeValue, setCodeValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    checkAuth();
    fetchMedications();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchMedications = async () => {
    try {
      // @ts-ignore - Supabase types need regeneration
      const { data, error } = await supabase
        // @ts-ignore
        .from("medications")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validationResult = medicationSchema.safeParse({
        name,
        form,
        strength: strength || undefined,
        code_type: codeType,
        code_value: codeValue || undefined,
        notes: notes || undefined,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(", ");
        toast.error(errors);
        setIsLoading(false);
        return;
      }

      // @ts-ignore - Supabase types need regeneration
      const { error } = await supabase
        // @ts-ignore
        .from("medications").insert([{
        name: validationResult.data.name,
        form: validationResult.data.form,
        strength: validationResult.data.strength || null,
        code_type: validationResult.data.code_type,
        code_value: validationResult.data.code_value || null,
        notes: validationResult.data.notes || null,
      }]);

      if (error) throw error;

      toast.success("Medication added successfully");
      setShowAddForm(false);
      setName("");
      setStrength("");
      setCodeValue("");
      setNotes("");
      fetchMedications();
    } catch (error: any) {
      toast.error(error.message || "Failed to add medication");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedications = medications.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">Medication Library</h1>
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
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </div>

          {/* Add Medication Form */}
          {showAddForm && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Add New Medication</CardTitle>
                <CardDescription>Register a new medication in the library</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Medication Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Aspirin"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="form">Form *</Label>
                      <Select value={form} onValueChange={setForm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="liquid">Liquid</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="cream">Cream</SelectItem>
                          <SelectItem value="inhaler">Inhaler</SelectItem>
                          <SelectItem value="patch">Patch</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strength">Strength</Label>
                      <Input
                        id="strength"
                        value={strength}
                        onChange={(e) => setStrength(e.target.value)}
                        placeholder="e.g., 100mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codeType">Code Type</Label>
                      <Select value={codeType} onValueChange={setCodeType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NDC">NDC</SelectItem>
                          <SelectItem value="GTIN">GTIN</SelectItem>
                          <SelectItem value="UPC">UPC</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codeValue">Code Value</Label>
                      <Input
                        id="codeValue"
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        placeholder="Barcode/QR code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional information"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Medication"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Medications List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && !showAddForm ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading medications...
              </div>
            ) : filteredMedications.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No medications found. Add your first medication to get started.
              </div>
            ) : (
              filteredMedications.map((medication) => (
                <Card key={medication.id} className="shadow-card hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="w-4 h-4 text-primary" />
                          {medication.name}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {medication.form} {medication.strength && `• ${medication.strength}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {medication.code_value && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{medication.code_type}:</span>
                        <span className="font-mono text-xs">{medication.code_value}</span>
                      </div>
                    )}
                    {medication.notes && (
                      <div className="text-sm text-muted-foreground">
                        {medication.notes}
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

export default Medications;
