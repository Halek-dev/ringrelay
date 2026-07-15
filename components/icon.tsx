import {
  Clock,
  CalendarCheck,
  MessageSquareText,
  ShieldCheck,
  Languages,
  RefreshCw,
  Wind,
  Wrench,
  Droplets,
  LayoutDashboard,
  CalendarRange,
  Users,
  Building2,
  MessageSquareQuote,
  UserPlus,
  Trophy,
  DollarSign,
  MessageSquare,
  Send,
  XCircle,
  Phone,
  Star,
  UserCog,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Clock,
  CalendarCheck,
  MessageSquareText,
  ShieldCheck,
  Languages,
  RefreshCw,
  Wind,
  Wrench,
  Droplets,
  LayoutDashboard,
  CalendarRange,
  Users,
  Building2,
  MessageSquareQuote,
  UserPlus,
  Trophy,
  DollarSign,
  MessageSquare,
  Send,
  XCircle,
  Phone,
  Star,
  UserCog,
  BookOpen,
};

/** Render a lucide icon by the string name stored in mock-data. */
export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2.2,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = MAP[name] ?? Clock;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} />;
}
