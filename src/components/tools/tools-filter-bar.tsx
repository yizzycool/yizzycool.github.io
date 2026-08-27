'use client';

import { Search } from 'lucide-react';
import Input from '@/components/common/input';
import { cn } from '@/utils/cn';
import CategoryChip from './category-chip';

type ToolsFilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { id: string; name: string; count: number }[];
  totalToolsCount: number;
  className?: string;
};

export default function ToolsFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalToolsCount,
  className,
}: ToolsFilterBarProps) {
  const allTools = {
    id: 'All',
    name: 'All',
    count: totalToolsCount,
  };

  return (
    <div className={cn('mt-8 space-y-4', className)}>
      {/* Search Input Bar */}
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        icon={Search}
        placeholder="Search tools by name or keyword..."
      />

      {/* Category Chips Bar */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        {[allTools, ...categories].map((cat) => (
          <CategoryChip
            key={cat.id}
            name={cat.name}
            count={cat.count}
            isSelected={selectedCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
