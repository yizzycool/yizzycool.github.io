import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBlock() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="hidden max-w-xl flex-1 px-12 lg:block">
      <div className="group relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-blue-500" />
        <input
          type="text"
          placeholder="搜尋地區、座標或攝影機名稱..."
          className="w-full rounded-full border border-transparent bg-neutral-100 py-2.5 pl-12 pr-6 text-sm outline-none transition-all focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 dark:bg-neutral-800/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
