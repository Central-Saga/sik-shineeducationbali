import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  Shield,
  Home,
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
}

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/dashboard/users",
        },
        {
          title: "Add User",
          url: "/dashboard/users/create",
        },
      ],
    },
    {
      title: "Roles & Permissions",
      url: "/dashboard/roles",
      icon: Shield,
      items: [
        {
          title: "All Roles",
          url: "/dashboard/roles",
        },
        {
          title: "Create Role",
          url: "/dashboard/roles/create",
        },
        {
          title: "Permissions",
          url: "/dashboard/permissions",
        },
      ],
    },
    {
      title: "Students",
      url: "/dashboard/students",
      icon: GraduationCap,
      items: [
        {
          title: "All Students",
          url: "/dashboard/students",
        },
        {
          title: "Add Student",
          url: "/dashboard/students/create",
        },
        {
          title: "Classes",
          url: "/dashboard/students/classes",
        },
      ],
    },
    {
      title: "Courses",
      url: "/dashboard/courses",
      icon: BookOpen,
      items: [
        {
          title: "All Courses",
          url: "/dashboard/courses",
        },
        {
          title: "Create Course",
          url: "/dashboard/courses/create",
        },
        {
          title: "Categories",
          url: "/dashboard/courses/categories",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/dashboard/settings/general",
        },
        {
          title: "Account",
          url: "/dashboard/settings/account",
        },
        {
          title: "Security",
          url: "/dashboard/settings/security",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SIK</span>
                  <span className="text-xs text-sidebar-foreground/70">
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
            {data.navMain.map((item) => {
              const Icon = item.icon || Home
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      <Icon className="size-4" />
                      <span>{item.title}</span>
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
