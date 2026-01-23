import prisma from "@/lib/prisma"
import type { SalesChartData, DashboardStats, ActivityItem } from "@/lib/types"

// Query: Sales data for chart
export async function getSalesChartData(): Promise<SalesChartData[]> {
    const sales = await prisma.sale.findMany({
        orderBy: { createdAt: "asc" },
        select: {
            createdAt: true,
            amount: true,
            quantity: true,
        },
    })

    // Group by date และ aggregate
    const grouped = sales.reduce((acc, sale) => {
        const dateKey = sale.createdAt.toISOString().split("T")[0]
        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, amount: 0, quantity: 0 }
        }
        acc[dateKey].amount += sale.amount
        acc[dateKey].quantity += sale.quantity
        return acc
    }, {} as Record<string, SalesChartData>)

    return Object.values(grouped).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

// Query: Dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
    const [salesCount, activeCustomers, inventoryData] = await Promise.all([
        prisma.sale.count(),
        prisma.customer.count({ where: { isActive: true } }),
        prisma.inventorySnapshot.aggregate({
            _sum: { onHand: true },
        }),
    ])

    return {
        totalSales: salesCount,
        salesGrowth: 12,
        activeCustomers,
        customerGrowth: 8,
        inventoryCount: inventoryData._sum.onHand ?? 0,
        inventoryChange: -3,
    }
}

// Query: Recent activity logs
export async function getRecentActivity(): Promise<ActivityItem[]> {
    const logs = await prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { email: true } },
        },
    })

    return logs.map((log) => ({
        id: log.id,
        status: log.status,
        description: log.description,
        createdAt: log.createdAt.toISOString(),
        userName: log.user.email,
    }))
}

// Query: Top selling products
export async function getTopProducts() {
    const products = await prisma.sale.groupBy({
        by: ["productId"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
    })

    const productDetails = await prisma.product.findMany({
        where: { id: { in: products.map((p) => p.productId) } },
    })

    return products.map((p) => {
        const product = productDetails.find((pd) => pd.id === p.productId)
        return {
            name: product?.name ?? "Unknown",
            sales: p._sum.amount ?? 0,
        }
    })
}

// Query: Regional sales performance
export async function getRegionalPerformance() {
    const sales = await prisma.sale.findMany({
        include: { customer: { select: { region: true } } },
    })

    const byRegion = sales.reduce(
        (acc, sale) => {
            const region = sale.customer.region
            acc[region] = (acc[region] || 0) + sale.amount
            return acc
        },
        {} as Record<string, number>
    )

    return Object.entries(byRegion).map(([region, sales]) => ({
        region,
        sales,
        color: region === "APAC" ? "bg-green-500" : "bg-blue-500",
    }))
}

// Query: Funnel data
export async function getFunnelData() {
    const funnel = await prisma.funnelWeekly.findMany({
        orderBy: { weekStart: "desc" },
        take: 1,
    })

    if (!funnel.length) return []

    const latest = funnel[0]
    return [
        { stage: "VISITORS", count: latest.visitors, color: "bg-blue-500" },
        { stage: "PRODUCT VIEWS", count: latest.productViews, color: "bg-yellow-500" },
        { stage: "ADD TO CART", count: latest.addToCart, color: "bg-yellow-500" },
        { stage: "PURCHASE", count: latest.purchases, color: "bg-green-500" },
    ]
}

// Query: Customer drop-off (churn rate per week)
export async function getCustomerDropOff() {
    const funnelData = await prisma.funnelWeekly.findMany({
      orderBy: { weekStart: 'desc' },
      take: 4,
    })
  
    // คำนวณ drop-off rate จาก funnel data
    // drop-off = (visitors - purchases) / visitors * 100
    return funnelData.map((week, index) => {
      const dropOffRate = Math.round(
        ((week.visitors - week.purchases) / week.visitors) * 100
      )
      const isHighest = dropOffRate === Math.max(
        ...funnelData.map(w => Math.round(((w.visitors - w.purchases) / w.visitors) * 100))
      )
      
      return {
        week: 4 - index, // Week 1, 2, 3, 4
        rate: dropOffRate,
        highlight: isHighest,
      }
    }).reverse()
  }