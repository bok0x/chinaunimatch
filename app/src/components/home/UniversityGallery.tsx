import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface GalleryUni {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  ranking: number | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

async function getFeaturedUniversities(): Promise<GalleryUni[]> {
  const supabase = createClient();
  // Prefer ranked universities that have a real cover image
  const { data } = await supabase
    .from("University")
    .select("id, name, slug, city, province, ranking, logoUrl, coverUrl")
    .not("coverUrl", "is", null)
    .not("coverUrl", "ilike", "%school_rank.png%")
    .not("ranking", "is", null)
    .order("ranking", { ascending: true })
    .limit(12);
  return (data ?? []) as GalleryUni[];
}

export async function UniversityGallery() {
  const universities = await getFeaturedUniversities();
  if (universities.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-app">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="badge badge-accent mb-3">Explore</div>
            <h2 className="text-3xl md:text-4xl font-heading font-black">
              Discover by Campus
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Browse top-ranked universities across China
            </p>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-2 text-sm font-semibold flex-shrink-0 transition-colors hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Gallery grid — masonry-like with varying aspect ratios */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {universities.map((uni, idx) => {
            // First item is large (spans 2 cols × 2 rows on desktop)
            const isHero = idx === 0;
            return (
              <Link
                key={uni.id}
                href={`/discover?province=${encodeURIComponent(uni.province)}`}
                className={`group relative rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                  isHero ? "col-span-2 row-span-2" : ""
                }`}
                style={{
                  aspectRatio: isHero ? "1 / 1" : "4 / 3",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                }}
              >
                {/* Cover image */}
                {uni.coverUrl ? (
                  <Image
                    src={uni.coverUrl}
                    alt={`${uni.name} campus`}
                    fill
                    sizes={isHero ? "50vw" : "25vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%)",
                    }}
                  />
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(5,13,26,0.92) 0%, rgba(5,13,26,0.2) 60%, transparent 100%)",
                  }}
                />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* Logo + rank row */}
                  <div className="flex items-center justify-between mb-2">
                    {uni.logoUrl && (
                      <div
                        className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.95)" }}
                      >
                        <Image
                          src={uni.logoUrl}
                          alt={`${uni.name} logo`}
                          width={32}
                          height={32}
                          className="object-contain p-0.5 w-full h-full"
                          unoptimized
                        />
                      </div>
                    )}
                    {uni.ranking && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--color-accent)",
                          color: "#fff",
                        }}
                      >
                        #{uni.ranking}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-heading font-bold leading-tight text-white ${
                      isHero ? "text-xl md:text-2xl" : "text-sm"
                    }`}
                  >
                    {uni.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-white/70">
                    <MapPin size={10} />
                    {uni.city}, China
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
