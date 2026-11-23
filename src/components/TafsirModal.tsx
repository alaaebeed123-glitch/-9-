import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { AyahRosette } from './MushafLineRow';
import { toArabicDigits, type MushafDataset, type MushafSurahMeta } from '../utils/mushafData';
import {
  extractAyahTextFromDataset,
  fetchSurahTafsir,
  getCachedSurahTafsir,
  loadSavedTafsirEdition,
  loadSavedTafsirFontSize,
  prefetchSurahTafsir,
  saveTafsirEdition,
  saveTafsirFontSize,
  TAFSIR_EDITIONS,
  type TafsirEditionId,
} from '../utils/tafsirData';

export interface TafsirAyahTarget {
  surahId: number;
  ayahNum: number;
}

interface TafsirModalProps {
  target: TafsirAyahTarget | null;
  onClose: () => void;
  onChangeTarget: (next: TafsirAyahTarget) => void;
  mushafDataset: MushafDataset | null;
  surahMetaMap: Map<number, MushafSurahMeta>;
}

const SECTION_HEADER_LABELS = new Set([
  'تسمية السورة',
  'من مقاصد السورة',
  '[التفسير]',
  'التفسير',
]);

function splitTafsirParagraphs(text: string): string[] {
  if (!text) return [];
  const rawBlocks = text.split(/\n{2,}/);
  const result: string[] = [];

  for (const block of rawBlocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Preserve explicit bullet lines or standalone section headings, but unwrap mid-sentence hard wraps
    const lines = trimmedBlock.split('\n').map((l) => l.trim()).filter(Boolean);
    let buffer = '';
    for (const line of lines) {
      const startsNewItem =
        line.startsWith('•') ||
        line.startsWith('{') ||
        line.startsWith('﴿') ||
        SECTION_HEADER_LABELS.has(line);

      const hasUnclosedQuote =
        (buffer.match(/﴿/g)?.length ?? 0) > (buffer.match(/﴾/g)?.length ?? 0) ||
        (buffer.match(/\{/g)?.length ?? 0) > (buffer.match(/\}/g)?.length ?? 0);

      if (!buffer) {
        buffer = line;
      } else if (startsNewItem && !hasUnclosedQuote && buffer.length > 48) {
        result.push(buffer);
        buffer = line;
      } else {
        buffer = `${buffer} ${line}`;
      }
    }
    if (buffer) {
      result.push(buffer);
    }
  }

  return result;
}

function renderQuranPhrase(inner: string, key: React.Key): React.ReactNode {
  return (
    <span key={key} className="tafsir-inline-quran">
      <span className="tafsir-quran-bracket" aria-hidden="true">﴿</span>
      <span className="tafsir-quran-words">{inner}</span>
      <span className="tafsir-quran-bracket" aria-hidden="true">﴾</span>
    </span>
  );
}

