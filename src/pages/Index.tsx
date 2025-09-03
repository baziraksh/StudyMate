import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedResources from "@/components/FeaturedResources";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Categories />
        <FeaturedResources />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
