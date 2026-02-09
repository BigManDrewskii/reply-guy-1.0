import {
  X,
  Linkedin,
  Github,
  User,
  Copy,
  Check,
  RefreshCw,
  Edit,
  Settings,
  History,
  Zap,
  MessageCircle,
  Send,
  XCircle,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Mic,
  Key,
  Home,
  Clock,
  ChevronRight,
  Target,
  Search,
  Trash2,
  ArrowLeft,
  BarChart3,
  SlidersHorizontal,
  AlertOctagon,
  Shield,
  Sparkles,
  BookOpen,
  Fingerprint,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Re-export all icons for convenience
export {
  X,
  Linkedin,
  Github,
  User,
  Copy,
  Check,
  RefreshCw,
  Edit,
  Settings,
  History,
  Zap,
  MessageCircle,
  Send,
  XCircle,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Mic,
  Key,
  Home,
  Clock,
  ChevronRight,
  Target,
  Search,
  Trash2,
  ArrowLeft,
  BarChart3,
  SlidersHorizontal,
  AlertOctagon,
  Shield,
  Sparkles,
  BookOpen,
  Fingerprint,
  Brain,
  ChevronDown,
  ChevronUp,
};

// Icon size variants
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

// Platform icon mapping
export const PLATFORM_ICONS = {
  x: X,
  linkedin: Linkedin,
  github: Github,
  generic: User,
} as const;

export type Platform = keyof typeof PLATFORM_ICONS;

// Helper component for consistent icon sizing
interface IconProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  size?: IconSize;
  className?: string;
}

export function Icon({ icon: IconComponent, size = 'md', className = '' }: IconProps) {
  return <IconComponent size={ICON_SIZES[size]} className={className} />;
}
