import { useEffect } from 'react';
import { useAuctionsStore } from '../stores/auctions.store';
import AuctionCard from '../components/AuctionCard';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Home() {
  const auctions = useAuctionsStore((s) => s.auctions);
  const fetchAuctions = useAuctionsStore((s) => s.fetchAuctions);
  const loading = useAuctionsStore((s) => s.loading);
  const error = useAuctionsStore((s) => s.error);
  const clearError = useAuctionsStore((s) => s.clearError);

  const errorText =
    error?.data?.message ||
    (typeof error?.data === 'string' ? error.data : null) ||
    error?.message ||
    null;

  const load = async () => {
    clearError();
    try {
      await fetchAuctions({ per_page: 100 });
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className='min-h-[calc(100vh-96px)]'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-semibold text-white'>
              Auctions
            </h1>
            <p className='mt-1 text-sm text-white/70'>
              Browse available auctions and open details.
            </p>
          </div>

          <button
            onClick={load}
            className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white px-4 py-2 shadow-md transition'
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {errorText && (
          <div className='mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 px-4 py-3 flex gap-2'>
            <FiAlertTriangle className='mt-0.5 shrink-0' />
            <div className='text-sm'>{errorText}</div>
          </div>
        )}

        {loading ? (
          <div className='mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-44 rounded-2xl border border-white/10 bg-white/10 animate-pulse'
              />
            ))}
          </div>
        ) : auctions?.length ? (
          <div className='mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {auctions.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        ) : (
          <div className='mt-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
            <p className='text-white/80'>No auctions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
