import * as React from "react"
import { cn } from "../../lib/utils"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  SidebarProviderProps
>(({ children, defaultOpen = true, open: openProp, onOpenChange }, ref) => {
  const [openMobile, setOpenMobile] = React.useState(false)
  const [open, setOpen] = React.useState(defaultOpen)

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 768
  }, [])

  const setOpenState = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (onOpenChange) {
        onOpenChange(openState)
      } else {
        setOpen(openState)
      }
    },
    [onOpenChange, open]
  )

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpenState((prev) => !prev)
    }
  }, [isMobile, setOpenState])

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === SIDEBAR_KEYBOARD_SHORTCUT
      ) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const value = React.useMemo<SidebarContext>(
    () => ({
      state: openProp ?? open ? "expanded" : "collapsed",
      open: openProp ?? open,
      setOpen: setOpenState,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [openProp, open, setOpenState, openMobile, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={ref}
        className="group/sidebar-wrapper flex w-full"
        data-sidebar="sidebar"
        data-state={value.state}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sidebarContext = useSidebar()
    const { state, open, isMobile, openMobile } = sidebarContext
    const mobile = isMobile && collapsible === "offcanvas"

    if (collapsible === "none") {
      return (
        <aside
          ref={ref}
          className={cn(
            "flex h-screen w-[--sidebar-width] flex-col bg-charcoal border-r border-charcoal/20",
            className
          )}
          {...props}
        >
          {children}
        </aside>
      )
    }

    return (
      <>
        {mobile && (
          <div
            className={cn(
              "fixed inset-0 z-50 bg-charcoal/50 transition-opacity",
              openMobile ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            onClick={() => sidebarContext.setOpenMobile(false)}
          />
        )}
        <aside
          ref={ref}
          data-state={state}
          data-collapsible={collapsible}
          data-side={side}
          data-mobile={mobile}
          className={cn(
            "group peer flex h-screen flex-col bg-sage border-r border-sage/50 transition-all duration-200",
            side === "right" && "border-l border-r-0",
            variant === "floating" && "m-2 rounded-lg border",
            collapsible === "icon" &&
              state === "collapsed" &&
              "w-16",
            collapsible === "icon" &&
              state === "expanded" &&
              "w-[--sidebar-width]",
            collapsible === "offcanvas" &&
              side === "left" &&
              "fixed left-0 top-0 z-50 translate-x-0 data-[state=collapsed]:-translate-x-full",
            collapsible === "offcanvas" &&
              side === "right" &&
              "fixed right-0 top-0 z-50 translate-x-0 data-[state=collapsed]:translate-x-full",
            mobile && !openMobile && "-translate-x-full",
            !mobile && collapsible === "offcanvas" && "relative translate-x-0",
            "bg-charcoal border-r border-charcoal/20",
            className
          )}
          {...props}
        >
          {children}
        </aside>
      </>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-16 shrink-0 items-center gap-2 border-b border-charcoal/20 px-4", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col gap-2 overflow-auto p-4", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-16 shrink-0 items-center gap-2 border-t border-charcoal/20 px-4", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-xs font-semibold text-ivory uppercase tracking-wider", className)}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ asChild = false, isActive, className, ...props }, ref) => {
  const { state } = useSidebar()

  if (asChild) {
    return <>{props.children}</>
  }

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-ivory hover:bg-charcoal/50 hover:text-ivory",
        isActive && "bg-charcoal/30 text-ivory",
        state === "collapsed" && "justify-center px-2",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-charcoal transition-colors hover:bg-sage/50",
        className
      )}
      {...props}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}

