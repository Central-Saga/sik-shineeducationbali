import * as React from "react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Shield,
  Home,
  CalendarDays,
  DollarSign,
  Briefcase,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  UserCircle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

// Navigation data untuk aplikasi SIK - Shine Education Bali
type NavItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items?: Array<{
    title: string
    url: string
    isActive?: boolean
  }>
  roles?: string[] // Roles yang bisa akses menu ini
}

const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Owner", "Karyawan"], // Dashboard untuk semua role
  },
  {
    title: "Pengguna",
    url: "/dashboard/users",
    icon: Users,
    roles: ["Admin", "Owner"],
    items: [
      {
        title: "Semua Pengguna",
        url: "/dashboard/users",
      },
      {
        title: "Tambah Pengguna",
        url: "/dashboard/users/create",
      },
    ],
  },
  {
    title: "Peran & Izin",
    url: "/dashboard/roles",
    icon: Shield,
    roles: ["Admin"],
    items: [
      {
        title: "Semua Peran",
        url: "/dashboard/roles",
      },
      {
        title: "Buat Peran",
        url: "/dashboard/roles/create",
      },
      {
        title: "Izin",
        url: "/dashboard/permissions",
      },
    ],
  },
  {
    title: "Karyawan",
    url: "/dashboard/employees",
    icon: Briefcase,
    roles: ["Admin"],
    items: [
      {
        title: "Semua Karyawan",
        url: "/dashboard/employees",
      },
      {
        title: "Tambah Karyawan",
        url: "/dashboard/employees/create",
      },
    ],
  },
  {
    title: "Rekap Bulanan",
    url: "/dashboard/rekap-bulanan",
    icon: FileText,
    roles: ["Owner", "Admin"], // Hanya Owner dan Admin
  },
  {
    title: "Gaji",
    url: "/dashboard/gaji",
    icon: DollarSign,
    roles: ["Owner", "Admin", "Karyawan"], // Semua role bisa akses
  },
  {
    title: "Cuti",
    url: "/dashboard/cuti",
    icon: CalendarDays,
    roles: ["Admin", "Karyawan"],
    items: [
      {
        title: "Semua Cuti",
        url: "/dashboard/cuti",
      },
      {
        title: "Ajukan Cuti",
        url: "/dashboard/cuti/create",
      },
    ],
  },
  {
    title: "Absensi",
    url: "/dashboard/absensi",
    icon: Clock,
    roles: ["Owner", "Admin", "Karyawan"], // Semua role bisa akses
    items: [
      {
        title: "Semua Absensi",
        url: "/dashboard/absensi",
      },
      {
        title: "Tambah Absensi",
        url: "/dashboard/absensi/create",
      },
    ],
  },
  {
    title: "Sesi Kerja",
    url: "/dashboard/sesi-kerja",
    icon: Clock,
    roles: ["Owner", "Admin"], // Hanya Admin dan Owner
    items: [
      {
        title: "Semua Sesi Kerja",
        url: "/dashboard/sesi-kerja",
      },
      {
        title: "Tambah Sesi Kerja",
        url: "/dashboard/sesi-kerja/create",
      },
    ],
  },
  {
    title: "Realisasi Sesi",
    url: "/dashboard/realisasi-sesi",
    icon: Clock,
    roles: ["Owner", "Admin", "Karyawan"], // Semua role bisa akses
    items: [
      {
        title: "Semua Realisasi Sesi",
        url: "/dashboard/realisasi-sesi",
      },
      {
        title: "Ajukan Realisasi Sesi",
        url: "/dashboard/realisasi-sesi/create",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole, hasPermission, loading, logout, user } = useAuth();
  const pathname = usePathname();
  
  // State untuk tracking menu yang terbuka
  const [openSubMenus, setOpenSubMenus] = React.useState<Set<string>>(new Set());
  // State untuk profile dropdown
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  // Ref untuk profile dropdown
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Toggle sub menu
  const toggleSubMenu = (menuTitle: string) => {
    setOpenSubMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuTitle)) {
        newSet.delete(menuTitle);
      } else {
        newSet.add(menuTitle);
      }
      return newSet;
    });
  };

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Filter menu berdasarkan role user
  const filteredNavItems = React.useMemo(() => {
    // Show all items while loading to prevent layout shift
    if (loading) return allNavItems;
    
    return allNavItems.filter((item) => {
      // Jika tidak ada roles yang didefinisikan, tampilkan untuk semua
      if (!item.roles || item.roles.length === 0) return true;
      
      // Check apakah user memiliki salah satu role yang diizinkan
      return item.roles.some(role => hasRole(role));
    });
  }, [hasRole, loading]);

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="bg-white rounded-t-lg p-2 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="p-0 hover:bg-transparent h-auto min-h-0">
              <a href="/dashboard" className="flex items-center justify-center w-full block">
                <div className="w-full">
                  <Image
                    src="/sidebar logo.svg"
                    alt="SIK Shine Education Bali"
                    width={223}
                    height={72}
                    className="w-full h-auto transition-opacity duration-200 hover:opacity-90"
                    style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                    priority
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon || Home
              const hasSubMenu = item.items && item.items.length > 0
              const isSubMenuOpen = openSubMenus.has(item.title)
              const isActive = pathname === item.url || (hasSubMenu && item.items?.some(subItem => pathname === subItem.url))
              
              return (
                <SidebarMenuItem key={item.title}>
                  {hasSubMenu ? (
                    <div className="flex items-center">
                      <SidebarMenuButton asChild isActive={isActive} className="font-medium transition-all duration-200 flex-1">
                        <a href={item.url} className="group flex items-center gap-2">
                          <Icon className="size-4 text-sidebar-primary transition-colors duration-200 group-hover:text-sidebar-accent-foreground" />
                          <span className="transition-colors duration-200 group-hover:text-sidebar-primary flex-1">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleSubMenu(item.title)
                        }}
                        className="p-2 hover:bg-sidebar-accent rounded-md transition-colors duration-200 flex items-center justify-center"
                        aria-label={`Toggle ${item.title} submenu`}
                      >
                        <ChevronDown
                          className={`size-4 text-sidebar-foreground transition-transform duration-200 ${
                            isSubMenuOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <SidebarMenuButton asChild isActive={isActive} className="font-medium transition-all duration-200">
                      <a href={item.url} className="group flex items-center gap-2">
                        <Icon className="size-4 text-sidebar-primary transition-colors duration-200 group-hover:text-sidebar-accent-foreground" />
                        <span className="transition-colors duration-200 group-hover:text-sidebar-primary">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                  {hasSubMenu && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isSubMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <SidebarMenuSub className="ml-0 border-l-0 px-1.5 mt-1">
                        {item.items!.filter((subItem) => {
                          // Filter submenu "Ajukan Realisasi Sesi" - hanya tampilkan jika user memiliki permission
                          if (subItem.title === "Ajukan Realisasi Sesi") {
                            return hasPermission('mengajukan realisasi sesi') || hasPermission('mengelola realisasi sesi');
                          }
                          return true;
                        }).map((subItem) => {
                          const isSubItemActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                                <a href={subItem.url}>{subItem.title}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </div>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div ref={profileRef} className="relative w-full">
                <SidebarMenuButton
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-full justify-start font-medium transition-all duration-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-sm shrink-0">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate w-full">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{user.email}</span>
                    </div>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </SidebarMenuButton>
                {isProfileOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar border border-sidebar-border rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
                    <div className="px-3 py-2 border-b border-sidebar-border">
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium text-foreground text-sm mb-0.5">{user.name}</div>
                        <div className="truncate">{user.email}</div>
                      </div>
                    </div>
                    <SidebarMenuButton
                      asChild
                      className="w-full justify-start rounded-none border-b border-sidebar-border"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Link href="/dashboard/account">
                        <UserCircle className="size-4" />
                        <span>Akun</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      onClick={async () => {
                        try {
                          await logout();
                          toast.success("Logout berhasil");
                          setIsProfileOpen(false);
                        } catch {
                          toast.error("Gagal logout");
                        }
                      }}
                      className="w-full justify-start text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-none"
                    >
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </div>
                )}
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
