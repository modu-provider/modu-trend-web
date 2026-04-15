import { AnalysisClient } from "./AnalysisClient";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams?: { keyword?: string; group?: string; age?: string };
}) {
  const keyword = (searchParams?.keyword ?? "").trim();
  const group = (searchParams?.group ?? "female").trim() || "female";
  const age = Number(searchParams?.age ?? "20") || 20;

  return <AnalysisClient keyword={keyword} group={group} age={age} />;
}

