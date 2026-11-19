import type { ComponentType } from "react"
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BookOpen01Icon,
  ChevronDownIcon as ChevronDownIconData,
  ChevronRightIcon as ChevronRightIconData,
  Clock01Icon,
  Compass01Icon,
  Download04Icon,
  EyeIcon as EyeIconData,
  EyeOffIcon as EyeOffIconData,
  InformationCircleIcon,
  LanguageCircleIcon,
  Loading03Icon,
  MessageMultiple01Icon,
  Mic01Icon,
  Moon01Icon,
  MoreHorizontalCircle01Icon,
  Notification03Icon,
  Refresh01Icon,
  Restaurant01Icon,
  SentIcon,
  Settings01Icon,
  ShoppingBag01Icon,
  Store01Icon,
  Sun01Icon,
  Sun03Icon,
  TestTube01Icon,
  TextFontIcon,
  Tick02Icon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons"

export type AppIconProps = Omit<HugeiconsIconProps, "icon"> & {
  "data-icon"?: string
}

/**
 * Single source of truth for UI icons.
 *
 * Everything in the app renders icons from this module so stroke weight,
 * sizing and colour behaviour stay identical across every surface.
 */
function createIcon(data: IconSvgElement, displayName: string) {
  function AppIcon({
    className = "size-4",
    strokeWidth = 1.6,
    ...props
  }: AppIconProps) {
    return (
      <HugeiconsIcon
        icon={data}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    )
  }

  AppIcon.displayName = displayName
  return AppIcon
}

/* Navigation */
export const LearningIcon = createIcon(BookOpen01Icon, "LearningIcon")
export const TestingIcon = createIcon(TestTube01Icon, "TestingIcon")
export const SettingsIcon = createIcon(Settings01Icon, "SettingsIcon")

/* Scenarios */
export const RestaurantIcon = createIcon(Restaurant01Icon, "RestaurantIcon")
export const ShoppingIcon = createIcon(ShoppingBag01Icon, "ShoppingIcon")
export const DirectionsIcon = createIcon(Compass01Icon, "DirectionsIcon")
export const MarketIcon = createIcon(Store01Icon, "MarketIcon")

/* Actions and status */
export const ArrowLeftIcon = createIcon(ArrowLeft01Icon, "ArrowLeftIcon")
export const ArrowRightIcon = createIcon(ArrowRight01Icon, "ArrowRightIcon")
export const ChevronDownIcon = createIcon(ChevronDownIconData, "ChevronDownIcon")
export const ChevronRightIcon = createIcon(
  ChevronRightIconData,
  "ChevronRightIcon"
)
export const CheckIcon = createIcon(Tick02Icon, "CheckIcon")
export const ClockIcon = createIcon(Clock01Icon, "ClockIcon")
export const DownloadIcon = createIcon(Download04Icon, "DownloadIcon")
export const MoreIcon = createIcon(
  MoreHorizontalCircle01Icon,
  "MoreIcon"
)
export const RefreshIcon = createIcon(Refresh01Icon, "RefreshIcon")
export const LoaderIcon = createIcon(Loading03Icon, "LoaderIcon")

/* Theme and preferences */
export const ThemeIcon = createIcon(Sun03Icon, "ThemeIcon")
export const SunIcon = createIcon(Sun01Icon, "SunIcon")
export const MoonIcon = createIcon(Moon01Icon, "MoonIcon")
export const LanguagesIcon = createIcon(LanguageCircleIcon, "LanguagesIcon")
export const MessageIcon = createIcon(MessageMultiple01Icon, "MessageIcon")
export const TextSizeIcon = createIcon(TextFontIcon, "TextSizeIcon")
export const VolumeIcon = createIcon(VolumeHighIcon, "VolumeIcon")
export const InfoIcon = createIcon(InformationCircleIcon, "InfoIcon")

/* Chat */
export const MicIcon = createIcon(Mic01Icon, "MicIcon")
export const SendIcon = createIcon(SentIcon, "SendIcon")
export const BellIcon = createIcon(Notification03Icon, "BellIcon")
export const EyeIcon = createIcon(EyeIconData, "EyeIcon")
export const EyeOffIcon = createIcon(EyeOffIconData, "EyeOffIcon")

export type AppIcon = ComponentType<AppIconProps>
