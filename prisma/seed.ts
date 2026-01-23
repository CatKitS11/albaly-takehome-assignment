import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

// Helper to create a date relative to now
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

// Returns a random date within a given month (for spreading sales across the month)
function getRandomDateInMonth(monthsAgo: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  // Get the last day of the month
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  // Pick a random day between 1 and lastDay
  const randomDay = Math.floor(Math.random() * lastDay) + 1;
  date.setDate(randomDay);
  date.setHours(
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    0
  );
  return date;
}

function getWeekStart(weeksAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - weeksAgo * 7);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFunnelWeek(weeksAgo: number) {
  const visitors = randomInt(10000, 15000);
  
  // To achieve churn rate of 5-25%, purchases must be 75-95% of visitors
  // Churn rate = (visitors - purchases) / visitors * 100
  // Target: 5-25% churn → 75-95% conversion from visitors to purchases
  const targetChurnRate = 0.05 + Math.random() * 0.20; // 5-25% churn
  const purchases = Math.round(visitors * (1 - targetChurnRate));
  
  // Build funnel: visitors > productViews > addToCart > purchases
  // High conversion rates at each step to maintain overall 75-95% conversion
  const addToCart = Math.round(purchases * (1.02 + Math.random() * 0.05)); // purchases + 2-7%
  const productViews = Math.round(addToCart * (1.05 + Math.random() * 0.10)); // addToCart + 5-15%
  
  return {
    weekStart: getWeekStart(weeksAgo),
    visitors,
    productViews: Math.min(productViews, visitors), // Ensure productViews <= visitors
    addToCart: Math.min(addToCart, productViews),   // Ensure addToCart <= productViews
    purchases,
  };
}

