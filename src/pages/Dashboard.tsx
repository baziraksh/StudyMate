import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  BookOpen, 
  Heart, 
  Star, 
  Download, 
  Upload, 
  TrendingUp,
  Award,
  FileText,
  Clock,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
    points: number;
  };
  recentPurchases?: any[];
  wishlistItems?: any[];
  uploadedResources?: any[];
  stats: {
    totalPurchases?: number;
    wishlistCount?: number;
    points?: number;
    totalUploads?: number;
    approvedUploads?: number;
    pendingUploads?: number;
    totalEarnings?: number;
    totalDownloads?: number;
  };
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("student");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardData = async (type: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('dashboard', {
        body: { type },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setDashboardData(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData(activeTab);
    }
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) return null;

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {dashboardData.user.display_name || user?.email}!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="uploader">Uploader</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            {/* Student Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Purchases"
                value={dashboardData.stats.totalPurchases || 0}
                icon={BookOpen}
                description="Resources you've bought"
              />
              <StatCard
                title="Wishlist Items"
                value={dashboardData.stats.wishlistCount || 0}
                icon={Heart}
                description="Resources you want"
              />
              <StatCard
                title="Points Earned"
                value={dashboardData.stats.points || 0}
                icon={Award}
                description="Reward points"
              />
            </div>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Your latest resource downloads</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentPurchases && dashboardData.recentPurchases.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentPurchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{purchase.resources.title}</h4>
                            <p className="text-sm text-muted-foreground">{purchase.resources.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{purchase.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No purchases yet. Start exploring resources!</p>
                )}
              </CardContent>
            </Card>

            {/* Wishlist */}
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Resources you want to purchase</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.wishlistItems && dashboardData.wishlistItems.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.wishlistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Heart className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{item.resources.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.resources.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.resources.is_free ? "Free" : `₹${item.resources.price}`}
                          </p>
                          <Badge variant="secondary">{item.resources.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items in wishlist. Add some resources to get started!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploader" className="space-y-6">
            {/* Uploader Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Uploads"
                value={dashboardData.stats.totalUploads || 0}
                icon={Upload}
                description="Resources uploaded"
              />
              <StatCard
                title="Approved"
                value={dashboardData.stats.approvedUploads || 0}
                icon={FileText}
                description="Published resources"
              />
              <StatCard
                title="Pending"
                value={dashboardData.stats.pendingUploads || 0}
                icon={Clock}
                description="Awaiting approval"
              />
              <StatCard
                title="Total Downloads"
                value={dashboardData.stats.totalDownloads || 0}
                icon={Download}
                description="Times downloaded"
              />
            </div>

            {/* Uploaded Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Your Uploads</CardTitle>
                <CardDescription>Manage your uploaded resources</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.uploadedResources && dashboardData.uploadedResources.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.uploadedResources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{resource.download_count} downloads</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.is_free ? "Free" : `₹${resource.price}`}
                            </p>
                          </div>
                          <Badge variant={resource.is_approved ? "default" : "secondary"}>
                            {resource.is_approved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No uploads yet. Share your knowledge!</p>
                    <Button asChild className="bg-gradient-primary">
                      <a href="/upload">Upload Resource</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Manage the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Admin features will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;