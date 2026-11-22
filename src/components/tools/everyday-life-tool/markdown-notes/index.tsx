'use client';

import type { ChangeEvent } from 'react';
import type { QuickCaptureBarHandle } from './quick-capture-bar';

import { useRef, useState } from 'react';

import HeaderBlock from '@/components/tools/common/header-block';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useSpeechSynthesis from '@/hooks/window/use-speech-synthesis';

import useLocalFolderSync from './hooks/use-local-folder-sync';
import useMarkdownNotes from './hooks/use-markdown-notes';
import KeepTakeoutImportModal from './keep-takeout-import-modal';
import NoteEditorModal from './note-editor-modal';
import NotesGrid from './notes-grid';
import NotesGuideModal from './notes-guide-modal';
import NotesToolbar from './notes-toolbar';
import QuickCaptureBar from './quick-capture-bar';

export default function MarkdownNotes() {
  const quickCaptureRef = useRef<QuickCaptureBarHandle>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const {
    isOpen: isConfirmDialogOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  const {
    isLoaded,
    notes,
    existingNoteTitles,
    prefs,
    updatePrefs,
    setLayout,
    toggleRevealAllSpoilers,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    selectedLabel,
    setSelectedLabel,
    viewScope,
    setViewScope,
    scopeCounts,
    allLabels,
    pinnedNotes,
    otherNotes,
    editingNote,
    setEditingNoteId,
    isImportModalOpen,
    setIsImportModalOpen,
    createNote,
    updateNote,
    togglePin,
    changeColor,
    toggleArchive,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
    duplicateNote,
    reorderNotes,
    findOrCreateNoteByTitle,
    applyExternalNotesUpdate,
    toggleNoteCheckbox,
    importParsedNotes,
    exportMarkdownZip,
    exportJsonBackup,
    importJsonBackup,
  } = useMarkdownNotes({
    onTriggerNewNote: () => quickCaptureRef.current?.expandAndFocus(),
    suppressEscape: isConfirmDialogOpen || isGuideModalOpen,
  });

  const {
    syncState,
    connectFolder,
    reconnectFolder,
    syncNow,
    disconnectFolder,
  } = useLocalFolderSync({
    notes,
    isLoaded,
    onCommitSyncedNotes: applyExternalNotesUpdate,
  });

  const {
    isSupported: ttsSupported,
    isSpeaking,
    speak,
    stop,
  } = useSpeechSynthesis();
  const [speakingNoteId, setSpeakingNoteId] = useState<string | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const labelNames = allLabels.map((l) => l.name);
  const isReorderEnabled =
    viewScope === 'active' && !searchQuery.trim() && !selectedLabel;

  const handleBackupFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void importJsonBackup(file);
    }
    e.target.value = '';
  };

  const handleSpeakNote = (noteId: string, text: string) => {
    setSpeakingNoteId(noteId);
    speak(text, { rate: prefs.ttsRate, lang: prefs.ttsLang });
  };

  const handleStopSpeech = () => {
    setSpeakingNoteId(null);
    stop();
  };

  const handleRequestDeletePermanently = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    const noteTitle = target?.title.trim();

    void confirm({
      title: 'Delete Note Permanently',
      message: noteTitle
        ? `Permanently delete "${noteTitle}"? This action cannot be undone.`
        : 'Permanently delete this untitled note? This action cannot be undone.',
      confirmText: 'Delete Forever',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: () => deletePermanently(noteId),
    });
  };

  const handleRequestEmptyTrash = () => {
    void confirm({
      title: 'Empty Trash',
      message: `Permanently delete all ${scopeCounts.trash} note${scopeCounts.trash === 1 ? '' : 's'} in Trash? This action cannot be undone.`,
      confirmText: 'Empty Trash',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: emptyTrash,
    });
  };

  return (
    <div>
      {/* Header Block with Shortcuts */}
      <HeaderBlock
        customShortcuts={[
          { symbol: '/', label: 'Focus Search Notes' },
          { symbol: 'N', label: 'New Quick Note' },
          { symbol: 'Mod + E', label: 'Toggle Read / Edit in Modal' },
          { ...TOOL_HOTKEYS.process, label: 'Save Quick Capture Note' },
          { ...TOOL_HOTKEYS.clear, label: 'Close Editor / Clear Search' },
          TOOL_HOTKEYS.help,
        ]}
      />

      {/* Top Command Toolbar: Scope Tabs, Search, View Controls, Import / Export */}
      <NotesToolbar
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewScope={viewScope}
        onViewScopeChange={setViewScope}
        scopeCounts={scopeCounts}
        layout={prefs.layout}
        onToggleLayout={() =>
          setLayout(prefs.layout === 'masonry' ? 'list' : 'masonry')
        }
        revealAllSpoilers={prefs.revealAllSpoilers}
        onToggleRevealAllSpoilers={toggleRevealAllSpoilers}
        allLabels={allLabels}
        selectedLabel={selectedLabel}
        onSelectLabel={setSelectedLabel}
        folderSync={syncState}
        onConnectFolder={() => void connectFolder()}
        onReconnectFolder={() => void reconnectFolder()}
        onSyncFolderNow={() => void syncNow()}
        onDisconnectFolder={() => void disconnectFolder()}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportMarkdownZip={exportMarkdownZip}
        onExportJsonBackup={exportJsonBackup}
        onTriggerRestoreJson={() => backupInputRef.current?.click()}
      />

      {/* Quick Capture Input Bar (Shown in Active view) */}
      {viewScope === 'active' && (
        <div className="mt-4">
          <QuickCaptureBar
            ref={quickCaptureRef}
            existingLabels={labelNames}
            onCreateNote={createNote}
          />
        </div>
      )}

      {/* Masonry / List Notes Wall */}
      <div className="mt-5">
        <NotesGrid
          isLoaded={isLoaded}
          viewScope={viewScope}
          layout={prefs.layout}
          searchQuery={searchQuery}
          selectedLabel={selectedLabel}
          pinnedNotes={pinnedNotes}
          otherNotes={otherNotes}
          isReorderEnabled={isReorderEnabled}
          revealAllSpoilers={prefs.revealAllSpoilers}
          ttsSupported={ttsSupported}
          speakingNoteId={isSpeaking ? speakingNoteId : null}
          existingNoteTitles={existingNoteTitles}
          onOpenNote={(id) => setEditingNoteId(id)}
          onTogglePin={togglePin}
          onChangeColor={changeColor}
          onToggleArchive={toggleArchive}
          onMoveToTrash={moveToTrash}
          onRestoreFromTrash={restoreFromTrash}
          onDeletePermanently={handleRequestDeletePermanently}
          onDuplicate={duplicateNote}
          onReorderNotes={reorderNotes}
          onToggleCheckbox={toggleNoteCheckbox}
          onNavigateWikiLink={(targetTitle) =>
            void findOrCreateNoteByTitle(targetTitle)
          }
          onSelectLabel={setSelectedLabel}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedLabel(null);
          }}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onRequestEmptyTrash={handleRequestEmptyTrash}
          onSpeakNote={handleSpeakNote}
          onStopSpeech={handleStopSpeech}
        />
      </div>

      {/* Focus Editor & Reader Modal */}
      {editingNote && (
        <NoteEditorModal
          key={editingNote.id}
          note={editingNote}
          allNotes={notes}
          existingLabels={labelNames}
          existingNoteTitles={existingNoteTitles}
          prefs={prefs}
          ttsSupported={ttsSupported}
          isTtsSpeaking={isSpeaking && speakingNoteId === editingNote.id}
          onOpenNote={(id) => setEditingNoteId(id)}
          onNavigateWikiLink={(targetTitle) =>
            void findOrCreateNoteByTitle(targetTitle)
          }
          onUpdatePrefs={updatePrefs}
          onUpdateNote={updateNote}
          onTogglePin={togglePin}
          onToggleArchive={toggleArchive}
          onMoveToTrash={moveToTrash}
          onRestoreFromTrash={restoreFromTrash}
          onDeletePermanently={handleRequestDeletePermanently}
          onToggleCheckbox={toggleNoteCheckbox}
          onSpeakText={(text) => handleSpeakNote(editingNote.id, text)}
          onStopSpeech={handleStopSpeech}
          onClose={() => setEditingNoteId(null)}
        />
      )}

      {/* Google Keep Takeout & Markdown Selective Import Modal */}
      <KeepTakeoutImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importParsedNotes}
      />

      {/* Usage Guide & Markdown Syntax Modal */}
      <NotesGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Reusable Delete / Empty Trash Confirmation */}
      <ConfirmDialog {...confirmDialogProps} />

      {/* Hidden JSON Backup Restore File Input */}
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleBackupFileChange}
      />
    </div>
  );
}
