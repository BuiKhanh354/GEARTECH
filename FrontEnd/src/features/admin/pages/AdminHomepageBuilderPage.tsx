import { ArrowClockwise } from '@phosphor-icons/react'
import HomepagePreviewModal from '../components/HomepagePreviewModal'
import HomepageLivePreview from '../components/HomepageLivePreview'
import { useHomepageBuilder } from '../components/homepage-builder/hooks/useHomepageBuilder'
import BuilderHeader from '../components/homepage-builder/layout/BuilderHeader'
import WorkspaceTabSwitcher from '../components/homepage-builder/layout/WorkspaceTabSwitcher'
import SectionListSidebar from '../components/homepage-builder/layout/SectionListSidebar'
import SectionEditorPanel from '../components/homepage-builder/layout/SectionEditorPanel'
import AddSectionModal from '../components/homepage-builder/modals/AddSectionModal'
import DeleteSectionModal from '../components/homepage-builder/modals/DeleteSectionModal'
import PublishSectionModal from '../components/homepage-builder/modals/PublishSectionModal'
import BuilderToast from '../components/homepage-builder/components/BuilderToast'

export default function AdminHomepageBuilderPage() {
  const {
    sections,
    categories,
    publishedVersion,
    publishedAt,
    selectedKey,
    setSelectedKey,
    selectedSection,
    activeWorkspaceTab,
    setActiveWorkspaceTab,
    loading,
    saving,
    publishing,
    hasUnsavedChanges,
    toast,
    showToast,
    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    previewSections,
    previewLoading,
    isPublishModalOpen,
    setIsPublishModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    sectionToDelete,
    setSectionToDelete,
    // Operations
    handleMoveUp,
    handleMoveDown,
    handleToggleStatus,
    updateSection,
    updateConfig,
    handleAddSection,
    handleDuplicateSection,
    confirmDeleteSection,
    handleSaveDraft,
    handlePublish,
    handleRestoreDefault,
    handleOpenPreview,
    handleUploadBannerImage,
    handleRefreshLivePreview
  } = useHomepageBuilder()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <ArrowClockwise size={32} className="animate-spin text-[#ff4655]" />
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          Đang nạp cấu hình Homepage Builder...
        </p>
      </div>
    )
  }

  const activeSectionsCount = sections.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header & Top Action Bar */}
      <BuilderHeader
        publishedVersion={publishedVersion}
        publishedAt={publishedAt}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        publishing={publishing}
        onRestoreDefault={handleRestoreDefault}
        onOpenPreview={handleOpenPreview}
        onSaveDraft={handleSaveDraft}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
      />

      {/* 2. Workspace View Mode Switcher */}
      <WorkspaceTabSwitcher
        activeTab={activeWorkspaceTab}
        onTabChange={setActiveWorkspaceTab}
        activeSectionsCount={activeSectionsCount}
      />

      {/* 3. Main Workspace Area */}
      {activeWorkspaceTab === 'builder' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Sections List & Reordering (5 cols) */}
          <SectionListSidebar
            className="lg:col-span-5"
            sections={sections}
            selectedKey={selectedSection?.sectionKey || selectedKey}
            onSelectKey={setSelectedKey}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleStatus={handleToggleStatus}
            onDuplicateSection={handleDuplicateSection}
            onRequestDeleteSection={sec => {
              setSectionToDelete(sec)
              setIsDeleteModalOpen(true)
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />

          {/* RIGHT: Section Editor Panel (7 cols) */}
          <SectionEditorPanel
            className="lg:col-span-7"
            selectedSection={selectedSection}
            categories={categories}
            onToggleStatus={handleToggleStatus}
            onUpdateSection={updateSection}
            onUpdateConfig={updateConfig}
            onUploadBannerImage={handleUploadBannerImage}
            onShowToast={showToast}
          />
        </div>
      ) : (
        <HomepageLivePreview
          loading={previewLoading}
          sections={previewSections}
          onRefresh={handleRefreshLivePreview}
          onPublish={() => setIsPublishModalOpen(true)}
        />
      )}

      {/* Modal 1: Add New Section */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
      />

      {/* Modal 2: Confirm Delete Section */}
      <DeleteSectionModal
        isOpen={isDeleteModalOpen}
        section={sectionToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSection}
      />

      {/* Modal 3: Confirm Publish */}
      <PublishSectionModal
        isOpen={isPublishModalOpen}
        publishing={publishing}
        publishedVersion={publishedVersion}
        activeCount={activeSectionsCount}
        totalCount={sections.length}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
      />

      {/* Modal 4: Fullscreen Preview With Real Data */}
      <HomepagePreviewModal
        isOpen={isPreviewOpen}
        loading={previewLoading}
        sections={previewSections}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={() => {
          setIsPreviewOpen(false)
          setIsPublishModalOpen(true)
        }}
      />

      {/* Floating Toast Notification */}
      <BuilderToast toast={toast} />
    </div>
  )
}
