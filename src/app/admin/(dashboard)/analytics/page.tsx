import { createAdminClient } from "@/lib/supabase";

export default async function AnalyticsOverviewPage() {
  const supabase = createAdminClient();

  // Fetch recent analytics
  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  // Fetch tool usage
  const { data: toolEvents } = await supabase
    .from("tool_usage_events")
    .select("tool_slug, event_type")
    .order("created_at", { ascending: false })
    .limit(100);

  // Aggregate tool usage
  const toolUsage = new Map<string, number>();
  toolEvents?.forEach((event) => {
    if (event.event_type === "tool_start") {
      toolUsage.set(event.tool_slug, (toolUsage.get(event.tool_slug) || 0) + 1);
    }
  });

  const topTools = Array.from(toolUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Aggregate analytics
  const totalImpressions = snapshots?.reduce((sum, s) => sum + (s.impressions || 0), 0) || 0;
  const totalClicks = snapshots?.reduce((sum, s) => sum + (s.clicks || 0), 0) || 0;
  const avgPosition = snapshots?.length
    ? snapshots.reduce((sum, s) => sum + (s.avg_position || 0), 0) / snapshots.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <div className="text-sm text-gray-500">
          Last 30 days
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Impressions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalImpressions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Clicks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Avg Position</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {avgPosition.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Top Tools */}
      {topTools.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Tools</h2>
          <div className="space-y-3">
            {topTools.map(([slug, count]) => (
              <div key={slug} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{slug}</span>
                <span className="text-sm font-medium text-gray-600">{count} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {snapshots && snapshots.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {snapshots.slice(0, 10).map((snapshot) => (
              <div key={snapshot.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{snapshot.date}</span>
                <span className="text-gray-900">
                  {snapshot.impressions || 0} impressions, {snapshot.clicks || 0} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
