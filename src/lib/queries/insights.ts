import "server-only";
import { getAdminBookings, AdminBooking } from "@/lib/queries/admin-bookings";

export interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  uniqueCustomers: number;
}

export interface TrendData {
  date: string;
  revenue: number;
  bookings: number;
  customers: number;
}

export interface SportPopularity {
  name: string;
  value: number;
}

export interface SmartStrategy {
  title: string;
  description: string;
  type: "success" | "warning" | "info";
}

export async function getInsightsData() {
  // Fetch up to 1000 recent bookings for analysis
  const bookings = await getAdminBookings(1000);

  // 1. Top Level Metrics
  let totalRevenue = 0;
  const uniquePhones = new Set<string>();
  
  bookings.forEach(b => {
    if (b.status !== "cancelled" && b.status !== "failed") {
      totalRevenue += b.final_amount_paise;
    }
    if (b.customer_phone) {
      uniquePhones.add(b.customer_phone);
    }
  });

  const metrics: DashboardMetrics = {
    totalRevenue: totalRevenue, // Pass as paise to formatPrice
    totalBookings: bookings.length,
    uniqueCustomers: uniquePhones.size,
  };

  // 2. Trend Data over time (Last 14 days)
  const trendMap = new Map<string, { revenue: number; bookings: number; phones: Set<string> }>();
  
  // Pre-fill last 14 days to ensure the graph always renders a full line
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // format as YYYY-MM-DD
    const dateStr = d.toISOString().split('T')[0];
    trendMap.set(dateStr, { revenue: 0, bookings: 0, phones: new Set() });
  }
  
  bookings.forEach(b => {
    if (b.status === "cancelled" || b.status === "failed") return;
    
    // Group by slot_date
    const dateStr = b.slot_date; 
    if (!trendMap.has(dateStr)) {
      trendMap.set(dateStr, { revenue: 0, bookings: 0, phones: new Set() });
    }
    const current = trendMap.get(dateStr)!;
    current.revenue += (b.final_amount_paise / 100); // Stored in rupees
    current.bookings += 1;
    if (b.customer_phone) current.phones.add(b.customer_phone);
  });

  // Sort and format trend data
  const revenueChartData: TrendData[] = Array.from(trendMap.entries())
    .map(([date, data]) => ({ 
      date, 
      revenue: data.revenue, 
      bookings: data.bookings,
      customers: data.phones.size
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Ensure only 14 days are returned

  // 3. Sport Popularity
  const sportMap = new Map<string, number>();
  bookings.forEach(b => {
    const current = sportMap.get(b.sport_name) || 0;
    sportMap.set(b.sport_name, current + 1);
  });

  const popularityData: SportPopularity[] = Array.from(sportMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  // 4. Smart Strategies (Rule-based AI)
  const strategies: SmartStrategy[] = [];

  // Rule 1: High Customer Retention check
  if (metrics.uniqueCustomers > 0) {
    const retentionRate = (metrics.totalBookings - metrics.uniqueCustomers) / metrics.totalBookings;
    if (retentionRate > 0.3) {
      strategies.push({
        title: "High Customer Loyalty",
        description: `Your customers are coming back! About ${Math.round(retentionRate * 100)}% of your bookings are from repeat customers. Consider launching a Loyalty Program to reward them.`,
        type: "success"
      });
    } else {
      strategies.push({
        title: "Improve Customer Retention",
        description: "Most of your bookings are one-off. Try sending a WhatsApp follow-up or a 10% discount coupon to first-time players to encourage them to return.",
        type: "warning"
      });
    }
  }

  // Rule 2: Identify least popular sport
  if (popularityData.length > 1) {
    const sortedSports = [...popularityData].sort((a, b) => a.value - b.value);
    const lowest = sortedSports[0];
    const highest = sortedSports[sortedSports.length - 1];
    
    strategies.push({
      title: `Boost ${lowest.name} Bookings`,
      description: `${lowest.name} is currently your least booked sport (${lowest.value} bookings compared to ${highest.value} for ${highest.name}). Run a weekend special or bundle it with equipment rentals to increase awareness.`,
      type: "info"
    });
  }

  // Rule 3: Time of day analysis
  let morningBookings = 0;
  let eveningBookings = 0;
  
  bookings.forEach(b => {
    const hour = parseInt(b.start_time.split(":")[0]);
    if (hour < 12) morningBookings++;
    if (hour >= 17) eveningBookings++;
  });

  if (morningBookings < eveningBookings * 0.5) {
    strategies.push({
      title: "Fill Empty Morning Slots",
      description: "Morning slots are heavily underutilized compared to evenings. Offer a 'Morning Hustle' discount code specifically for 6 AM - 11 AM slots.",
      type: "warning"
    });
  }

  return {
    metrics,
    revenueChartData,
    popularityData,
    strategies
  };
}
