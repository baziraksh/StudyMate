import ResourceCard from "./ResourceCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedResources = () => {
  // Mock data for featured resources
  const featuredResources = [
    {
      id: "1",
      title: "Data Structures & Algorithms Complete Notes",
      description: "Comprehensive DSA notes covering all important topics with examples and practice problems",
      category: "notes" as const,
      subject: "Computer Science",
      semester: "3",
      year: "2024",
      price: 299,
      isFree: false,
      rating: 4.8,
      downloads: 1250,
      uploader: "Arjun Sharma",
    },
    {
      id: "2", 
      title: "Engineering Mathematics Syllabus",
      description: "Complete syllabus breakdown for Engineering Mathematics with topic-wise weightage",
      category: "syllabus" as const,
      subject: "Mathematics",
      semester: "2",
      price: 0,
      isFree: true,
      rating: 4.6,
      downloads: 892,
      uploader: "Priya Gupta",
    },
    {
      id: "3",
      title: "Database Management Systems Previous Papers",
      description: "Last 5 years question papers with solutions and marking scheme",
      category: "papers" as const,
      subject: "Computer Science", 
      semester: "4",
      year: "2019-2023",
      price: 199,
      isFree: false,
      rating: 4.9,
      downloads: 2103,
      uploader: "Rohit Kumar",
    },
    {
      id: "4",
      title: "Thermodynamics Hand-written Notes",
      description: "Beautiful hand-written notes with diagrams and solved examples",
      category: "notes" as const,
      subject: "Mechanical Engg",
      semester: "3",
      price: 249,
      isFree: false,
      rating: 4.7,
      downloads: 678,
      uploader: "Sneha Patel",
    },
    {
      id: "5",
      title: "Digital Electronics Lab Manual",
      description: "Complete lab manual with circuit diagrams and practical exercises",
      category: "notes" as const,
      subject: "Electronics",
      semester: "2",
      price: 0,
      isFree: true,
      rating: 4.5,
      downloads: 445,
      uploader: "Vikash Singh",
    },
    {
      id: "6",
      title: "Operating Systems Mock Tests",
      description: "Practice tests and previous year questions for OS subject",
      category: "papers" as const,
      subject: "Computer Science",
      semester: "5",
      year: "2023",
      price: 149,
      isFree: false,
      rating: 4.8,
      downloads: 567,
      uploader: "Anjali Verma",
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Resources
            </h2>
            <p className="text-xl text-muted-foreground">
              Top-rated and most downloaded academic resources
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredResources.map((resource, index) => (
            <div 
              key={resource.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ResourceCard {...resource} />
            </div>
          ))}
        </div>

        <div className="text-center md:hidden">
          <Button variant="outline">
            View All Resources
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedResources;