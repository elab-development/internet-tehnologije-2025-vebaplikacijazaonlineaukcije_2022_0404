import { useEffect, useMemo, useState } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { formatMoney, formatDate } from '../../utils/formaters';
import { useTransactionsStore } from '../../stores/transactions.store';
import { useCurrencyStore } from '../../stores/currency.store';

export default function PayTransactionModal({
  open,
  onClose,
  row,
  existingTransaction,
  onPaid,
}) {
  const createTransaction = useTransactionsStore((s) => s.createTransaction);
  const tLoading = useTransactionsStore((s) => s.loading);
  const tError = useTransactionsStore((s) => s.error);
  const clearTError = useTransactionsStore((s) => s.clearError);
  useCurrencyStore((s) => s.currency);

  const [localError, setLocalError] = useState(null);

  const errorText =
    localError ||
    tError?.data?.error ||
    tError?.data?.message ||
    tError?.message ||
    null;

  const auction = row?.auction ?? null;
  const auctionId = row?.auctionId ?? auction?.id ?? null;

  const title =
    auction?.title ?? (auctionId ? `Auction #${auctionId}` : 'Auction');
  const sellerName = auction?.user?.name ?? '—';
  const categoryName = auction?.category?.name ?? '—';

  const finalPrice = useMemo(() => {
    const v =
      row?.currentHighest ??
      auction?.highest_bid ??
      auction?.start_price ??
      null;
    return v;
  }, [row, auction]);

  const alreadyPaid = !!existingTransaction;

  useEffect(() => {
    if (!open) return;

    setLocalError(null);
    clearTError();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, clearTError]);

  const onPay = async () => {
    setLocalError(null);
    clearTError();

    if (!auctionId) {
      setLocalError('Missing auction id.');
      return;
    }
    if (row?.status !== 'WON') {
      setLocalError('You can only pay for auctions you won.');
      return;
    }
    if (alreadyPaid) return;

    try {
      const res = await createTransaction({ auction_id: auctionId });
      onPaid?.(res?.transaction ?? null);
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
            <h2 className='text-xl font-semibold'>Pay for auction</h2>
            <p className='mt-1 text-sm text-white/70'>
              Confirm details and create a transaction.
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

        {alreadyPaid && (
          <div className='mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 text-emerald-100 px-4 py-3 flex gap-2'>
            <FiCheckCircle className='mt-0.5 shrink-0' />
            <div className='text-sm'>
              Already paid. Transaction #{existingTransaction?.id ?? '—'}.
            </div>
          </div>
        )}

        {errorText && !alreadyPaid && (
          <div className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
            <FiAlertTriangle className='mt-0.5 shrink-0' />
            <div className='text-sm'>{errorText}</div>
          </div>
        )}

        <div className='mt-5 space-y-3'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <div className='text-sm text-white/70'>Auction</div>
            <div className='mt-1 font-semibold'>{title}</div>
            <div className='mt-2 grid sm:grid-cols-2 gap-3 text-sm'>
              <div className='text-white/80'>
                <div className='text-xs text-white/60'>Category</div>
                <div className='mt-0.5'>{categoryName}</div>
              </div>
              <div className='text-white/80'>
                <div className='text-xs text-white/60'>Seller</div>
                <div className='mt-0.5'>{sellerName}</div>
              </div>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-3'>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-xs text-white/60'>Ended</div>
              <div className='mt-1 text-white/90'>
                {formatDate(auction?.end_time ?? auction?.endTime)}
              </div>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='text-xs text-white/60'>Final price</div>
              <div className='mt-1 text-lg font-semibold'>
                {formatMoney(finalPrice)}
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 sm:justify-end pt-6'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-white/90 shadow-md transition'
          >
            Close
          </button>

          <button
            type='button'
            disabled={tLoading || alreadyPaid}
            onClick={onPay}
            className='rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium px-4 py-2.5 shadow-md transition disabled:opacity-60'
          >
            {alreadyPaid ? 'Paid' : tLoading ? 'Processing...' : 'Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
