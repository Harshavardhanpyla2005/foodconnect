import { getVerifiedNgosAction } from "@/app/actions/ngos"
import { NgosClientView } from "./ngos-client-view"

export const dynamic = "force-dynamic"

export default async function NgosDirectoryPage() {
  const initialNgos = await getVerifiedNgosAction()
  return <NgosClientView initialNgos={initialNgos} />
}
