import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Bell, Calendar, Shield, Users, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Multi-channel notifications via Web Push, WhatsApp, and SMS with intelligent escalation",
    },
    {
      icon: Calendar,
      title: "Dose Scheduling",
      description: "Flexible medication schedules with timezone support and DND periods",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "HIPAA-compliant with configurable privacy modes and secure data handling",
    },
    {
      icon: Users,
      title: "Caregiver Support",
      description: "Share access with caregivers and automatic escalation for missed doses",
    },
    {
      icon: Pill,
      title: "Inventory Tracking",
      description: "FEFO-based inventory management with expiry alerts and QR scanning",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive adherence tracking and audit logs for complete visibility",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
            <Pill className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Smart Medicine Reminder System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive cloud-based solution for medication management with intelligent reminders,
            inventory tracking, and caregiver support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8"
            >
              Staff Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="text-lg px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Medication Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for healthcare professionals and designed with patient safety in mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="shadow-card hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 pb-24">
        <Card className="bg-gradient-primary text-primary-foreground shadow-lg">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Improve Medication Adherence?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join healthcare facilities using our system to ensure patients never miss a dose.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/login")}
              className="text-lg px-8"
            >
              Get Started Today
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
