"use client";

import { Nav } from "@/components/Nav";
import { PublicWall } from "@/components/PublicWall";

export default function WallPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">The Wall</h1>
        <PublicWall />
      </main>
    </div>
  );
}
