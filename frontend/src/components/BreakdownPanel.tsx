"use client";

import type { DailyContribution, Theme, SourceType } from "@/lib/types";
import {
  formatDateFull,
  formatCurrency,
  formatTokenCount,
  groupSourcesByType,
  sortSourcesByCost,
} from "@/lib/utils";
import { SOURCE_DISPLAY_NAMES, SOURCE_COLORS } from "@/lib/constants";

interface BreakdownPanelProps {
  day: DailyContribution | null;
  onClose: () => void;
  theme: Theme;
}

export function BreakdownPanel({ day, onClose, theme }: BreakdownPanelProps) {
  if (!day) return null;

  const groupedSources = groupSourcesByType(day.sources);
  const sortedSourceTypes = Array.from(groupedSources.keys()).sort();

  return (
    <div
      className="mt-6 rounded-lg border overflow-hidden"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.meta,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: theme.meta }}
      >
        <h3 className="font-semibold" style={{ color: theme.text }}>
          {formatDateFull(day.date)} - Detailed Breakdown
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: theme.meta }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {day.sources.length === 0 ? (
          <p className="text-center py-4" style={{ color: theme.meta }}>
            No activity on this day
          </p>
        ) : (
          <div className="space-y-4">
            {sortedSourceTypes.map((sourceType) => {
              const sources = sortSourcesByCost(groupedSources.get(sourceType) || []);
              const sourceTotalCost = sources.reduce((sum, s) => sum + s.cost, 0);

              return (
                <SourceSection
                  key={sourceType}
                  sourceType={sourceType}
                  sources={sources}
                  totalCost={sourceTotalCost}
                  theme={theme}
                />
              );
            })}
          </div>
        )}

        {/* Summary */}
        {day.sources.length > 0 && (
          <div
            className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm"
            style={{ borderColor: theme.meta }}
          >
            <div style={{ color: theme.meta }}>
              Total:{" "}
              <span className="font-bold" style={{ color: theme.text }}>
                {formatCurrency(day.totals.cost)}
              </span>
            </div>
            <div style={{ color: theme.meta }}>
              across{" "}
              <span style={{ color: theme.text }}>
                {sortedSourceTypes.length} source{sortedSourceTypes.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ color: theme.meta }}>
              <span style={{ color: theme.text }}>
                {new Set(day.sources.map((s) => s.modelId)).size} model
                {new Set(day.sources.map((s) => s.modelId)).size !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SourceSectionProps {
  sourceType: SourceType;
  sources: DailyContribution["sources"];
  totalCost: number;
  theme: Theme;
}

function SourceSection({ sourceType, sources, totalCost, theme }: SourceSectionProps) {
  const sourceColor = SOURCE_COLORS[sourceType] || theme.grade3;

  return (
    <div>
      {/* Source header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: `${sourceColor}20`,
            color: sourceColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: sourceColor }}
          />
          {SOURCE_DISPLAY_NAMES[sourceType] || sourceType}
        </span>
        <span className="text-sm font-medium" style={{ color: theme.text }}>
          {formatCurrency(totalCost)}
        </span>
      </div>

      {/* Models tree */}
      <div className="ml-4 space-y-2">
        {sources.map((source, index) => (
          <ModelRow
            key={`${source.modelId}-${index}`}
            source={source}
            isLast={index === sources.length - 1}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

interface ModelRowProps {
  source: DailyContribution["sources"][0];
  isLast: boolean;
  theme: Theme;
}

function ModelRow({ source, isLast, theme }: ModelRowProps) {
  const { modelId, providerId, tokens, cost, messages } = source;

  return (
    <div className="relative">
      {/* Tree connector */}
      <div
        className="absolute left-0 top-0 w-4 h-full"
        style={{ color: theme.meta }}
      >
        <span className="absolute left-0 top-2.5 w-3 border-t" style={{ borderColor: theme.meta }} />
        {!isLast && (
          <span
            className="absolute left-0 top-0 h-full border-l"
            style={{ borderColor: theme.meta }}
          />
        )}
      </div>

      <div className="ml-5">
        {/* Model name and provider */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm" style={{ color: theme.text }}>
            {modelId}
          </span>
          {providerId && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${theme.meta}20`,
                color: theme.meta,
              }}
            >
              {providerId}
            </span>
          )}
          <span className="font-medium text-sm" style={{ color: theme.grade4 }}>
            {formatCurrency(cost)}
          </span>
        </div>

        {/* Token breakdown */}
        <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-1 text-xs">
          {tokens.input > 0 && (
            <TokenBadge label="Input" value={tokens.input} theme={theme} />
          )}
          {tokens.output > 0 && (
            <TokenBadge label="Output" value={tokens.output} theme={theme} />
          )}
          {tokens.cacheRead > 0 && (
            <TokenBadge label="Cache Read" value={tokens.cacheRead} theme={theme} />
          )}
          {tokens.cacheWrite > 0 && (
            <TokenBadge label="Cache Write" value={tokens.cacheWrite} theme={theme} />
          )}
          {tokens.reasoning > 0 && (
            <TokenBadge label="Reasoning" value={tokens.reasoning} theme={theme} />
          )}
        </div>

        {/* Messages count */}
        <div className="mt-1 text-xs" style={{ color: theme.meta }}>
          {messages.toLocaleString()} message{messages !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

interface TokenBadgeProps {
  label: string;
  value: number;
  theme: Theme;
}

function TokenBadge({ label, value, theme }: TokenBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      <span style={{ color: theme.meta }}>{label}:</span>
      <span className="font-mono" style={{ color: theme.text }}>
        {formatTokenCount(value)}
      </span>
    </div>
  );
}
