import { FaCheck } from "react-icons/fa6";
import { Badge } from "~/components/ui/badge";

interface MatchCardProps {
  score: number;
  title?: string;
  matching_skills?: string[];
  missing_skills?: string[];
  recommendation?: string;
}

export const MatchCard = ({ score, title, matching_skills, missing_skills, recommendation }: MatchCardProps) => {
  const getColors = (score: number) => {
    if (score >= 90) {
      return {
        bg: 'bg-gradient-to-b from-slate-900 to-teal-900',
        ring: 'text-teal-400',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
      };
    } else if (score >= 80) {
      return {
        bg: 'bg-gradient-to-b from-slate-900 to-blue-900',
        ring: 'text-blue-400',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      };
    } else {
      return {
        bg: 'bg-gradient-to-b from-slate-900 to-amber-900',
        ring: 'text-amber-400',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    }
  };


  const colors = getColors(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`${colors.bg} rounded-xl max-w-[200] border ${colors.border} backdrop-blur-sm p-3`}
    >
      {/* Circular Progress */}
      <div className="flex justify-center">
        <div className="relative size-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={colors.ring}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${colors.text}`}>{score}%</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-white text-center font-semibold tracking-wide mb-2">{title}</h3>

      {matching_skills?.length && <div className="flex flex-wrap gap-2">
        {matching_skills.slice(0, 5).map((skill) => (
          <Badge key={skill} variant="outline">
            <span className="text-xs text-white/90">{skill}</span>
            <FaCheck className={`size-3 ${colors.text}`} />
          </Badge>
        ))}
      </div>}
    </div>
  );
};