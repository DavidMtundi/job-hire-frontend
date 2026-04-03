import { FaCheck } from "react-icons/fa6";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export type MatchCardProps = {
  score: number;
  title?: string;
  matching_skills?: string[];
  missing_skills?: string[];
  recommendation?: string;
  /** e.g. max-w-[200px] for dense layouts */
  className?: string;
};

function scoreColors(score: number) {
  if (score >= 90) {
    return {
      bg: "bg-gradient-to-b from-slate-900 to-teal-900",
      ring: "text-teal-400",
      text: "text-teal-400",
      border: "border-teal-500/30",
    };
  }
  if (score >= 80) {
    return {
      bg: "bg-gradient-to-b from-slate-900 to-primary",
      ring: "text-primary",
      text: "text-primary",
      border: "border-primary/30",
    };
  }
  return {
    bg: "bg-gradient-to-b from-slate-900 to-amber-900",
    ring: "text-amber-400",
    text: "text-amber-400",
    border: "border-amber-500/30",
  };
}

export function MatchCard({
  score,
  title,
  matching_skills = [],
  className,
}: MatchCardProps) {
  const colors = scoreColors(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        `${colors.bg} rounded-xl border ${colors.border} backdrop-blur-sm p-3 max-w-[250px]`,
        className
      )}
    >
      <div className="flex justify-center">
        <div className="relative size-28">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
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
              style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-center text-2xl font-bold ${colors.text}`}>{score}%</div>
          </div>
        </div>
      </div>

      {title != null && title !== "" ? (
        <h3 className="mb-2 text-center font-semibold tracking-wide text-white">{title}</h3>
      ) : null}

      {matching_skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {matching_skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="outline">
              <span className="text-xs text-white/90">{skill}</span>
              <FaCheck className={`size-3 ${colors.text}`} />
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
