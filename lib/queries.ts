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
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
        salesCount,
        activeCustomers,
        inventoryData,
        // Sales growth data
        thisMonthSales,
        lastMonthSales,
        // Customer growth data (unique customers with sales)
        thisMonthCustomers,
        lastMonthCustomers,
        // Inventory snapshots for change calculation
        inventorySnapshots,
    ] = await Promise.all([
        prisma.sale.count(),
        prisma.customer.count({ where: { isActive: true } }),
        prisma.inventorySnapshot.aggregate({
            _sum: { onHand: true },
        }),
        // This month sales amount
        prisma.sale.aggregate({
            _sum: { amount: true },
            where: { createdAt: { gte: thisMonthStart } },
        }),
        // Last month sales amount
        prisma.sale.aggregate({
            _sum: { amount: true },
            where: {
                createdAt: { gte: lastMonthStart, lt: thisMonthStart },
            },
        }),
        // Unique customers this month
        prisma.sale.findMany({
            where: { createdAt: { gte: thisMonthStart } },
            select: { customerId: true },
            distinct: ["customerId"],
        }),
        // Unique customers last month
        prisma.sale.findMany({
            where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
            select: { customerId: true },
            distinct: ["customerId"],
        }),
        // Get inventory snapshots grouped by date
        prisma.inventorySnapshot.findMany({
            orderBy: { createdAt: "desc" },
            select: { onHand: true, createdAt: true },
        }),
    ])

    // Calculate sales growth %
    const thisAmount = thisMonthSales._sum.amount ?? 0
    const lastAmount = lastMonthSales._sum.amount ?? 0
    const salesGrowth =
        lastAmount > 0
            ? Math.round(((thisAmount - lastAmount) / lastAmount) * 100)
            : 0

    // Calculate customer growth %
    const thisCustomerCount = thisMonthCustomers.length
    const lastCustomerCount = lastMonthCustomers.length
    const customerGrowth =
        lastCustomerCount > 0
            ? Math.round(
                  ((thisCustomerCount - lastCustomerCount) / lastCustomerCount) * 100
              )
            : 0

    // Calculate inventory change %
    const byDate = inventorySnapshots.reduce(
        (acc, snap) => {
            const dateKey = snap.createdAt.toISOString().split("T")[0]
            acc[dateKey] = (acc[dateKey] || 0) + snap.onHand
            return acc
        },
        {} as Record<string, number>
    )
    const dates = Object.keys(byDate).sort().reverse()
    const latestTotal = byDate[dates[0]] ?? 0
    const previousTotal = byDate[dates[1]] ?? latestTotal
    const inventoryChange =
        previousTotal > 0
            ? Math.round(((latestTotal - previousTotal) / previousTotal) * 100)
            : 0

    return {
        totalSales: salesCount,
        salesGrowth,
        activeCustomers,
        customerGrowth,
        inventoryCount: inventoryData._sum.onHand ?? 0,
        inventoryChange,
    }
}

// Query: Recent activity logs
export async function getRecentActivity(): Promise<ActivityItem[]> {
    const logs = await prisma.activityLog.findMany({
        take: 3,
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
        { stage: "PRODUCT VIEWS", count: latest.productViews, color: "bg-blue-500" },
        { stage: "ADD TO CART", count: latest.addToCart, color: "bg-blue-500" },
        { stage: "PURCHASE", count: latest.purchases, color: "bg-yellow-500" },
    ]
}

// Query: Customer drop-off (churn rate per week)
export async function getCustomerDropOff() {
    const funnelData = await prisma.funnelWeekly.findMany({
      orderBy: { weekStart: 'desc' },
      take: 4,
    })
  
    // calculate drop-off rate from funnel data
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