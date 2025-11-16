import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface AgentCardProps {
  name: string;
  role: string;
  avatar: string;
  description: string;
  specialty: string;
}

export const AgentCard = ({ 
  name, 
  role, 
  avatar, 
  description, 
  specialty
}: AgentCardProps) => {
  return (
    <Card className="glass-card p-6 hover-glow-secondary transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-evergreen-glow flex items-center justify-center text-3xl">
          {avatar}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Specialty</div>
          <Badge variant="outline">{specialty}</Badge>
        </div>
      </div>
    </Card>
  );
};
