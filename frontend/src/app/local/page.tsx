"use client";

import { useState } from "react";
import type { TokenContributionData } from "@/lib/types";
import { DataInput } from "@/components/DataInput";
import { GraphContainer } from "@/components/GraphContainer";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function LocalViewerPage() {
  const [data, setData] = useState<TokenContributionData | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Local Viewer
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View your token usage data locally without submitting
          </p>
        </div>

        {!data ? (
          <DataInput onDataLoaded={setData} />
        ) : (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Data loaded:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {data.meta.dateRange.start} - {data.meta.dateRange.end}
                </span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${data.summary.totalCost.toFixed(2)} total
                </span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {data.summary.activeDays} active days
                </span>
                <button
                  onClick={() => setData(null)}
                  className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Load Different Data
                </button>
              </div>
            </div>
            <GraphContainer data={data} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
