import type { CardData } from './types';

export const DEFAULT_CARDS: CardData[] = [
  {
    id: 'example',
    key: '1',
    title: 'Example Card',
    tags: 'Demo, Tutorial',
    contents: [
      {
        label: 'Version A',
        text: 'This is a demo card to show how this tool works.\n\n- You can add tags and bind a hotkey (e.g. key "1").\n- Try switching to the "Manage" tab to edit this card or add a new card!\n- It supports **Markdown** syntax rendering (e.g., **bold**, *italics*, or `code`).\n- You can also export or import your cards as a JSON file.',
      },
      {
        label: 'Version B',
        text: 'This is an alternative version of the card content.\n\nEach card can store multiple versions of text (like a detailed description and a quick summary) for different copy-paste needs.',
      },
    ],
  },
];
