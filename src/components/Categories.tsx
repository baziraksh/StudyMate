import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  GraduationCap,
  ArrowRight,
  TrendingUp
} from "lucide-react";

const Categories = () => {
  const categories = [
    {
      icon: BookOpen,
      title: "Notes",
      description: "Comprehensive study notes from top students",
      count: "10,000+",
      color: "primary",
      gradient: "from-primary to-primary/80"
    },
    {
      icon: GraduationCap,
      title: "Syllabus",
      description: "Complete syllabus and course outlines",
      count: "500+", 
      color: "secondary-accent",
      gradient: "from-secondary-accent to-secondary-accent/80"
    },
    {
      icon: FileText,
      title: "Question Papers",
      description: "Previous year exams and sample papers",
      count: "2,000+",
      color: "accent",
      gradient: "from-accent to-accent/80"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore by Category
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need from our comprehensive collection of academic resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {categories.map((category, index) => (
            <Card 
              key={category.title}
              className="group bg-gradient-card hover:shadow-card transition-all duration-300 hover:-translate-y-2 border-border/50 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center relative">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-${category.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className={`h-8 w-8 text-${category.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {category.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <TrendingUp className={`h-4 w-4 text-${category.color}`} />
                    <span className={`text-lg font-semibold text-${category.color}`}>
                      {category.count}
                    </span>
                    <span className="text-sm text-muted-foreground">resources</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="group/btn hover:bg-primary hover:text-primary-foreground"
                  >
                    Browse {category.title}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Premium Quality", desc: "Curated by top students" },
            { title: "Instant Download", desc: "Access immediately after purchase" },
            { title: "Regular Updates", desc: "Fresh content added daily" },
            { title: "Money Back", desc: "30-day guarantee on all purchases" }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center p-4 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;