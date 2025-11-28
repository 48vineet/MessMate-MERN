// src/components/common/Icons.jsx
// Centralized minimal icon system using lucide-react
// All icons in the app should use this file for consistency

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  // Time & Schedule
  CalendarDays,
  Camera,
  Check,
  // Status & Feedback
  CheckCircle,
  ChevronDown,
  // Navigation
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clipboard,
  Clock,
  Coffee,
  Cog,
  CreditCard,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileBarChart,
  // Documents & Data
  FileText,
  Filter,
  Gift,
  Heart,

  // Misc
  HelpCircle,
  // Navigation & Actions
  Home,
  IndianRupee,
  Info,
  // Security & Privacy
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageSquare,
  Minus,
  Moon,
  // Admin & Management
  Package,
  Phone,
  PieChart,
  Plus,
  // QR & Scan
  QrCode,
  RefreshCw,
  Scan,
  Search,
  Settings,
  // Social
  Share2,
  Shield,
  Star,
  // Theme & Display
  Sun,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCircle,
  // User & Profile
  Users,
  // Food & Meals
  UtensilsCrossed,
  // Financial
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";

// Export all icons with consistent naming
export const Icons = {
  // Navigation & Actions
  home: Home,
  menu: MenuIcon,
  calendar: Calendar,
  bell: Bell,
  user: User,
  settings: Settings,
  logout: LogOut,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  close: X,
  check: Check,
  plus: Plus,
  minus: Minus,
  search: Search,
  filter: Filter,

  // Food & Meals
  dining: UtensilsCrossed,
  coffee: Coffee,
  clock: Clock,

  // Financial
  wallet: Wallet,
  card: CreditCard,
  rupee: IndianRupee,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  barChart: BarChart3,
  pieChart: PieChart,

  // User & Profile
  users: Users,
  userCircle: UserCircle,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  camera: Camera,
  edit: Edit,

  // Status & Feedback
  checkCircle: CheckCircle,
  xCircle: XCircle,
  warning: AlertTriangle,
  info: Info,
  star: Star,
  message: MessageSquare,
  like: ThumbsUp,

  // Documents & Data
  document: FileText,
  download: Download,
  upload: Upload,
  clipboard: Clipboard,
  chart: BarChart,

  // QR & Scan
  qrCode: QrCode,
  scan: Scan,

  // Time & Schedule
  calendarDays: CalendarDays,
  calendarCheck: CalendarCheck,

  // Theme & Display
  sun: Sun,
  moon: Moon,
  refresh: RefreshCw,

  // Security & Privacy
  lock: Lock,
  shield: Shield,
  eye: Eye,
  eyeOff: EyeOff,

  // Navigation
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,

  // Admin & Management
  package: Package,
  bookOpen: BookOpen,
  report: FileBarChart,
  cog: Cog,

  // Social
  share: Share2,
  heart: Heart,

  // Misc
  help: HelpCircle,
  gift: Gift,
  bolt: Zap,
  award: Award,
  target: Target,
  activity: Activity,
};

// Default export for convenience
export default Icons;
