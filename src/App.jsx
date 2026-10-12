import { useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'bg-[#fff0b8]' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'bg-[#d8eee2]' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'bg-[#dce8f6]' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'bg-[#f7d6cf]' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'bg-[#e7ddf4]' },
]

const formatError = (error) => error?.message || '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [content, setContent] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDiaries() {
      try {
        setError('')
        setDiaries(await getDiaries())
      } catch (loadError) {
        setError(formatError(loadError))
      } finally {
        setIsLoading(false)
      }
    }

    loadDiaries()
  }, [])

  const filteredDiaries = useMemo(
    () => activeFilter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === activeFilter),
    [activeFilter, diaries],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!selectedEmotion || !trimmedContent || isSaving) return

    try {
      setError('')
      setIsSaving(true)
      const diary = await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setDiaries((currentDiaries) => [diary, ...currentDiaries])
      setContent('')
      setSelectedEmotion('')
    } catch (saveError) {
      setError(formatError(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (deletingId) return

    try {
      setError('')
      setDeletingId(id)
      await deleteDiary(id)
      setDiaries((currentDiaries) => currentDiaries.filter((diary) => diary.id !== id))
    } catch (deleteError) {
      setError(formatError(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  const emotionFor = (value) => emotions.find((emotion) => emotion.value === value)
  const formatDate = (date) => new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f4ed]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-10 flex items-end justify-between gap-4 border-b border-[#d8d2c6] pb-6 sm:mb-14">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a745b]">daily feelings</p>
            <h1 className="font-[Fraunces] text-4xl font-semibold tracking-tight text-[#2f302b] sm:text-6xl">오늘의 마음</h1>
          </div>
          <span className="hidden rounded-full bg-[#e4eadc] px-4 py-2 text-sm font-semibold text-[#55705c] sm:inline-block">나를 기록하는 시간</span>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
          <div>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-[#9a745b]">01 / CHECK IN</p>
              <h2 className="font-[Fraunces] text-3xl text-[#2f302b]">지금 어떤 기분인가요?</h2>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] bg-[#e7dfd1] p-5 shadow-[8px_8px_0_#d8c7b6] sm:p-7">
              <div className="grid grid-cols-5 gap-2 sm:gap-3" role="group" aria-label="감정 선택">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={selectedEmotion === emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-3 text-xs font-semibold text-[#4d4b43] transition hover:-translate-y-1 ${emotion.color} ${selectedEmotion === emotion.value ? 'ring-2 ring-[#2f302b] ring-offset-2 ring-offset-[#e7dfd1]' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">{emotion.emoji}</span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>

              <label className="mt-7 block">
                <span className="mb-2 block text-sm font-semibold text-[#5e5b52]">짧게 남겨보세요</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="오늘 마음에 남은 일을 적어보세요..."
                  rows="5"
                  className="w-full resize-none rounded-2xl border-0 bg-[#f9f7f1] p-4 text-base text-[#2f302b] outline-none ring-[#9a745b] placeholder:text-[#a9a397] focus:ring-2"
                />
              </label>

              <button
                type="submit"
                disabled={!selectedEmotion || !content.trim() || isSaving}
                className="mt-4 w-full rounded-full bg-[#2f302b] px-5 py-3.5 text-sm font-bold text-[#fffaf1] transition hover:bg-[#9a745b] disabled:cursor-not-allowed disabled:bg-[#b6b1a7]"
              >
                {isSaving ? '저장 중...' : '오늘의 마음 저장하기'}
              </button>
            </form>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#9a745b]">02 / REFLECT</p>
                <h2 className="font-[Fraunces] text-3xl text-[#2f302b]">마음의 기록</h2>
              </div>
              <span className="text-sm font-semibold text-[#9a745b]">{diaries.length} records</span>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="감정 필터">
              {[{ value: 'all', label: '전체' }, ...emotions].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${activeFilter === filter.value ? 'bg-[#2f302b] text-[#fffaf1]' : 'bg-[#ebe6dc] text-[#777267] hover:bg-[#ddd6c8]'}`}
                >
                  {filter.value === 'all' ? filter.label : `${filter.emoji} ${filter.label}`}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-2xl border border-[#d99a8e] bg-[#f9e3de] px-4 py-3 text-sm font-medium text-[#8e4238]">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-[#c9c1b3] px-6 py-16 text-center text-sm text-[#8d877b]">기록을 불러오는 중...</div>
            ) : filteredDiaries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#c9c1b3] px-6 py-16 text-center">
                <p className="mb-2 text-4xl" aria-hidden="true">✍️</p>
                <p className="font-semibold text-[#5e5b52]">아직 남겨진 마음이 없어요.</p>
                <p className="mt-1 text-sm text-[#9a9488]">오늘의 기분을 첫 기록으로 남겨보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiaries.map((diary) => {
                  const emotion = emotionFor(diary.emotion)
                  return (
                    <article key={diary.id} className="group rounded-3xl bg-[#fffaf1] p-5 shadow-[0_4px_20px_rgba(76,64,47,0.06)] sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ${emotion?.color || 'bg-[#ebe6dc]'}`} aria-label={emotion?.label}>{emotion?.emoji || '🙂'}</span>
                          <time dateTime={diary.created_at} className="text-xs font-medium text-[#9a9488]">{formatDate(diary.created_at)}</time>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(diary.id)}
                          disabled={deletingId === diary.id}
                          className="rounded-full px-2 py-1 text-xs font-semibold text-[#aaa398] opacity-100 transition hover:bg-[#f5e2dc] hover:text-[#9b5147] disabled:cursor-wait"
                        >
                          {deletingId === diary.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[#4d4b43]">{diary.content}</p>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
