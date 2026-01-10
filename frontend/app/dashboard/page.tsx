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
import { useAuth } from "@/hooks/use-auth"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { BarChart, type BarChartDataPoint } from "@/components/charts/bar-chart"
import { PieChart, type PieChartDataPoint } from "@/components/charts/pie-chart"
import { getDashboardStatistics, getChartData } from "@/lib/api/dashboard"
import type { DashboardStatistics } from "@/lib/api/dashboard"
import {
  Users,
  Briefcase,
  Clock,
  CalendarDays,
  DollarSign,
  FileText,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const { user, hasRole, loading: authLoading } = useAuth()
  const [statistics, setStatistics] = React.useState<DashboardStatistics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [barChartData, setBarChartData] = React.useState<BarChartDataPoint[]>([])
  const [pieChartData, setPieChartData] = React.useState<PieChartDataPoint[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch statistics
        const stats = await getDashboardStatistics()
        setStatistics(stats)

        // Fetch chart data based on role
        if (hasRole("Admin")) {
          const [absensiTrend, cutiDistribution] = await Promise.all([
            getChartData("absensi-trend"),
            getChartData("cuti-distribution"),
          ])
          setBarChartData(absensiTrend as BarChartDataPoint[])
          setPieChartData(cutiDistribution as PieChartDataPoint[])
        } else if (hasRole("Owner")) {
          const [gajiTrend, realisasiDistribution] = await Promise.all([
            getChartData("gaji-trend"),
            getChartData("realisasi-sesi-distribution"),
          ])
          setBarChartData(gajiTrend as BarChartDataPoint[])
          setPieChartData(realisasiDistribution as PieChartDataPoint[])
        } else if (hasRole("Karyawan")) {
          try {
            const [absensiBulan, realisasiStatus] = await Promise.all([
              getChartData("absensi-bulan-ini"),
              getChartData("realisasi-sesi-status"),
            ])
            setBarChartData(absensiBulan as BarChartDataPoint[])
            setPieChartData(realisasiStatus as PieChartDataPoint[])
          } catch (chartError) {
            // Jika chart error, set empty array (chart tidak wajib)
            console.warn("Chart data error:", chartError)
            setBarChartData([])
            setPieChartData([])
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data dashboard"
        setError(errorMessage)
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, hasRole, authLoading])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (authLoading || loading) {
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
          <div className="flex items-center justify-center h-screen">
            <p className="text-muted-foreground">Memuat dashboard...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
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
          <div className="flex items-center justify-center h-screen">
            <p className="text-destructive">{error}</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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

          {/* Cards Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hasRole("Admin") && statistics && (
              <>
                <DashboardCard
                  title="Total Pengguna"
                  value={statistics.total_users || 0}
                  icon={Users}
                  href="/dashboard/users"
                  iconColor="bg-blue-500"
                />
                <DashboardCard
                  title="Total Karyawan"
                  value={statistics.total_karyawan || 0}
                  icon={Briefcase}
                  href="/dashboard/employees"
                  iconColor="bg-green-500"
                />
                <DashboardCard
                  title="Absensi Hari Ini"
                  value={statistics.absensi_hari_ini || 0}
                  icon={Clock}
                  href="/dashboard/absensi"
                  iconColor="bg-purple-500"
                />
                <DashboardCard
                  title="Cuti Pending"
                  value={statistics.cuti_pending || 0}
                  icon={CalendarDays}
                  href="/dashboard/cuti"
                  iconColor="bg-yellow-500"
                />
                <DashboardCard
                  title="Realisasi Sesi Pending"
                  value={statistics.realisasi_sesi_pending || 0}
                  icon={Clock}
                  href="/dashboard/realisasi-sesi"
                  iconColor="bg-orange-500"
                />
                <DashboardCard
                  title="Total Gaji Bulan Ini"
                  value={formatCurrency(statistics.total_gaji_bulan_ini || 0)}
                  icon={DollarSign}
                  href="/dashboard/gaji"
                  iconColor="bg-emerald-500"
                />
              </>
            )}

            {hasRole("Owner") && statistics && (
              <>
                <DashboardCard
                  title="Total Karyawan"
                  value={statistics.total_karyawan || 0}
                  icon={Briefcase}
                  href="/dashboard/employees"
                  iconColor="bg-green-500"
                />
                <DashboardCard
                  title="Total Gaji Bulan Ini"
                  value={formatCurrency(statistics.total_gaji_bulan_ini || 0)}
                  icon={DollarSign}
                  href="/dashboard/gaji"
                  iconColor="bg-emerald-500"
                />
                <DashboardCard
                  title="Total Rekap Bulanan"
                  value={statistics.total_rekap_bulanan || 0}
                  icon={FileText}
                  href="/dashboard/rekap-bulanan"
                  iconColor="bg-blue-500"
                />
                <DashboardCard
                  title="Realisasi Sesi Pending"
                  value={statistics.realisasi_sesi_pending || 0}
                  icon={Clock}
                  href="/dashboard/realisasi-sesi"
                  iconColor="bg-orange-500"
                />
                <DashboardCard
                  title="Gaji yang Perlu Disetujui"
                  value={statistics.gaji_perlu_disetujui || 0}
                  icon={DollarSign}
                  href="/dashboard/gaji?status=draft"
                  iconColor="bg-red-500"
                />
              </>
            )}

            {hasRole("Karyawan") && statistics && (
              <>
                <DashboardCard
                  title="Absensi Hari Ini"
                  value={statistics.absensi_hari_ini || 0}
                  icon={Clock}
                  href="/dashboard/absensi"
                  iconColor="bg-purple-500"
                />
                <DashboardCard
                  title="Cuti Tersisa"
                  value={statistics.cuti_tersisa || 0}
                  icon={CalendarDays}
                  href="/dashboard/cuti"
                  iconColor="bg-yellow-500"
                />
                <DashboardCard
                  title="Gaji Terakhir"
                  value={
                    statistics.gaji_terakhir
                      ? formatCurrency(statistics.gaji_terakhir.total_gaji)
                      : "Belum ada"
                  }
                  description={
                    statistics.gaji_terakhir
                      ? `Periode: ${statistics.gaji_terakhir.periode}`
                      : undefined
                  }
                  icon={DollarSign}
                  href="/dashboard/gaji"
                  iconColor="bg-emerald-500"
                />
                <DashboardCard
                  title="Realisasi Sesi Saya"
                  value={statistics.realisasi_sesi_saya || 0}
                  icon={Clock}
                  href="/dashboard/realisasi-sesi"
                  iconColor="bg-orange-500"
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          {(barChartData.length > 0 || pieChartData.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {barChartData.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <BarChart
                      data={barChartData}
                      title={
                        hasRole("Admin")
                          ? "Trend Absensi 7 Hari Terakhir"
                          : hasRole("Owner")
                          ? "Trend Gaji 6 Bulan Terakhir"
                          : "Absensi Saya Bulan Ini"
                      }
                      color={
                        hasRole("Admin")
                          ? "#3B82F6"
                          : hasRole("Owner")
                          ? "#10B981"
                          : "#8B5CF6"
                      }
                    />
                  </CardContent>
                </Card>
              )}

              {pieChartData.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <PieChart
                      data={pieChartData}
                      title={
                        hasRole("Admin")
                          ? "Distribusi Status Cuti"
                          : hasRole("Owner")
                          ? "Distribusi Status Realisasi Sesi"
                          : "Status Realisasi Sesi Saya"
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
