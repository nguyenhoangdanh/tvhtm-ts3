"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TVDisplayCD from "@/components/tv-cd/TVDisplayCD_Mock";

function TVCDPageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  if (!code) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-2xl">
          Missing code parameter. Example: /tv-cd?code=KVHB07CD16
        </div>
      </div>
    );
  }

  return <TVDisplayCD code={code} />;
}

export default function TVCDPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="text-2xl">Loading...</div>
        </div>
      }
    >
      <TVCDPageContent />
    </Suspense>
  );
}
