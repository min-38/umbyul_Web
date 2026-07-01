import Link from "next/link";
import type { ArtistRef } from "@/lib/api";

// 아티스트 이름들을 ", "로 이어 각각 아티스트 페이지로 링크.
export function ArtistLinks({ artists }: { artists: ArtistRef[] }) {
  return (
    <>
      {artists.map((a, i) => (
        <span key={a.id}>
          {i > 0 && ", "}
          <Link href={`/artist/${a.id}`} className="hover:underline">
            {a.name}
          </Link>
        </span>
      ))}
    </>
  );
}
