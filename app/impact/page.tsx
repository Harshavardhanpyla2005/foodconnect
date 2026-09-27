import { getImpactMetricsAction } from "@/app/actions/impact"
import { ImpactClientView } from "./impact-client-view"

export const dynamic = "force-dynamic"

export default async function ImpactPage() {
  const metrics = await getImpactMetricsAction()
  return <ImpactClientView initialData={metrics} />
}
