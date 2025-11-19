import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hospital, MapPin, Users, Key } from "lucide-react";

const HospitalSetup = () => {
  const hospitals = [
    {
      name: "All India Institute of Medical Sciences (AIIMS) - Delhi",
      city: "New Delhi",
      state: "Delhi",
      email: "delhi@hospital.demo",
      password: "DelhiHospital@2024",
      patients: ["Rajesh Kumar", "Priya Sharma", "Amit Singh"],
      address: "AIIMS Rd, Ansari Nagar, New Delhi, Delhi 110029",
      icon: "🏥",
    },
    {
      name: "Govt. Hospital - Dehradun",
      city: "Dehradun",
      state: "Uttarakhand", 
      email: "dehradun@hospital.demo",
      password: "DehradunHospital@2024",
      patients: ["Meera Patel", "Vikram Chauhan", "Sunita Verma"],
      address: "Civic Centre, Dehradun, Uttarakhand 248001",
      icon: "🏥",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Hospital className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold">Hospital Demo Accounts</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Two separate hospital accounts have been created for testing
          </p>
        </div>

        <Alert className="bg-primary/10 border-primary">
          <Key className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            <strong>Important:</strong> Use these credentials to login. Each hospital can only see their own patients and data (Multi-tenant system).
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.map((hospital, index) => (
            <Card key={index} className="shadow-xl hover:shadow-2xl transition-all duration-300 border-2">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">{hospital.icon}</span>
                      {hospital.city}
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      {hospital.name}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-primary">{hospital.state}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Login Credentials */}
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Key className="w-5 h-5" />
                    Login Credentials
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase">Email</span>
                      <code className="text-base font-mono bg-background px-3 py-2 rounded border">
                        {hospital.email}
                      </code>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase">Password</span>
                      <code className="text-base font-mono bg-background px-3 py-2 rounded border">
                        {hospital.password}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    Address
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {hospital.address}
                  </p>
                </div>

                {/* Sample Patients */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="w-4 h-4 text-primary" />
                    Sample Patients ({hospital.patients.length})
                  </div>
                  <div className="pl-6 space-y-1">
                    {hospital.patients.map((patient, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {patient}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              How to Test Multi-Tenant System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-semibold text-primary">Step 1: Sign Up</div>
                <p className="text-sm text-muted-foreground">
                  Use the credentials above to sign up for either Delhi or Dehradun hospital
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-primary">Step 2: View Data</div>
                <p className="text-sm text-muted-foreground">
                  After login, you'll only see patients and data from your hospital
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-primary">Step 3: Test Isolation</div>
                <p className="text-sm text-muted-foreground">
                  Login with the other hospital account to verify data isolation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalSetup;
