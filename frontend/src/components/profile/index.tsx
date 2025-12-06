"use client";

import { Avatar, Label } from "@primer/react";
import { StarIcon } from "@primer/octicons-react";
import { GraphContainer } from "@/components/GraphContainer";
import type { TokenContributionData } from "@/lib/types";

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

export interface ProfileUser {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  rank: number | null;
}

export interface ProfileStatsData {
  totalTokens: number;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  activeDays: number;
  submissionCount?: number;
}

export interface ProfileHeaderProps {
  user: ProfileUser;
  sources: string[];
}

export function ProfileHeader({ user, sources }: ProfileHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-start gap-4 sm:gap-6 mb-6">
        <Avatar
          src={user.avatarUrl || `https://github.com/${user.username}.png`}
          alt={user.username}
          size={96}
          square
          className="ring-4 ring-neutral-200 dark:ring-neutral-700 shadow-xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white truncate">
              {user.displayName || user.username}
            </h1>
            {user.rank && (
              <Label variant={user.rank <= 3 ? "attention" : "secondary"} size="large">
                {user.rank <= 3 && <StarIcon size={14} />}
                <span className={user.rank <= 3 ? "ml-1" : ""}>#{user.rank}</span>
              </Label>
            )}
          </div>
          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 mb-3">
            @{user.username}
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <Label key={source} variant="secondary">
                {source}
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ProfileStatsProps {
  stats: ProfileStatsData;
  dateRange?: { start: string; end: string };
  showHeroCard?: boolean;
}

export function ProfileStats({ stats, dateRange, showHeroCard = false }: ProfileStatsProps) {
  if (showHeroCard) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-green-500/20">
          <p className="text-sm sm:text-base text-green-100 mb-1">Total Cost</p>
          <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(stats.totalCost)}</p>
          {dateRange && (
            <p className="text-xs sm:text-sm text-green-200 mt-1">
              {dateRange.start} - {dateRange.end}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Total Tokens</p>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {formatNumber(stats.totalTokens)}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            ~{(stats.totalTokens / 750).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} words
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Active Days</p>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {stats.activeDays}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            {(stats.totalCost / stats.activeDays).toFixed(2)}/day avg
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Submissions</p>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {stats.submissionCount ?? 1}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Total Tokens</p>
        <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
          {formatNumber(stats.totalTokens)}
        </p>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Total Cost</p>
        <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
          {formatCurrency(stats.totalCost)}
        </p>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Active Days</p>
        <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
          {stats.activeDays}
        </p>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Submissions</p>
        <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
          {stats.submissionCount ?? 1}
        </p>
      </div>
    </div>
  );
}

export interface TokenBreakdownProps {
  stats: ProfileStatsData;
}

export function TokenBreakdown({ stats }: TokenBreakdownProps) {
  const { totalTokens, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens } = stats;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-4">
        Token Breakdown
      </h2>

      {totalTokens > 0 && (
        <div className="mb-6">
          <div className="h-2 rounded-full overflow-hidden flex bg-neutral-100 dark:bg-neutral-800">
            <div
              style={{
                width: `${(inputTokens / totalTokens) * 100}%`,
                backgroundColor: "var(--data-blue-color-emphasis, #006edb)",
              }}
              title={`Input: ${formatNumber(inputTokens)}`}
            />
            <div
              style={{
                width: `${(outputTokens / totalTokens) * 100}%`,
                backgroundColor: "var(--data-purple-color-emphasis, #894ceb)",
              }}
              title={`Output: ${formatNumber(outputTokens)}`}
            />
            <div
              style={{
                width: `${(cacheReadTokens / totalTokens) * 100}%`,
                backgroundColor: "var(--data-green-color-emphasis, #30a147)",
              }}
              title={`Cache Read: ${formatNumber(cacheReadTokens)}`}
            />
            <div
              style={{
                width: `${(cacheWriteTokens / totalTokens) * 100}%`,
                backgroundColor: "var(--data-orange-color-emphasis, #eb670f)",
              }}
              title={`Cache Write: ${formatNumber(cacheWriteTokens)}`}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--data-blue-color-emphasis, #006edb)" }}
          />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Input</p>
            <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
              {formatNumber(inputTokens)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--data-purple-color-emphasis, #894ceb)" }}
          />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Output</p>
            <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
              {formatNumber(outputTokens)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--data-green-color-emphasis, #30a147)" }}
          />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Cache Read</p>
            <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
              {formatNumber(cacheReadTokens)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--data-orange-color-emphasis, #eb670f)" }}
          />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Cache Write</p>
            <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
              {formatNumber(cacheWriteTokens)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ProfileModelsProps {
  models: string[];
}

export function ProfileModels({ models }: ProfileModelsProps) {
  const filteredModels = models.filter((m) => m !== "<synthetic>");

  if (filteredModels.length === 0) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-4">
        Models Used
      </h2>
      <div className="flex flex-wrap gap-2">
        {filteredModels.map((model) => (
          <Label key={model} variant="secondary" size="large">
            {model}
          </Label>
        ))}
      </div>
    </div>
  );
}

export interface ProfileActivityProps {
  data: TokenContributionData;
}

export function ProfileActivity({ data }: ProfileActivityProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-4">
        Activity
      </h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[600px] sm:min-w-0">
          <GraphContainer data={data} />
        </div>
      </div>
    </div>
  );
}

export function ProfileEmptyActivity() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 text-center">
      <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
        No contribution data available yet.
      </p>
    </div>
  );
}

export function MockupBadge() {
  return (
    <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
      <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          <strong>Mockup Preview</strong> — This is a preview using local token usage data from
          your machine.
        </span>
      </p>
    </div>
  );
}

export function ProfileCTA() {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Want your own profile?</h2>
      <p className="text-green-100 mb-4">
        Share your AI token usage and compete on the leaderboard!
      </p>
      <div className="flex flex-wrap gap-3">
        <code className="px-4 py-2 bg-black/20 rounded-lg text-sm font-mono">
          token-tracker login
        </code>
        <code className="px-4 py-2 bg-black/20 rounded-lg text-sm font-mono">
          token-tracker submit
        </code>
      </div>
    </div>
  );
}
