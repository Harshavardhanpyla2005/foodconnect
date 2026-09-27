import { getFoodNeedsAction } from "@/app/actions/needs"
import { FoodNeedsClientView } from "./food-needs-client-view"

export const dynamic = "force-dynamic"

export default async function FoodNeedsPage() {
  const initialNeeds = await getFoodNeedsAction()
  return <FoodNeedsClientView initialNeeds={initialNeeds} />
}
