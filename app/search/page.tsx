import { searchAll, type SearchResults } from "@/lib/api";
import { SearchView } from "./search-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let results: SearchResults | null = null;
  let error = false;
  if (query) {
    try {
      results = await searchAll(query);
    } catch {
      error = true;
    }
  }

  // key={query} — 새 검색어면 리마운트해서 상태(탭/로드된 결과)를 초기화한다.
  return <SearchView key={query} q={query} results={results} error={error} />;
}
