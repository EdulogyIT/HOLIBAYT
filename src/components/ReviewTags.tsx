import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";

interface ReviewTagsProps {
  tags?: string[];
}

export const ReviewTags = ({ tags }: ReviewTagsProps) => {
  // Default tags if none provided
  const defaultTags = [
    "Great hospitality",
    "Clean",
    "Quiet area",
    "Great communication",
    "Amazing view",
    "Well maintained"
  ];

  const displayTags = tags && tags.length > 0 ? tags : defaultTags;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <ThumbsUp className="w-5 h-5" />
        What guests loved
      </h3>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};