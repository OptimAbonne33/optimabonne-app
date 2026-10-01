import { createClient } from "@/lib/supabase/server";
import { loadOptimization } from "@/lib/data";
import { RecommendationsView } from "@/components/recommendations/recommendations-view";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { result } = await loadOptimization(user!.id);

  return (
    <RecommendationsView
      recommendations={result.recommendations}
      totalSavings={result.totalSavings}
      annualSavings={result.annualSavings}
    />
  );
}
