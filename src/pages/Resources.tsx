import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ResourceCard from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  semester?: number;
  year?: number;
  price: number;
  is_free: boolean;
  average_rating?: number;
  download_count: number;
  thumbnail_url?: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const { toast } = useToast();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('resources', {
        body: {
          search: searchTerm,
          category: category || undefined,
          subject: subject || undefined,
          semester: semester || undefined,
          year: year || undefined,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResources(response.data.resources || []);
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
    fetchResources();
  }, [searchTerm, category, subject, semester, year]);

  const handleSearch = () => {
    fetchResources();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("");
    setSubject("");
    setSemester("");
    setYear("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Resources</h1>
          <p className="text-muted-foreground">
            Find notes, syllabus, and previous year question papers
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-primary">
                Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="syllabus">Syllabus</SelectItem>
                  <SelectItem value="previous_papers">Previous Papers</SelectItem>
                  <SelectItem value="assignments">Assignments</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {[2020, 2021, 2022, 2023, 2024].map(yr => (
                    <SelectItem key={yr} value={yr.toString()}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                description={resource.description}
                category={resource.category as "notes" | "syllabus" | "papers"}
                subject={resource.subject}
                semester={resource.semester?.toString()}
                year={resource.year?.toString()}
                price={resource.price}
                isFree={resource.is_free}
                rating={resource.average_rating || 0}
                downloads={resource.download_count}
                uploader={resource.profiles?.display_name || 'Anonymous'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all resources.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Resources;