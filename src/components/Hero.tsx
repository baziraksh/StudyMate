import { Button } from "@/components/ui/button";
import { Search, BookOpen, FileText, GraduationCap } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Students studying together"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            All Your College Resources
            <span className="block bg-gradient-to-r from-white to-secondary-accent bg-clip-text text-transparent">
              in One Place
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Access premium notes, syllabus, and previous year papers from top students. 
            Boost your academic performance with curated resources.
          </p>

          {/* Search Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for notes, syllabus, papers..."
                  className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-secondary-accent focus:border-transparent"
                />
              </div>
              <Button variant="academic" size="lg">
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Resources
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 border-white/30 text-white hover:bg-white hover:text-primary">
              <FileText className="mr-2 h-5 w-5" />
              Upload & Earn
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, label: "Notes", count: "10,000+" },
              { icon: GraduationCap, label: "Syllabus", count: "500+" },
              { icon: FileText, label: "Question Papers", count: "2,000+" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center animate-scale-in">
                <stat.icon className="h-8 w-8 text-secondary-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.count}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary-accent/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
    </section>
  );
};

export default Hero;