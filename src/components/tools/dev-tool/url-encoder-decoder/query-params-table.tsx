'use client';

import { Plus, Trash2, Link, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface QueryParamsTableProps {
  baseUrl: string;
  onBaseUrlChange: (newBaseUrl: string) => void;
  params: QueryParamItem[];
  onParamsChange: (newParams: QueryParamItem[]) => void;
}

export default function QueryParamsTable({
  baseUrl,
  onBaseUrlChange,
  params,
  onParamsChange,
}: QueryParamsTableProps) {
  const handleAddParam = () => {
    const newItem: QueryParamItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      key: '',
      value: '',
      enabled: true,
    };
    onParamsChange([...params, newItem]);
  };

  const handleRemoveParam = (id: string) => {
    onParamsChange(params.filter((p) => p.id !== id));
  };

  const handleToggleParam = (id: string) => {
    onParamsChange(
      params.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleKeyChange = (id: string, key: string) => {
    onParamsChange(params.map((p) => (p.id === id ? { ...p, key } : p)));
  };

  const handleValueChange = (id: string, value: string) => {
    onParamsChange(params.map((p) => (p.id === id ? { ...p, value } : p)));
  };

  const handleClearAll = () => {
    onParamsChange([]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
      {/* Base URL Section */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="base-url-input"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <Link size={14} className="text-sky-500" />
          Base URL (without query string)
        </label>
        <Input
          id="base-url-input"
          value={baseUrl}
          onChange={(e) => onBaseUrlChange(e.target.value)}
          placeholder="https://example.com/api/v1/resource"
          className="font-mono text-xs sm:text-sm"
        />
      </div>

      {/* Query Parameters Section Header */}
      <Card className="flex flex-wrap items-center justify-between gap-2 p-3 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Query Parameters ({params.filter((p) => p.enabled).length}/
            {params.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost-sky"
            size="xs"
            rounded="lg"
            icon={Plus}
            onClick={handleAddParam}
          >
            Add Parameter
          </Button>
          {params.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              rounded="lg"
              icon={Trash2}
              onClick={handleClearAll}
              className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
            >
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {/* Query Parameters Table */}
      {params.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          No query parameters yet. Click &quot;Add Parameter&quot; or paste a
          URL above to auto-deconstruct.
        </div>
      ) : (
        <div className="space-y-2.5">
          {params.map((param) => (
            <div
              key={param.id}
              className={cn(
                'flex flex-col gap-2 rounded-lg border p-2.5 transition-all sm:flex-row sm:items-center',
                param.enabled
                  ? 'border-neutral-200 bg-white dark:border-neutral-700/80 dark:bg-neutral-900/90'
                  : 'border-dashed border-neutral-200 bg-neutral-50/50 opacity-60 dark:border-neutral-800 dark:bg-neutral-950/50'
              )}
            >
              {/* Enable / Disable Toggle */}
              <div className="flex items-center justify-between sm:justify-start">
                <Button
                  size="xs"
                  rounded="md"
                  variant={param.enabled ? 'ghost-sky' : 'neutral'}
                  onClick={() => handleToggleParam(param.id)}
                  title={
                    param.enabled ? 'Disable parameter' : 'Enable parameter'
                  }
                  ariaLabel={
                    param.enabled ? 'Disable parameter' : 'Enable parameter'
                  }
                  icon={param.enabled ? Eye : EyeOff}
                  className={cn(
                    'size-7 border p-0 transition-colors',
                    param.enabled
                      ? 'border-sky-300 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400'
                      : 'border-neutral-300 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'
                  )}
                />
              </div>

              {/* Key Input */}
              <div className="flex-1">
                <Input
                  value={param.key}
                  onChange={(e) => handleKeyChange(param.id, e.target.value)}
                  placeholder="Key (e.g., search)"
                  className="h-8 font-mono text-xs"
                />
              </div>

              <span className="hidden text-xs text-neutral-400 sm:inline">
                =
              </span>

              {/* Value Input */}
              <div className="flex-1">
                <Input
                  value={param.value}
                  onChange={(e) => handleValueChange(param.id, e.target.value)}
                  placeholder="Value (e.g., hello world)"
                  className="h-8 font-mono text-xs"
                />
              </div>

              {/* Action: Delete */}
              <div className="flex items-center justify-end">
                <Button
                  size="xs"
                  rounded="md"
                  variant="ghost"
                  onClick={() => handleRemoveParam(param.id)}
                  title="Delete parameter"
                  ariaLabel="Delete parameter"
                  icon={Trash2}
                  className="size-7 border-transparent p-0 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
