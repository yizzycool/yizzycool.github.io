import type { CardData } from './types';

export type StarterPack = {
  id: string;
  name: string;
  description: string;
  badge: string;
  cards: CardData[];
};

export const KEYCARD_STARTER_PACKS: StarterPack[] = [
  {
    id: 'git-cli',
    name: 'Git Everyday CLI',
    description:
      'Daily branching, interactive rebase, stash, and undo recipes.',
    badge: '3 Cards',
    cards: [
      {
        id: 'pack_git_undo',
        key: 'g',
        title: 'Git Undo & Reset Cheats',
        tags: 'Git, CLI, Dev',
        contents: [
          {
            label: 'Undo Last Commit',
            text: '# Keep changes staged\ngit reset --soft HEAD~1\n\n# Discard working directory changes\ngit restore .\n\n# Recover lost commits\ngit reflog',
          },
          {
            label: 'Amend Without Edit',
            text: 'git commit --amend --no-edit',
          },
        ],
      },
      {
        id: 'pack_git_stash',
        key: '',
        title: 'Git Stash & Worktree',
        tags: 'Git, CLI',
        contents: [
          {
            label: 'Stash Named',
            text: 'git stash push -u -m "wip: feature"\ngit stash list\ngit stash pop',
          },
          {
            label: 'Worktree',
            text: 'git worktree add ../hotfix main\ngit worktree remove ../hotfix',
          },
        ],
      },
      {
        id: 'pack_git_log',
        key: '',
        title: 'Git Clean History Graph',
        tags: 'Git, CLI',
        contents: [
          {
            label: 'Pretty Log',
            text: 'git log --oneline --graph --decorate -n 15',
          },
        ],
      },
    ],
  },
  {
    id: 'vscode',
    name: 'VS Code Essentials',
    description: 'Multi-cursor, quick open, refactoring, and navigation keys.',
    badge: '3 Cards',
    cards: [
      {
        id: 'pack_vscode_nav',
        key: 'v',
        title: 'VS Code Navigation',
        tags: 'VS Code, IDE, Shortcuts',
        contents: [
          {
            label: 'macOS',
            text: '- **Quick Open File**: `Cmd + P`\n- **Command Palette**: `Cmd + Shift + P`\n- **Go to Symbol**: `Cmd + Shift + O`\n- **Toggle Terminal**: ``Ctrl + ` ``',
          },
          {
            label: 'Windows / Linux',
            text: '- **Quick Open File**: `Ctrl + P`\n- **Command Palette**: `Ctrl + Shift + P`\n- **Go to Symbol**: `Ctrl + Shift + O`\n- **Toggle Terminal**: ``Ctrl + ` ``',
          },
        ],
      },
      {
        id: 'pack_vscode_edit',
        key: '',
        title: 'VS Code Multi-Cursor & Refactor',
        tags: 'VS Code, IDE',
        contents: [
          {
            label: 'macOS',
            text: '- **Add Next Match**: `Cmd + D`\n- **Select All Matches**: `Cmd + Shift + L`\n- **Move Line Up/Down**: `Option + Up/Down`\n- **Rename Symbol**: `F2`',
          },
          {
            label: 'Windows / Linux',
            text: '- **Add Next Match**: `Ctrl + D`\n- **Select All Matches**: `Ctrl + Shift + L`\n- **Move Line Up/Down**: `Alt + Up/Down`\n- **Rename Symbol**: `F2`',
          },
        ],
      },
      {
        id: 'pack_vscode_split',
        key: '',
        title: 'VS Code Editor Splits',
        tags: 'VS Code, Layout',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Split Editor**: `Cmd/Ctrl + \\`\n- **Focus Group 1/2/3**: `Cmd/Ctrl + 1 / 2 / 3`\n- **Toggle Sidebar**: `Cmd/Ctrl + B`',
          },
        ],
      },
    ],
  },
  {
    id: 'macos',
    name: 'macOS Productivity',
    description:
      'Screenshots, Finder hidden files, Spotlight, and window focus.',
    badge: '3 Cards',
    cards: [
      {
        id: 'pack_macos_capture',
        key: 'm',
        title: 'macOS Screenshots & Recording',
        tags: 'macOS, Productivity',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Selection to File**: `Cmd + Shift + 4`\n- **Selection to Clipboard**: `Cmd + Ctrl + Shift + 4`\n- **Window Capture**: `Cmd + Shift + 4` then `Space`\n- **Screen Recording HUD**: `Cmd + Shift + 5`',
          },
        ],
      },
      {
        id: 'pack_macos_finder',
        key: '',
        title: 'macOS Finder Power Keys',
        tags: 'macOS, Finder',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Show Hidden Dotfiles**: `Cmd + Shift + .`\n- **Go to Folder**: `Cmd + Shift + G`\n- **Copy Path**: `Option + Cmd + C`\n- **Move File (Cut/Paste)**: `Cmd + C` then `Option + Cmd + V`',
          },
        ],
      },
      {
        id: 'pack_macos_system',
        key: '',
        title: 'macOS System & Clipboard',
        tags: 'macOS, System',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Paste & Match Style**: `Option + Shift + Cmd + V`\n- **Emoji Picker**: `Ctrl + Cmd + Space`\n- **Lock Screen**: `Ctrl + Cmd + Q`',
          },
        ],
      },
    ],
  },
  {
    id: 'docker',
    name: 'Docker & DevOps',
    description: 'Container inspection, prune cleanup, and Compose logs.',
    badge: '3 Cards',
    cards: [
      {
        id: 'pack_docker_exec',
        key: 'd',
        title: 'Docker Compose & Exec',
        tags: 'Docker, DevOps, CLI',
        contents: [
          {
            label: 'Commands',
            text: 'docker compose up -d --build\ndocker compose logs -f --tail=100\ndocker exec -it <container> sh',
          },
        ],
      },
      {
        id: 'pack_docker_clean',
        key: '',
        title: 'Docker Disk Cleanup',
        tags: 'Docker, Cleanup',
        contents: [
          {
            label: 'Commands',
            text: 'docker system df\ndocker system prune -af --volumes',
          },
        ],
      },
      {
        id: 'pack_docker_inspect',
        key: '',
        title: 'Docker Network & Ports',
        tags: 'Docker, Network',
        contents: [
          {
            label: 'Commands',
            text: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"\ndocker network ls',
          },
        ],
      },
    ],
  },
  {
    id: 'figma',
    name: 'Figma Design Shortcuts',
    description: 'Auto layout, frames, color picker, and vector alignment.',
    badge: '3 Cards',
    cards: [
      {
        id: 'pack_figma_layout',
        key: 'f',
        title: 'Figma Frame & Auto Layout',
        tags: 'Figma, Design',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Frame Tool**: `F`\n- **Add Auto Layout**: `Shift + A`\n- **Group / Ungroup**: `Cmd/Ctrl + G` / `Cmd/Ctrl + Shift + G`\n- **Create Component**: `Option + Cmd + K`',
          },
        ],
      },
      {
        id: 'pack_figma_inspect',
        key: '',
        title: 'Figma Measure & Inspect',
        tags: 'Figma, Design',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Measure Distance**: Hold `Option / Alt` + Hover\n- **Color Eyedropper**: `I`\n- **Toggle UI**: `Cmd/Ctrl + \\`\n- **Zoom to Fit**: `Shift + 1`',
          },
        ],
      },
      {
        id: 'pack_figma_text',
        key: '',
        title: 'Figma Typography & Copy',
        tags: 'Figma, Design',
        contents: [
          {
            label: 'Shortcuts',
            text: '- **Copy Properties**: `Option + Cmd + C`\n- **Paste Properties**: `Option + Cmd + V`\n- **Text Tool**: `T`',
          },
        ],
      },
    ],
  },
];
