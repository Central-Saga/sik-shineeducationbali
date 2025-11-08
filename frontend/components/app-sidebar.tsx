import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  Shield,
  Home,
  CalendarDays,
  DollarSign,
  Briefcase,
  Clock,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
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
    roles: ["Admin"], // Dashboard hanya untuk Admin
  },
  {
    title: "Pengguna",
    url: "/dashboard/users",
    icon: Users,
    roles: ["Admin"],
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
    title: "Gaji",
    url: "/dashboard/salaries",
    icon: DollarSign,
    roles: ["Owner", "Admin", "Karyawan"], // Semua role bisa akses
    items: [
      {
        title: "Semua Gaji",
        url: "/dashboard/salaries",
      },
      {
        title: "Buat Gaji",
        url: "/dashboard/salaries/create",
      },
      {
        title: "Kategori",
        url: "/dashboard/salaries/categories",
      },
    ],
  },
  {
    title: "Cuti",
    url: "/dashboard/leaves",
    icon: CalendarDays,
    roles: ["Admin", "Karyawan"],
    items: [
      {
        title: "Semua Cuti",
        url: "/dashboard/leaves",
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
    ],
  },
  {
    title: "Pengaturan",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["Admin"],
    items: [
      {
        title: "Umum",
        url: "/dashboard/settings/general",
      },
      {
        title: "Akun",
        url: "/dashboard/settings/account",
      },
      {
        title: "Keamanan",
        url: "/dashboard/settings/security",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole, loading } = useAuth();

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
      <SidebarHeader className="bg-gradient-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-gradient-primary text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-md">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">SIK</span>
                  <span className="text-xs text-white/90">
                    Shine Education
                  </span>
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
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="font-medium transition-all duration-200">
                    <a href={item.url} className="group flex items-center gap-2">
                      <Icon className="size-4 text-sidebar-primary transition-colors duration-200 group-hover:text-sidebar-accent-foreground" />
                      <span className="transition-colors duration-200 group-hover:text-sidebar-primary">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive || false}>
                            <a href={subItem.url}>{subItem.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