function renderInlineQuranQuotes(text: string): React.ReactNode {
  const parts = text.split(/(﴿[^﴾]+﴾|\{[^}]+\})/g);
  if (parts.length === 1) return text;
  return parts.map((part, idx) => {
    if (part.startsWith('﴿') && part.endsWith('﴾')) {
      return renderQuranPhrase(part.slice(1, -1).trim(), idx);
    }
    if (part.startsWith('{') && part.endsWith('}')) {
      const inner = part.slice(1, -1).trim();
      if (/^[0-9٠-٩\sـ\-–,،]+$/.test(inner)) {
        return (
          <span key={idx} className="tafsir-inline-ayah-ref">
            ({inner})
          </span>
        );
      }
      return renderQuranPhrase(inner, idx);
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  target,
  onClose,
  onChangeTarget,
  mushafDataset,
  surahMetaMap,
}) => {
  const [editionId, setEditionId] = useState<TafsirEditionId>(() => loadSavedTafsirEdition());
  const [fontSize, setFontSize] = useState<number>(() => loadSavedTafsirFontSize());
  const [loadedData, setLoadedData] = useState<{
    key: string;
    map: Map<number, string>;
  } | null>(null);
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [copied, setCopied] = useState(false);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cardRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const moveRafRef = useRef(0);
  const pendingPtRef = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

  const handleCardPointerEnter = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    cardRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
  }, []);

  const handleCardPointerLeave = useCallback(() => {
    cardRectRef.current = null;
  }, []);

  const handleCardPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    pendingPtRef.current = { el, x: e.clientX, y: e.clientY };
    if (moveRafRef.current) return;
    moveRafRef.current = window.requestAnimationFrame(() => {
      moveRafRef.current = 0;
      const pt = pendingPtRef.current;
      if (!pt) return;
      const rect = cardRectRef.current ?? pt.el.getBoundingClientRect();
      if (!cardRectRef.current) {
        cardRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      }
      if (rect.width <= 0 || rect.height <= 0) return;
      const xPct = Math.max(0, Math.min(100, ((pt.x - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((pt.y - rect.top) / rect.height) * 100));
      pt.el.style.setProperty('--lg-x', `${xPct.toFixed(1)}%`);
      pt.el.style.setProperty('--lg-y', `${yPct.toFixed(1)}%`);
    });
  }, []);

  useEffect(() => {
    if (!target) {
      cardRectRef.current = null;
      if (moveRafRef.current) {
        window.cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = 0;
      }
    }
    return () => {
      if (moveRafRef.current) {
        window.cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = 0;
      }
    };
  }, [target]);

  const surahMeta = target ? surahMetaMap.get(target.surahId) : undefined;
  const totalAyat = surahMeta?.totalAyat ?? 1;
  const surahName = surahMeta?.name ?? '';
  const activeDataKey = target ? `${editionId}:${target.surahId}` : null;

  const activeEdition = useMemo(
    () => TAFSIR_EDITIONS.find((ed) => ed.id === editionId) ?? TAFSIR_EDITIONS[0],
    [editionId]
  );

  const extractedAyah = useMemo(() => {
    if (!target) return { text: '', pageNum: null };
    return extractAyahTextFromDataset(mushafDataset, target.surahId, target.ayahNum);
  }, [mushafDataset, target]);

  const cachedSyncMap = target ? getCachedSurahTafsir(editionId, target.surahId) : null;

  useEffect(() => {
    if (!target || !activeDataKey) return;
    if (getCachedSurahTafsir(editionId, target.surahId)) {
      setErrorState(null);
      return;
    }

    let cancelled = false;
    setErrorState((prev) => (prev?.key === activeDataKey ? null : prev));

    fetchSurahTafsir(editionId, target.surahId)
      .then((map) => {
        if (!cancelled) {
          setLoadedData({ key: activeDataKey, map });
          setErrorState(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorState({
            key: activeDataKey,
            message: 'تعذّر تحميل التفسير حالياً. تأكد من الاتصال بالإنترنت ثم حاول مرة أخرى.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editionId, target?.surahId, activeDataKey, retryToken]);

  useEffect(() => {
    if (target && bodyScrollRef.current) {
      bodyScrollRef.current.scrollTop = 0;
    }
    setCopied(false);
  }, [target?.surahId, target?.ayahNum, editionId]);

  const canStepPrev = Boolean(target && target.ayahNum > 1);
  const canStepNext = Boolean(target && target.ayahNum < totalAyat);

  const handleStepAyah = useCallback(
    (delta: -1 | 1) => {
      if (!target) return;
      const nextNum = target.ayahNum + delta;
      if (nextNum < 1 || nextNum > totalAyat) return;
      onChangeTarget({ surahId: target.surahId, ayahNum: nextNum });
    },
    [target, totalAyat, onChangeTarget]
  );

  const isModalOpen = Boolean(target);

  useEffect(() => {
    if (!isModalOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalCardRef.current?.focus({ preventScroll: true });

    return () => {
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && prev.isConnected) {
        prev.focus({ preventScroll: true });
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!target) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        handleStepAyah(-1);
      } else if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        handleStepAyah(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [target, onClose, handleStepAyah]);

  const handleSelectEdition = (nextId: TafsirEditionId) => {
    setEditionId(nextId);
    saveTafsirEdition(nextId);
  };

  const handleAdjustFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(14, Math.min(24, prev + delta));
      saveTafsirFontSize(next);
      return next;
    });
  };

  const activeMap = cachedSyncMap ?? (activeDataKey && loadedData?.key === activeDataKey ? loadedData.map : null);
  const hasCurrentData = activeMap !== null;
  const activeErrorMsg =
    !hasCurrentData && activeDataKey && errorState?.key === activeDataKey ? errorState.message : null;
  const showLoading = Boolean(activeDataKey && !hasCurrentData && !activeErrorMsg);
  const currentTafsirText = target && activeMap ? activeMap.get(target.ayahNum) ?? '' : '';
  const paragraphs = useMemo(() => splitTafsirParagraphs(currentTafsirText), [currentTafsirText]);

  const handleCopyTafsir = useCallback(() => {
    if (!target || (!extractedAyah.text && !currentTafsirText)) return;
    const lines: string[] = [];
    if (extractedAyah.text) {
      lines.push(`﴿${extractedAyah.text}﴾ [سورة ${surahName}: ${toArabicDigits(target.ayahNum)}]`);
    } else {
      lines.push(`[سورة ${surahName}: ${toArabicDigits(target.ayahNum)}]`);
    }
    if (currentTafsirText) {
      lines.push('');
      lines.push(`${activeEdition.title}:`);
      lines.push(currentTafsirText);
    }
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, [target, extractedAyah.text, currentTafsirText, surahName, activeEdition.title]);

  if (!target || !activeDataKey || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="tafsir-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`تفسير سورة ${surahName} الآية ${toArabicDigits(target.ayahNum)}`}
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalCardRef}
        tabIndex={-1}
        className="tafsir-modal-card"
        data-annotation-ui="true"
        onPointerEnter={handleCardPointerEnter}
        onPointerLeave={handleCardPointerLeave}
        onPointerMove={handleCardPointerMove}
      >
        <header className="tafsir-modal-header">
          <div className="tafsir-modal-title-group">
            <span className="tafsir-modal-icon" aria-hidden="true">
              <BookOpenText className="w-4 h-4" />
            </span>
            <div className="tafsir-modal-title-text">
              <h2 className="tafsir-modal-heading">
                سورة {surahName}
                <span className="tafsir-modal-dot" aria-hidden="true">·</span>
                <span>الآية {toArabicDigits(target.ayahNum)}</span>
              </h2>
              <p className="tafsir-modal-subheading">
                {[
                  surahMeta?.rev ?? '',
                  extractedAyah.pageNum ? `صفحة ${toArabicDigits(extractedAyah.pageNum)}` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>

          <div className="tafsir-modal-header-actions">
            <div className="tafsir-font-ctrl" role="group" aria-label="حجم خط التفسير">
              <button
                type="button"
                className="tafsir-icon-btn"
                onClick={() => handleAdjustFontSize(-1)}
                disabled={fontSize <= 14}
                title="تصغير خط التفسير"
                aria-label="تصغير خط التفسير"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="tafsir-font-label" aria-hidden="true">
                {toArabicDigits(fontSize)}
              </span>
              <button
                type="button"
                className="tafsir-icon-btn"
                onClick={() => handleAdjustFontSize(1)}
                disabled={fontSize >= 24}
                title="تكبير خط التفسير"
                aria-label="تكبير خط التفسير"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              className="tafsir-close-btn"
              onClick={onClose}
              title="إغلاق نافذة التفسير (Esc)"
              aria-label="إغلاق نافذة التفسير"
            >
              <X className="w-4 h-4" strokeWidth={2.4} />
            </button>
          </div>
        </header>

        <div className="tafsir-editions-bar" role="tablist" aria-label="اختيار كتاب التفسير">
          {TAFSIR_EDITIONS.map((ed) => {
            const isSelected = ed.id === editionId;
            return (
              <button
                key={ed.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`tafsir-edition-tab ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelectEdition(ed.id)}
                onPointerEnter={() => prefetchSurahTafsir(ed.id, target.surahId)}
                onFocus={() => prefetchSurahTafsir(ed.id, target.surahId)}
                title={ed.description}
              >
                <span className="tafsir-edition-tab-name">{ed.shortTitle}</span>
              </button>
            );
          })}
        </div>

        <div ref={bodyScrollRef} className="tafsir-modal-scroll">
          {extractedAyah.text && (
            <section className="tafsir-ayah-showcase" aria-label="نص الآية الكريمة">
              <p className="tafsir-ayah-uthmani">
                {extractedAyah.text}{' '}
                <AyahRosette
                  ayahNum={target.ayahNum}
                  toArabicDigits={toArabicDigits}
                  isFocused={true}
                />
              </p>
            </section>
          )}

          <div className="tafsir-book-meta">
            <div className="tafsir-book-meta-main">
              <strong className="tafsir-book-title">{activeEdition.title}</strong>
              <span className="tafsir-book-author">{activeEdition.author}</span>
            </div>
            {(extractedAyah.text || currentTafsirText) && (
              <button
                type="button"
                className={`tafsir-copy-btn ${copied ? 'is-copied' : ''}`}
                onClick={handleCopyTafsir}
                title="نسخ نص الآية والتفسير"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="tafsir-content-card" style={{ fontSize: `${fontSize}px` }}>
            {showLoading ? (
              <div className="tafsir-loading-state" aria-live="polite">
                <div className="tafsir-skeleton-line is-wide" />
                <div className="tafsir-skeleton-line" />
                <div className="tafsir-skeleton-line is-short" />
                <span className="tafsir-loading-caption">جارٍ تحميل {activeEdition.title}...</span>
              </div>
            ) : activeErrorMsg ? (
              <div className="tafsir-error-state" role="alert">
                <p>{activeErrorMsg}</p>
                <button
                  type="button"
                  className="tafsir-retry-btn"
                  onClick={() => {
                    setErrorState(null);
                    setRetryToken((t) => t + 1);
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : paragraphs.length > 0 ? (
              <div className="tafsir-paragraphs">
                {paragraphs.map((para, idx) => {
                  if (SECTION_HEADER_LABELS.has(para)) {
                    return (
                      <h3 key={idx} className="tafsir-section-heading">
                        {para.replace(/^\[|\]$/g, '')}
                      </h3>
                    );
                  }
                  return (
                    <p key={idx} className="tafsir-paragraph">
                      {renderInlineQuranQuotes(para)}
                    </p>
                  );
                })}
              </div>
            ) : editionId === 'al-muyassar-fi-al-gharib' ? (
              <div className="tafsir-empty-gharib">
                ألفاظ هذه الآية الكريمة واضحة وميسّرة، ولا توجد فيها مفردات غريبة في كتاب «الميسّر في غريب القرآن».
              </div>
            ) : (
              <div className="tafsir-empty-gharib">
                لا يتوفر نص تفسير لهذه الآية في الكتاب المختار حالياً.
              </div>
            )}
          </div>
        </div>

        <footer className="tafsir-modal-footer">
          <button
            type="button"
            className="tafsir-nav-btn"
            disabled={!canStepPrev}
            onClick={() => handleStepAyah(-1)}
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.4} />
            <span>الآية السابقة</span>
          </button>

          <span className="tafsir-footer-counter">
            الآية {toArabicDigits(target.ayahNum)} / {toArabicDigits(totalAyat)}
          </span>

          <button
            type="button"
            className="tafsir-nav-btn"
            disabled={!canStepNext}
            onClick={() => handleStepAyah(1)}
          >
            <span>الآية التالية</span>
            <ChevronLeft className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};
