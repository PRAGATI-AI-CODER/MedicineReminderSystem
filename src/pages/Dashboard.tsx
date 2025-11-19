import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Pill, Calendar, AlertCircle, LogOut, Database } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    schedules: 0,
    medications: 0,
    alerts: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    try {
      // @ts-ignore
      const { data: patientsData } = await supabase
        // @ts-ignore
        .from("patients")
        .select("id", { count: "exact" });

      // @ts-ignore
      const { data: schedulesData } = await supabase
        // @ts-ignore
        .from("schedules")
        .select("id", { count: "exact" });

      // @ts-ignore
      const { data: medicationsData } = await supabase
        // @ts-ignore
        .from("medications")
        .select("id", { count: "exact" });

      // @ts-ignore
      const { data: alertsData } = await supabase
        // @ts-ignore
        .from("dose_plans")
        .select("id", { count: "exact" })
        // @ts-ignore
        .eq("status", "pending");

      setStats({
        patients: patientsData?.length || 0,
        schedules: schedulesData?.length || 0,
        medications: medicationsData?.length || 0,
        alerts: alertsData?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.patients.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-accent",
    },
    {
      title: "Active Schedules",
      value: stats.schedules.toString(),
      icon: Calendar,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      title: "Medications",
      value: stats.medications.toString(),
      icon: Pill,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
    {
      title: "Alerts",
      value: stats.alerts.toString(),
      icon: AlertCircle,
      color: "text-danger",
      bgColor: "bg-danger-light",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Medicine Reminder System</h1>
              <p className="text-sm text-muted-foreground">Staff Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Dashboard</h2>
            <p className="text-muted-foreground">Manage patients, medications, and schedules all in one place.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="shadow-card hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                onClick={() => navigate("/hospital-setup")}
              >
                <Database className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold">Hospital Login Credentials</div>
                  <div className="text-xs text-muted-foreground">Delhi & Dehradun accounts</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                onClick={() => navigate("/seed-import")}
              >
                <Database className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Import Demo Data</div>
                  <div className="text-xs text-muted-foreground">Load 60 hospitals & patients</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/patients")}
              >
                <Users className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">View Patients</div>
                  <div className="text-xs text-muted-foreground">Browse all patient records</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/medications")}
              >
                <Pill className="w-6 h-6 text-success" />
                <div className="text-center">
                  <div className="font-semibold">Medications</div>
                  <div className="text-xs text-muted-foreground">View medicine inventory</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/schedules")}
              >
                <Calendar className="w-6 h-6 text-warning" />
                <div className="text-center">
                  <div className="font-semibold">Schedules</div>
                  <div className="text-xs text-muted-foreground">Manage dose schedules</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
