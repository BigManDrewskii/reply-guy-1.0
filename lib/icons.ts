export {
  // Navigation
  Zap as LogoIcon,
  MessageSquare as OutreachIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,

  // Profile
  User as UserIcon,
  MapPin as LocationIcon,
  Link as WebsiteIcon,
  Users as FollowersIcon,
  BadgeCheck as VerifiedIcon,
  Building2 as CompanyIcon,
  Briefcase as RoleIcon,

  // Platform
  Twitter as XIcon,
  Linkedin as LinkedInIcon,
  Github as GitHubIcon,
  Globe as GenericSiteIcon,

  // Analysis
  Brain as AnalyzeIcon,
  Target as ConfidenceIcon,
  TrendingUp as HighConfIcon,
  TrendingDown as LowConfIcon,
  Sparkles as InsightIcon,

  // Messages
  Copy as CopyIcon,
  Check as CopiedIcon,
  RefreshCw as RegenerateIcon,
  Pencil as EditIcon,
  Send as SendIcon,
  MessageCircle as ReplyIcon,
  Layers as AnglesIcon,

  // Angle tabs
  Handshake as ServiceIcon,
  HeartHandshake as PartnerIcon,
  UsersRound as CommunityIcon,
  Gift as ValueIcon,
  Lightbulb as IdeaIcon,

  // Voice
  AudioWaveform as VoiceIcon,
  Upload as UploadIcon,
  FileText as ExamplesIcon,
  Fingerprint as FingerprintIcon,
  BarChart3 as ScoreIcon,

  // History
  Clock as RecentIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ArrowUpRight as OpenProfileIcon,
  Trash2 as DeleteIcon,

  // Status
  CircleDot as SentIcon,
  CircleCheck as RespondedIcon,
  CircleX as NoResponseIcon,
  Star as ConvertedIcon,

  // Settings
  Key as ApiKeyIcon,
  Eye as ShowIcon,
  EyeOff as HideIcon,
  Database as StorageIcon,
  Trash as ClearDataIcon,
  Info as AboutIcon,
  ExternalLink as ExternalIcon,

  // Feedback
  AlertTriangle as WarningIcon,
  AlertCircle as ErrorIcon,
  CheckCircle2 as SuccessIcon,
  Loader2 as LoaderIcon,
  ChevronDown as ExpandIcon,
  ChevronUp as CollapseIcon,
  ChevronRight as ChevronIcon,
  X as CloseIcon,
  MoreHorizontal as MoreIcon,
  ArrowLeft as BackIcon,
} from 'lucide-react';

export const ICON_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const ICON_DEFAULTS = {
  strokeWidth: 1.5,
  className: 'shrink-0',
} as const;
