import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Download, 
  Star, 
  Eye,
  BookOpen,
  FileText,
  GraduationCap
} from "lucide-react";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  category: "notes" | "syllabus" | "papers";
  subject: string;
  semester: string;
  year?: string;
  price: number;
  isFree: boolean;
  rating: number;
  downloads: number;
  uploader: string;
  preview?: string;
  isWishlisted?: boolean;
  isPurchased?: boolean;
}

const ResourceCard = ({
  title,
  description,
  category,
  subject,
  semester,
  year,
  price,
  isFree,
  rating,
  downloads,
  uploader,
  isWishlisted = false,
  isPurchased = false
}: ResourceCardProps) => {
  const categoryIcons = {
    notes: BookOpen,
    syllabus: GraduationCap,
    papers: FileText
  };

  const CategoryIcon = categoryIcons[category];

  const categoryColors = {
    notes: "bg-primary/10 text-primary border-primary/20",
    syllabus: "bg-secondary-accent/10 text-secondary-accent border-secondary-accent/20",
    papers: "bg-accent/10 text-accent border-accent/20"
  };

  return (
    <Card className="group bg-gradient-card hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <Badge variant="outline" className={categoryColors[category]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          </div>
          <button className={`p-1 rounded-full transition-colors ${
            isWishlisted ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          }`}>
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="bg-muted px-2 py-1 rounded">{subject}</span>
          <span className="bg-muted px-2 py-1 rounded">Sem {semester}</span>
          {year && <span className="bg-muted px-2 py-1 rounded">{year}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{downloads}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </div>
        </div>

        {/* Uploader */}
        <div className="text-sm text-muted-foreground">
          By <span className="text-primary font-medium">{uploader}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {isFree ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                FREE
              </Badge>
            ) : (
              <span className="text-2xl font-bold text-primary">₹{price}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 space-y-2">
        {isPurchased ? (
          <Button variant="success" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="default" className="w-full">
              {isFree ? "Get Free" : `Buy for ₹${price}`}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;