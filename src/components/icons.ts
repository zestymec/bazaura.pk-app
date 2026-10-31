/**
 * Icons used by the app, imported one file at a time.
 *
 * `import { X } from 'lucide-react-native'` pulls all ~1,500 icons into the
 * bundle because Metro doesn't tree-shake. Importing each icon's own module
 * keeps only these. Add new icons here, never from the package root.
 */
import type { LucideIcon } from 'lucide-react-native';

const icon = (m: { default: unknown }) => m.default as LucideIcon;

export type { LucideIcon };

export const House = icon(require('lucide-react-native/dist/esm/icons/house.js'));
export const Search = icon(require('lucide-react-native/dist/esm/icons/search.js'));
export const ShoppingBag = icon(require('lucide-react-native/dist/esm/icons/shopping-bag.js'));
export const Heart = icon(require('lucide-react-native/dist/esm/icons/heart.js'));
export const User = icon(require('lucide-react-native/dist/esm/icons/user.js'));
export const ChevronLeft = icon(require('lucide-react-native/dist/esm/icons/chevron-left.js'));
export const ChevronRight = icon(require('lucide-react-native/dist/esm/icons/chevron-right.js'));
export const ChevronDown = icon(require('lucide-react-native/dist/esm/icons/chevron-down.js'));
export const X = icon(require('lucide-react-native/dist/esm/icons/x.js'));
export const Plus = icon(require('lucide-react-native/dist/esm/icons/plus.js'));
export const Minus = icon(require('lucide-react-native/dist/esm/icons/minus.js'));
export const Trash2 = icon(require('lucide-react-native/dist/esm/icons/trash-2.js'));
export const Star = icon(require('lucide-react-native/dist/esm/icons/star.js'));
export const Zap = icon(require('lucide-react-native/dist/esm/icons/zap.js'));
export const Truck = icon(require('lucide-react-native/dist/esm/icons/truck.js'));
export const MapPin = icon(require('lucide-react-native/dist/esm/icons/map-pin.js'));
export const Package = icon(require('lucide-react-native/dist/esm/icons/package.js'));
export const Gift = icon(require('lucide-react-native/dist/esm/icons/gift.js'));
export const Sparkles = icon(require('lucide-react-native/dist/esm/icons/sparkles.js'));
export const SlidersHorizontal = icon(require('lucide-react-native/dist/esm/icons/sliders-horizontal.js'));
export const ArrowUpDown = icon(require('lucide-react-native/dist/esm/icons/arrow-up-down.js'));
export const Check = icon(require('lucide-react-native/dist/esm/icons/check.js'));
export const CircleCheck = icon(require('lucide-react-native/dist/esm/icons/circle-check.js'));
export const Clock = icon(require('lucide-react-native/dist/esm/icons/clock.js'));
export const LogOut = icon(require('lucide-react-native/dist/esm/icons/log-out.js'));
export const Phone = icon(require('lucide-react-native/dist/esm/icons/phone.js'));
export const MessageCircle = icon(require('lucide-react-native/dist/esm/icons/message-circle.js'));
export const ShieldCheck = icon(require('lucide-react-native/dist/esm/icons/shield-check.js'));
export const Banknote = icon(require('lucide-react-native/dist/esm/icons/banknote.js'));
export const RotateCcw = icon(require('lucide-react-native/dist/esm/icons/rotate-ccw.js'));
export const Share2 = icon(require('lucide-react-native/dist/esm/icons/share-2.js'));
export const Pencil = icon(require('lucide-react-native/dist/esm/icons/pencil.js'));
export const ImagePlus = icon(require('lucide-react-native/dist/esm/icons/image-plus.js'));
export const CircleAlert = icon(require('lucide-react-native/dist/esm/icons/circle-alert.js'));
export const WifiOff = icon(require('lucide-react-native/dist/esm/icons/wifi-off.js'));
export const RefreshCw = icon(require('lucide-react-native/dist/esm/icons/refresh-cw.js'));
export const Tag = icon(require('lucide-react-native/dist/esm/icons/tag.js'));
export const Ruler = icon(require('lucide-react-native/dist/esm/icons/ruler.js'));
export const Info = icon(require('lucide-react-native/dist/esm/icons/info.js'));
export const Headphones = icon(require('lucide-react-native/dist/esm/icons/headphones.js'));
export const LayoutGrid = icon(require('lucide-react-native/dist/esm/icons/layout-grid.js'));
export const ArrowLeft = icon(require('lucide-react-native/dist/esm/icons/arrow-left.js'));
export const Ticket = icon(require('lucide-react-native/dist/esm/icons/ticket.js'));
export const CircleX = icon(require('lucide-react-native/dist/esm/icons/circle-x.js'));
