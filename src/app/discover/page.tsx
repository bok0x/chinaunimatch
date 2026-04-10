import { Suspense } from "react";
import { DiscoverClient } from "./DiscoverClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discover Universities — ChinaUniMatch" };

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverClient />
    </Suspense>
  );
}
