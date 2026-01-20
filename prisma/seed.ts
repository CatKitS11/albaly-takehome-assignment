import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInPastMonths(monthsBack: number) {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(now.getMonth() - monthsBack);
  const range = now.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * range);
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventorySnapshot.deleteMany();
  await prisma.funnelWeekly.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@albaly.com",
      passwordHash: "admin123",
      role: "ADMIN",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: "viewer@albaly.com",
      passwordHash: "viewer123",
      role: "VIEWER",
    },
  });

  const customers = await Promise.all([
    prisma.customer.create({ data: { region: "NA", isActive: true } }),
    prisma.customer.create({ data: { region: "NA", isActive: false } }),
    prisma.customer.create({ data: { region: "NA", isActive: true } }),
    prisma.customer.create({ data: { region: "EU", isActive: true } }),
    prisma.customer.create({ data: { region: "EU", isActive: true } }),
    prisma.customer.create({ data: { region: "EU", isActive: false } }),
    prisma.customer.create({ data: { region: "APAC", isActive: true } }),
    prisma.customer.create({ data: { region: "APAC", isActive: true } }),
    prisma.customer.create({ data: { region: "APAC", isActive: false } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { name: "Atlas Sensor", price: 120 } }),
    prisma.product.create({ data: { name: "Nova Hub", price: 240 } }),
    prisma.product.create({ data: { name: "Pulse Kit", price: 80 } }),
    prisma.product.create({ data: { name: "Signal Pro", price: 310 } }),
  ]);

  for (let i = 0; i < 30; i += 1) {
    const product = products[randomInt(0, products.length - 1)];
    const customer = customers[randomInt(0, customers.length - 1)];
    const quantity = randomInt(1, 6);
    await prisma.sale.create({
      data: {
        productId: product.id,
        customerId: customer.id,
        quantity,
        amount: product.price * quantity,
        createdAt: randomDateInPastMonths(6),
      },
    });
  }

  const statuses = ["OK", "LOW", "OUT"];
  for (const product of products) {
    for (const daysAgo of [0, 10, 20]) {
      const captured = new Date();
      captured.setDate(captured.getDate() - daysAgo);
      await prisma.inventorySnapshot.create({
        data: {
          productId: product.id,
          onHand: randomInt(10, 180),
          status: statuses[randomInt(0, statuses.length - 1)],
          createdAt: captured,
        },
      });
    }
  }

  for (let week = 0; week < 4; week += 1) {
    const base = new Date();
    base.setDate(base.getDate() - week * 7);
    const weekStart = getWeekStart(base);
    const visitors = randomInt(400, 900);
    const productViews = Math.round(visitors * 0.6);
    const addToCart = Math.round(productViews * 0.25);
    const purchases = Math.round(addToCart * 0.4);
    await prisma.funnelWeekly.create({
      data: { weekStart, visitors, productViews, addToCart, purchases },
    });
  }

  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        status: "SUCCESS",
        description: "Admin logged in",
      },
      {
        userId: admin.id,
        status: "INFO",
        description: "Reviewed sales dashboard",
      },
      {
        userId: admin.id,
        status: "INFO",
        description: "Checked inventory levels",
      },
      {
        userId: viewer.id,
        status: "SUCCESS",
        description: "Viewer logged in",
      },
      {
        userId: viewer.id,
        status: "INFO",
        description: "Browsed funnel metrics",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error("Error seeding:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
