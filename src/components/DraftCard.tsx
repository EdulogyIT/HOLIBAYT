import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DraftCardProps {
  type: 'property' | 'blog';
  title: string;
  savedAt: string;
  onResume: () => void;
  onDelete: () => void;
}

export const DraftCard = ({ type, title, savedAt, onResume, onDelete }: DraftCardProps) => {
  const Icon = type === 'property' ? Building2 : FileText;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {title || `Untitled ${type}`}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Saved {formatDistanceToNow(new Date(savedAt), { addSuffix: true })}</span>
              </div>
              <Badge variant="outline" className="mt-2">
                {type === 'property' ? 'Property Draft' : 'Blog Draft'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" onClick={onResume}>
              Resume
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
