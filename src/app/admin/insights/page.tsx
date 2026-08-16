import { AdminHeader } from "@/components/admin/AdminHeader";
import { getInsightsData } from "@/lib/queries/insights";
import { formatPrice } from "@/lib/utils";
import { Users, IndianRupee, CalendarCheck, Lightbulb } from "lucide-react";
import { InsightsCharts } from "@/components/admin/InsightsCharts";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const { metrics, revenueChartData, popularityData, strategies } = await getInsightsData();

  return (
    <>
      <AdminHeader title="Insights & Strategy" />
      <div className="p-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Insights & Strategy
          </h1>
          <p className="text-sm text-white/50">Data-driven analysis of your bookings</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-truf-lime/10 rounded-lg">
                <IndianRupee className="w-6 h-6 text-truf-lime" />
              </div>
              <h3 className="text-lg font-medium text-white/70">Total Revenue</h3>
            </div>
            <p className="text-4xl font-black text-white">{formatPrice(metrics.totalRevenue)}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-white/70">Total Bookings</h3>
            </div>
            <p className="text-4xl font-black text-white">{metrics.totalBookings}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-white/70">Unique Customers</h3>
            </div>
            <p className="text-4xl font-black text-white">{metrics.uniqueCustomers}</p>
          </div>
        </div>

        {/* Charts Component */}
        <InsightsCharts revenueData={revenueChartData} popularityData={popularityData} />

        {/* Smart Strategies Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Smart Strategies
          </h2>
          <p className="text-sm text-white/50 mb-6">Algorithmically generated recommendations to boost your business</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {strategies.length === 0 ? (
              <div className="col-span-full p-8 text-center border border-white/10 rounded-xl bg-white/5">
                <p className="text-white/50">Not enough data to generate strategies yet. Keep getting bookings!</p>
              </div>
            ) : (
              strategies.map((strategy, idx) => {
                let borderClass = "border-white/10";
                let textClass = "text-white";
                
                if (strategy.type === "success") {
                  borderClass = "border-truf-lime/30 bg-truf-lime/5";
                  textClass = "text-truf-lime";
                } else if (strategy.type === "warning") {
                  borderClass = "border-yellow-500/30 bg-yellow-500/5";
                  textClass = "text-yellow-400";
                } else if (strategy.type === "info") {
                  borderClass = "border-blue-500/30 bg-blue-500/5";
                  textClass = "text-blue-400";
                }

                return (
                  <div key={idx} className={`rounded-xl border ${borderClass} p-6 flex flex-col gap-3 transition-transform hover:scale-[1.02]`}>
                    <h3 className={`text-lg font-bold ${textClass}`}>{strategy.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {strategy.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </>
  );
}
