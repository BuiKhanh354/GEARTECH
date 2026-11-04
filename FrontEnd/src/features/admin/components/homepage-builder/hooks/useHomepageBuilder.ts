import { useState, useEffect, useCallback } from 'react'
import {
  homepageService,
  type HomepageSection,
  type SectionType,
  type PopulatedSection
} from '../../../../../services/homepageService'
import {
  createHomepageSection,
  SECTION_TYPE_INFO,
  type HomepageCategoryOption
} from '../../../config/homepageSections'

export function useHomepageBuilder() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [categories, setCategories] = useState<HomepageCategoryOption[]>([])
  const [publishedVersion, setPublishedVersion] = useState<number>(1)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Workspace Tab: Builder (Split view) vs Live Fullpage Preview
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'builder' | 'live_preview'>('builder')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Feedback toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewSections, setPreviewSections] = useState<PopulatedSection[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<HomepageSection | null>(null)

  // Load Initial Config
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)
      const res = await homepageService.getAdminConfig()
      if (res.success) {
        const rawSections = res.draft?.sections || []
        const sorted = [...rawSections].sort((a, b) => a.order - b.order)
        setSections(sorted)
        setCategories(res.categories || [])
        if (sorted.length > 0) {
          setSelectedKey(sorted[0].sectionKey)
        }
        if (res.published) {
          setPublishedVersion(res.published.version)
          setPublishedAt(res.published.publishedAt)
        }
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi tải cấu hình trang chủ.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const selectedSection = sections.find(s => s.sectionKey === selectedKey) || sections[0]

  // When switching to live preview tab, auto-save if needed and load preview
  useEffect(() => {
    if (activeWorkspaceTab === 'live_preview') {
      const loadLive = async () => {
        try {
          setPreviewLoading(true)
          if (hasUnsavedChanges) {
            await homepageService.saveDraft(sections)
            setHasUnsavedChanges(false)
          }
          const res = await homepageService.getPreview()
          if (res.success) {
            setPreviewSections(res.sections || [])
          }
        } catch {
          // ignore
        } finally {
          setPreviewLoading(false)
        }
      }
      loadLive()
    }
  }, [activeWorkspaceTab, hasUnsavedChanges, sections])

  // Reorder Handlers
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return
    setSections(prev => {
      const updated = [...prev]
      const temp = updated[index - 1]
      updated[index - 1] = updated[index]
      updated[index] = temp
      updated.forEach((s, idx) => { s.order = idx })
      return updated
    })
    setHasUnsavedChanges(true)
  }, [])

  const handleMoveDown = useCallback((index: number) => {
    setSections(prev => {
      if (index >= prev.length - 1) return prev
      const updated = [...prev]
      const temp = updated[index + 1]
      updated[index + 1] = updated[index]
      updated[index] = temp
      updated.forEach((s, idx) => { s.order = idx })
      return updated
    })
    setHasUnsavedChanges(true)
  }, [])

  // Toggle active/inactive
  const handleToggleStatus = useCallback((key: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }, [])

  // Update Section Field
  const updateSection = useCallback((key: string, updates: Partial<HomepageSection>) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, ...updates }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }, [])

  // Update Section Config Field
  const updateConfig = useCallback((key: string, configUpdates: any) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, config: { ...s.config, ...configUpdates } }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }, [])

  // Add New Section
  const handleAddSection = useCallback((type: SectionType) => {
    const typeInfo = SECTION_TYPE_INFO[type]
    const newSection = createHomepageSection(type, categories, sections.length)
    const newKey = newSection.sectionKey
    setSections(prev => [...prev, newSection])
    setSelectedKey(newKey)
    setIsAddModalOpen(false)
    setHasUnsavedChanges(true)
    showToast('success', `Đã thêm khu vực "${typeInfo.label}" vào bố cục!`)
  }, [categories, sections.length, showToast])

  // Duplicate Section
  const handleDuplicateSection = useCallback((sec: HomepageSection) => {
    const newKey = `${sec.sectionKey}_copy_${Date.now().toString(36)}`
    const duplicated: HomepageSection = {
      ...JSON.parse(JSON.stringify(sec)),
      sectionKey: newKey,
      title: `${sec.title} (Bản sao)`,
      order: sections.length
    }
    setSections(prev => [...prev, duplicated])
    setSelectedKey(newKey)
    setHasUnsavedChanges(true)
    showToast('success', `Đã nhân bản khu vực "${sec.title}"!`)
  }, [sections.length, showToast])

  // Delete Section
  const confirmDeleteSection = useCallback(() => {
    if (!sectionToDelete) return
    setSections(prev => {
      const updated = prev
        .filter(s => s.sectionKey !== sectionToDelete.sectionKey)
        .map((s, idx) => ({ ...s, order: idx }))
      if (selectedKey === sectionToDelete.sectionKey && updated.length > 0) {
        setSelectedKey(updated[0].sectionKey)
      }
      return updated
    })
    setSectionToDelete(null)
    setIsDeleteModalOpen(false)
    setHasUnsavedChanges(true)
    showToast('success', `Đã xóa khu vực "${sectionToDelete.title}". Dữ liệu sản phẩm và shop gốc vẫn an toàn.`)
  }, [sectionToDelete, selectedKey, showToast])

  // Save Draft
  const handleSaveDraft = useCallback(async () => {
    try {
      setSaving(true)
      const res = await homepageService.saveDraft(sections)
      if (res.success) {
        setHasUnsavedChanges(false)
        showToast('success', 'Đã lưu bản nháp bố cục trang chủ thành công!')
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi lưu bản nháp.')
    } finally {
      setSaving(false)
    }
  }, [sections, showToast])

  // Publish
  const handlePublish = useCallback(async () => {
    try {
      setPublishing(true)
      // Save draft first before publishing
      await homepageService.saveDraft(sections)
      const res = await homepageService.publish()
      if (res.success) {
        setHasUnsavedChanges(false)
        setIsPublishModalOpen(false)
        setPublishedVersion(res.published.version)
        setPublishedAt(res.published.publishedAt)
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi xuất bản trang chủ.')
    } finally {
      setPublishing(false)
    }
  }, [sections, showToast])

  // Restore Default
  const handleRestoreDefault = useCallback(async () => {
    if (!window.confirm('Bạn có chắc muốn khôi phục bản nháp về bố cục chuẩn mặc định của GearTech?')) return
    try {
      setLoading(true)
      const res = await homepageService.restoreDefault()
      if (res.success) {
        const sorted = (res.draft.sections || []).sort((a: HomepageSection, b: HomepageSection) => a.order - b.order)
        setSections(sorted)
        if (sorted.length > 0) {
          setSelectedKey(sorted[0].sectionKey)
        }
        setHasUnsavedChanges(false)
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi khôi phục mặc định.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Open Preview Modal
  const handleOpenPreview = useCallback(async () => {
    try {
      setPreviewLoading(true)
      setIsPreviewOpen(true)
      if (hasUnsavedChanges) {
        await homepageService.saveDraft(sections)
        setHasUnsavedChanges(false)
      }
      const res = await homepageService.getPreview()
      if (res.success) {
        setPreviewSections(res.sections || [])
      }
    } catch {
      showToast('error', 'Lỗi tải giao diện xem trước.')
    } finally {
      setPreviewLoading(false)
    }
  }, [hasUnsavedChanges, sections, showToast])

  // Upload Banner Image
  const handleUploadBannerImage = useCallback(async (bannerIdx: number, file: File) => {
    try {
      showToast('success', 'Đang tải ảnh banner lên...')
      const url = await homepageService.uploadBanner(file)
      if (selectedSection && selectedSection.config.banners) {
        const updatedBanners = [...selectedSection.config.banners]
        updatedBanners[bannerIdx] = { ...updatedBanners[bannerIdx], imageUrl: url }
        updateConfig(selectedSection.sectionKey, { banners: updatedBanners })
        showToast('success', 'Tải ảnh banner thành công!')
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi tải ảnh banner.')
    }
  }, [selectedSection, showToast, updateConfig])

  // Refresh live preview
  const handleRefreshLivePreview = useCallback(async () => {
    try {
      setPreviewLoading(true)
      const res = await homepageService.getPreview()
      if (res.success) {
        setPreviewSections(res.sections || [])
      }
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  return {
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
  }
}
