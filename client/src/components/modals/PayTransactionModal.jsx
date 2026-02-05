import { useEffect, useMemo, useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { useCategoriesStore } from '../../stores/categories.store';
import { useAuctionsStore } from '../../stores/auctions.store';
import { toLocalDatetimeValue } from '../../utils/formaters';

export default function CreateAuctionModal({ open, onClose, onCreated }) {
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const cLoading = useCategoriesStore((s) => s.loading);
  const cError = useCategoriesStore((s) => s.error);
  const clearCategoriesError = useCategoriesStore((s) => s.clearError);

  const createAuction = useAuctionsStore((s) => s.createAuction);
  const aLoading = useAuctionsStore((s) => s.loading);
  const aError = useAuctionsStore((s) => s.error);
  const clearAuctionsError = useAuctionsStore((s) => s.clearError);

  const loading = cLoading || aLoading;

  const defaults = useMemo(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return {
      startLocal: toLocalDatetimeValue(start),
      endLocal: toLocalDatetimeValue(end),
    };
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState(defaults.startLocal);
  const [endTime, setEndTime] = useState(defaults.endLocal);

  const [localError, setLocalError] = useState(null);

  const errorText =
    localError ||
    aError?.data?.error ||
    aError?.data?.message ||
    aError?.message ||
    cError?.data?.message ||
    cError?.message ||
    null;

  useEffect(() => {
    if (!open) return;

    setLocalError(null);
    clearAuctionsError();
    clearCategoriesError();

    setTitle('');
    setDescription('');
    setStartPrice('');
    setCategoryId('');
    setStartTime(defaults.startLocal);
    setEndTime(defaults.endLocal);

    (async () => {
      try {
        if (!categories?.length) await fetchCategories();
      } catch {}
    })();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (!startPrice || Number(startPrice) < 0)
      return 'Start price must be 0 or more.';
    if (!categoryId) return 'Category is required.';
    if (!startTime) return 'Start time is required.';
    if (!endTime) return 'End time is required.';

    const s = new Date(startTime);
    const e = new Date(endTime);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()))
      return 'Invalid date/time.';

    if (e <= s) return 'End time must be after start time.';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearAuctionsError();

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    try {
      const toLaravel = (dtLocal) => dtLocal.replace('T', ' ') + ':00';

      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        start_price: Number(startPrice),
        start_time: toLaravel(startTime),
        end_time: toLaravel(endTime),
        category_id: Number(categoryId),
      };

      const res = await createAuction(payload);
      onCreated?.(res?.auction ?? null);
      onClose?.();
    } catch {}
  };

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4 py-8'
      aria-modal='true'
      role='dialog'
    >
      {/* overlay */}
      <button
        type='button'
        onClick={onClose}
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        aria-label='Close'
      />

      {/* modal */}
      <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6 text-white'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 className='text-xl font-semibold'>Create Auction</h2>
            <p className='mt-1 text-sm text-white/70'>
              Fill details and publish your auction.
            </p>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 p-2 transition'
            aria-label='Close modal'
          >
            <FiX />
          </button>
        </div>

        {errorText && (
          <div className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
            <FiAlertTriangle className='mt-0.5 shrink-0' />
            <div className='text-sm'>{errorText}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className='mt-5 space-y-4'>
          {/* Title */}
          <label className='block'>
            <span className='text-sm text-white/80'>Title *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type='text'
              required
              className='mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
              placeholder='e.g. iPhone 16 Pro Max'
            />
          </label>

          {/* Description */}
          <label className='block'>
            <span className='text-sm text-white/80'>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className='mt-1 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
              placeholder='Short description...'
            />
          </label>

          <div className='grid sm:grid-cols-2 gap-4'>
            {/* Start price */}
            <label className='block'>
              <span className='text-sm text-white/80'>Start price *</span>
              <input
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                type='number'
                min='0'
                step='0.01'
                required
                className='mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
                placeholder='0.00'
              />
            </label>

            {/* Category */}
            <label className='block'>
              <span className='text-sm text-white/80'>Category *</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className='mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
              >
                <option value='' disabled>
                  {categories?.length ? 'Select category' : 'Loading...'}
                </option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            {/* Start time */}
            <label className='block'>
              <span className='text-sm text-white/80'>Start time *</span>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                type='datetime-local'
                required
                className='mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
              />
            </label>

            {/* End time */}
            <label className='block'>
              <span className='text-sm text-white/80'>End time *</span>
              <input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                type='datetime-local'
                required
                className='mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/30'
              />
            </label>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 sm:justify-end pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-white/90 shadow-md transition'
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className='rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium px-4 py-2.5 shadow-md transition disabled:opacity-60'
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