async function main() {
  console.log("🗑️  Cleaning up existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventorySnapshot.deleteMany();
  await prisma.funnelWeekly.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating users...");
  // Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@albaly.com",
      passwordHash: hashPassword("admin0001"),
      role: "ADMIN",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: "viewer@albaly.com",
      passwordHash: hashPassword("viewer0001"),
      role: "VIEWER",
    },
  });

  const star = await prisma.user.create({
    data: {
      email: "star@albaly.com",
      passwordHash: hashPassword("star0001"),
      role: "ADMIN",
    },
  });

  console.log("📦 Creating products...");
  // Products - More products for variety
  // We need Product A and Product B for top-selling display
  const products = await Promise.all([
    prisma.product.create({ data: { name: "Product A", price: 150 } }),
    prisma.product.create({ data: { name: "Product B", price: 120 } }),
    prisma.product.create({ data: { name: "Product C", price: 89 } }),
    prisma.product.create({ data: { name: "Product D", price: 199 } }),
    prisma.product.create({ data: { name: "Product E", price: 75 } }),
    prisma.product.create({ data: { name: "SKL-8829", price: 220 } }),
    prisma.product.create({ data: { name: "Atlas Sensor", price: 120 } }),
    prisma.product.create({ data: { name: "Nova Hub", price: 240 } }),
    prisma.product.create({ data: { name: "Pulse Kit", price: 80 } }),
    prisma.product.create({ data: { name: "Signal Pro", price: 310 } }),
  ]);

  const [productA, productB, productC, productD, productE, skl8829] = products;

  console.log("👥 Creating customers...");
  // Create 320 active customers + some inactive (total ~350)
  // Distribution: NA, EU, APAC for regional performance
  // Regional targets: NA $245,000, EU $190,000, APAC $340,000

  const customerData: { region: string; isActive: boolean }[] = [];

  // North America - 125 customers (105 active, 20 inactive)
  for (let i = 0; i < 105; i++) {
    customerData.push({ region: "NA", isActive: true });
  }
  for (let i = 0; i < 20; i++) {
    customerData.push({ region: "NA", isActive: false });
  }

  // Europe - 107 customers (90 active, 17 inactive)
  for (let i = 0; i < 90; i++) {
    customerData.push({ region: "EU", isActive: true });
  }
  for (let i = 0; i < 17; i++) {
    customerData.push({ region: "EU", isActive: false });
  }

  // APAC - 155 customers (137 active, 18 inactive)
  for (let i = 0; i < 137; i++) {
    customerData.push({ region: "APAC", isActive: true });
  }
  for (let i = 0; i < 18; i++) {
    customerData.push({ region: "APAC", isActive: false });
  }

  // Total: 332 active, 55 inactive = 387 customers

  const customers = await Promise.all(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );

  const naCustomers = customers.filter((c) => customerData[customers.indexOf(c)].region === "NA");
  const euCustomers = customers.filter((c) => customerData[customers.indexOf(c)].region === "EU");
  const apacCustomers = customers.filter((c) => customerData[customers.indexOf(c)].region === "APAC");

  console.log("💰 Creating sales data...");
  // Sales data - Need to match:
  // - Total sales count: 1,245
  // - Total revenue: ~$128,490 (for monthly performance)
  // - Product A: $45,230 total
  // - Product B: $32,180 total
  // - Regional: NA $245,000, EU $190,000, APAC $340,000
  // Total Regional = $775,000 (this might be yearly vs monthly)
  
  // Monthly revenue distribution for chart (Jan-Jul):
  // Let's create sales that sum to approximately $128,490 for recent period
  // With +23% growth vs last period

  const salesData: {
    productId: number;
    customerId: number;
    quantity: number;
    amount: number;
    createdAt: Date;
  }[] = [];

  // Product A sales - Total $45,230 (approximately 301 units at $150)
  // Spread across 7 months with random dates within each month
  const productASalesPerMonth = [35, 38, 42, 45, 48, 52, 41]; // quantities per month
  productASalesPerMonth.forEach((qty, monthIdx) => {
    const monthsBack = 6 - monthIdx; // 6 months ago to current
    for (let i = 0; i < Math.ceil(qty / 5); i++) {
      const saleQty = Math.min(5, qty - i * 5);
      if (saleQty > 0) {
        salesData.push({
          productId: productA.id,
          customerId: apacCustomers[i % apacCustomers.length].id,
          quantity: saleQty,
          amount: saleQty * productA.price,
          createdAt: getRandomDateInMonth(monthsBack),
        });
      }
    }
  });

  // Product B sales - Total $32,180 (approximately 268 units at $120)
  const productBSalesPerMonth = [30, 35, 38, 40, 42, 45, 38];
  productBSalesPerMonth.forEach((qty, monthIdx) => {
    const monthsBack = 6 - monthIdx;
    for (let i = 0; i < Math.ceil(qty / 5); i++) {
      const saleQty = Math.min(5, qty - i * 5);
      if (saleQty > 0) {
        salesData.push({
          productId: productB.id,
          customerId: euCustomers[i % euCustomers.length].id,
          quantity: saleQty,
          amount: saleQty * productB.price,
          createdAt: getRandomDateInMonth(monthsBack),
        });
      }
    }
  });

  // Additional sales for other products to reach 1,245 total sales
  // and achieve regional targets
  
  // NA Region - Target ~$245,000
  // Create 300 sales averaging ~$817 each
  for (let i = 0; i < 150; i++) {
    const product = products[i % products.length];
    salesData.push({
      productId: product.id,
      customerId: naCustomers[i % naCustomers.length].id,
      quantity: 3 + (i % 5),
      amount: product.price * (3 + (i % 5)),
      createdAt: getRandomDateInMonth(i % 7),
    });
  }

  // EU Region - Target ~$190,000
  for (let i = 0; i < 120; i++) {
    const product = products[(i + 2) % products.length];
    salesData.push({
      productId: product.id,
      customerId: euCustomers[i % euCustomers.length].id,
      quantity: 2 + (i % 4),
      amount: product.price * (2 + (i % 4)),
      createdAt: getRandomDateInMonth(i % 7),
    });
  }

  // APAC Region - Target ~$340,000 (strongest growth)
  for (let i = 0; i < 200; i++) {
    const product = products[(i + 1) % products.length];
    salesData.push({
      productId: product.id,
      customerId: apacCustomers[i % apacCustomers.length].id,
      quantity: 4 + (i % 6),
      amount: product.price * (4 + (i % 6)),
      createdAt: getRandomDateInMonth(i % 7),
    });
  }

  // Add more sales to reach 1,245 total
  // Current: ~470 + productA + productB sales
  // Need approximately 600 more sales
  for (let i = 0; i < 600; i++) {
    const product = products[i % products.length];
    const customerPool = i % 3 === 0 ? naCustomers : i % 3 === 1 ? euCustomers : apacCustomers;
    salesData.push({
      productId: product.id,
      customerId: customerPool[i % customerPool.length].id,
      quantity: 1 + (i % 4),
      amount: product.price * (1 + (i % 4)),
      createdAt: getRandomDateInMonth(i % 7),
    });
  }

  // Create all sales
  for (const sale of salesData) {
    await prisma.sale.create({ data: sale });
  }

  console.log(`   Created ${salesData.length} sales records`);

  console.log("📊 Creating inventory snapshots...");
  // Inventory Status: 5,600 total (-3%)
  // Create snapshots with total onHand = 5,600
  const inventoryData = [
    { productId: productA.id, onHand: 850, status: "OK", createdAt: daysAgo(0) },
    { productId: productA.id, onHand: 870, status: "OK", createdAt: daysAgo(7) },
    { productId: productA.id, onHand: 890, status: "OK", createdAt: daysAgo(14) },
    
    { productId: productB.id, onHand: 720, status: "OK", createdAt: daysAgo(0) },
    { productId: productB.id, onHand: 750, status: "OK", createdAt: daysAgo(7) },
    { productId: productB.id, onHand: 780, status: "OK", createdAt: daysAgo(14) },
    
    { productId: productC.id, onHand: 650, status: "OK", createdAt: daysAgo(0) },
    { productId: productC.id, onHand: 680, status: "OK", createdAt: daysAgo(7) },
    
    { productId: productD.id, onHand: 580, status: "OK", createdAt: daysAgo(0) },
    { productId: productD.id, onHand: 600, status: "OK", createdAt: daysAgo(7) },
    
    { productId: productE.id, onHand: 920, status: "OK", createdAt: daysAgo(0) },
    { productId: productE.id, onHand: 950, status: "OK", createdAt: daysAgo(7) },
    
    // SKL-8829 with LOW status for the alert
    { productId: skl8829.id, onHand: 15, status: "LOW", createdAt: daysAgo(0) },
    { productId: skl8829.id, onHand: 45, status: "OK", createdAt: daysAgo(7) },
    { productId: skl8829.id, onHand: 80, status: "OK", createdAt: daysAgo(14) },
    
    { productId: products[6].id, onHand: 480, status: "OK", createdAt: daysAgo(0) },
    { productId: products[7].id, onHand: 520, status: "OK", createdAt: daysAgo(0) },
    { productId: products[8].id, onHand: 450, status: "OK", createdAt: daysAgo(0) },
    { productId: products[9].id, onHand: 415, status: "OK", createdAt: daysAgo(0) },
  ];
  // Total current onHand: 850+720+650+580+920+15+480+520+450+415 = 5,600 ✓

  for (const snapshot of inventoryData) {
    await prisma.inventorySnapshot.create({ data: snapshot });
  }

  console.log("📈 Creating funnel data...");
  // Conversion Funnel - Random data for 4 weeks
  // Each week generates realistic funnel metrics with random variation
  
  const funnelData = [
    generateFunnelWeek(0), // Current week
    generateFunnelWeek(1), // 1 week ago
    generateFunnelWeek(2), // 2 weeks ago
    generateFunnelWeek(3), // 3 weeks ago
  ];

  // Log totals for verification
  const totals = funnelData.reduce(
    (acc, week) => ({
      visitors: acc.visitors + week.visitors,
      productViews: acc.productViews + week.productViews,
      addToCart: acc.addToCart + week.addToCart,
      purchases: acc.purchases + week.purchases,
    }),
    { visitors: 0, productViews: 0, addToCart: 0, purchases: 0 }
  );
  console.log(`   Funnel totals: ${totals.visitors} visitors → ${totals.productViews} views → ${totals.addToCart} cart → ${totals.purchases} purchases`);

  for (const funnel of funnelData) {
    await prisma.funnelWeekly.create({ data: funnel });
  }

  console.log("📝 Creating activity logs...");
  // Activity logs matching the UI:
  // - New customer sign-up: Enterprise client from Germany - 2 hours ago
  // - Order #38492 completed: $4,320.00 - 8 items - 5 hours ago
  // - Low inventory alert: Product SKL-8829 below threshold - 1 day ago

  const activityLogs = [
    // Recent activities shown in UI
    {
      userId: star.id,
      status: "INFO",
      description: "New customer sign-up: Enterprise client from Germany",
      createdAt: hoursAgo(2),
    },
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Order #38492 completed: $4,320.00 - 8 items",
      createdAt: hoursAgo(5),
    },
    {
      userId: admin.id,
      status: "WARNING",
      description: "Low inventory alert: Product SKL-8829 below threshold",
      createdAt: daysAgo(1),
    },
    // Additional activity logs
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Admin logged in",
      createdAt: hoursAgo(1),
    },
    {
      userId: star.id,
      status: "SUCCESS",
      description: "Star logged in",
      createdAt: hoursAgo(3),
    },
    {
      userId: viewer.id,
      status: "SUCCESS",
      description: "Viewer logged in",
      createdAt: hoursAgo(4),
    },
    {
      userId: admin.id,
      status: "INFO",
      description: "Reviewed sales dashboard",
      createdAt: hoursAgo(6),
    },
    {
      userId: admin.id,
      status: "INFO",
      description: "Exported monthly report",
      createdAt: daysAgo(2),
    },
    {
      userId: star.id,
      status: "INFO",
      description: "Updated product pricing for Q1",
      createdAt: daysAgo(2),
    },
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Order #38491 completed: $2,180.00 - 4 items",
      createdAt: daysAgo(2),
    },
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Order #38490 completed: $1,560.00 - 3 items",
      createdAt: daysAgo(3),
    },
    {
      userId: star.id,
      status: "INFO",
      description: "New customer sign-up: Tech startup from Japan",
      createdAt: daysAgo(3),
    },
    {
      userId: admin.id,
      status: "WARNING",
      description: "Low inventory alert: Product E below threshold",
      createdAt: daysAgo(4),
    },
    {
      userId: viewer.id,
      status: "INFO",
      description: "Browsed funnel metrics",
      createdAt: daysAgo(4),
    },
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Inventory restocked: 200 units of Product E",
      createdAt: daysAgo(4),
    },
    {
      userId: star.id,
      status: "INFO",
      description: "New customer sign-up: Retail chain from USA",
      createdAt: daysAgo(5),
    },
    {
      userId: admin.id,
      status: "SUCCESS",
      description: "Order #38489 completed: $3,240.00 - 6 items",
      createdAt: daysAgo(5),
    },
    {
      userId: admin.id,
      status: "INFO",
      description: "Generated quarterly insights report",
      createdAt: daysAgo(6),
    },
    {
      userId: star.id,
      status: "SUCCESS",
      description: "APAC region sales milestone: $340,000",
      createdAt: daysAgo(7),
    },
    {
      userId: admin.id,
      status: "INFO",
      description: "Checked inventory levels",
      createdAt: daysAgo(7),
    },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`   - Users: 3`);
  console.log(`   - Customers: ${customers.length} (332 active)`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Sales: ${salesData.length}`);
  console.log(`   - Inventory Snapshots: ${inventoryData.length}`);
  console.log(`   - Funnel Records: ${funnelData.length}`);
  console.log(`   - Activity Logs: ${activityLogs.length}`);
}

main()
  .catch((error) => {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
