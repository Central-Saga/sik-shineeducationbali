"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-gradient-to-r from-white to-muted/20 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary">Ringkasan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-6 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-base">
              Selamat datang di SIK - Sistem Manajemen Shine Education Bali
            </p>
          </div>
          <div className="grid auto-rows-min gap-6 md:grid-cols-3">
            <div className="bg-gradient-card hover:bg-gradient-card-hover border border-primary/20 aspect-video rounded-xl p-6 flex flex-col justify-between items-start transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer">
              <div className="w-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Statistik Cepat</h3>
                <p className="text-sm text-muted-foreground">Ringkasan data penting sistem</p>
              </div>
              <div className="w-full pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Lihat detail →</p>
              </div>
            </div>
            <div className="bg-gradient-card hover:bg-gradient-card-hover border border-secondary/20 aspect-video rounded-xl p-6 flex flex-col justify-between items-start transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer">
              <div className="w-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary-reverse flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Aktivitas Terbaru</h3>
                <p className="text-sm text-muted-foreground">Log aktivitas pengguna sistem</p>
              </div>
              <div className="w-full pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Lihat detail →</p>
              </div>
            </div>
            <div className="bg-gradient-card hover:bg-gradient-card-hover border border-primary/20 aspect-video rounded-xl p-6 flex flex-col justify-between items-start transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer">
              <div className="w-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Notifikasi</h3>
                <p className="text-sm text-muted-foreground">Pemberitahuan penting sistem</p>
              </div>
              <div className="w-full pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Lihat detail →</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
