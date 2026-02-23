import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

import { useAuctionsStore } from '../stores/auctions.store';
import { useBidsStore } from '../stores/bids.store';
import { useAuthStore } from '../stores/auth.store';
import { getAuctionImageUrl } from '../api/images.api';

import AuctionSummary from '../components/auction/AuctionSummary';
import WinnerCard from '../components/auction/WinnerCard';
import BidForm from '../components/auction/BidForm';

export default function AuctionDetails() {
  const { id } = useParams();

  const auction = useAuctionsStore((s) => s.currentAuction);
  const fetchAuction = useAuctionsStore((s) => s.fetchAuction);
  const aLoading = useAuctionsStore((s) => s.loading);
  const aError = useAuctionsStore((s) => s.error);
  const clearAuctionError = useAuctionsStore((s) => s.clearError);

  const createBid = useBidsStore((s) => s.createBid);
  const bLoading = useBidsStore((s) => s.loading);
  const bError = useBidsStore((s) => s.error);
  const clearBidsError = useBidsStore((s) => s.clearError);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isBuyer = useMemo(() => user?.role === 'buyer', [user]);

  const loading = aLoading || bLoading;

  const errorText =
    aError?.data?.message ||
    bError?.data?.message ||
    aError?.message ||
    bError?.message ||
    null;

  const load = async () => {
    clearAuctionError();
    clearBidsError();
    try {
      await fetchAuction(id);
    } catch {}
  };

  useEffect(() => {
    load();
  }, [id]);

  const onSubmitBid = async (amount) => {
    clearBidsError();
    try {
      await createBid({ auction_id: Number(id), amount });
      await fetchAuction(id);
    } catch {}
  };

  const leadingBid = null;

  return (
    <div className='min-h-[calc(100vh-96px)]'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 text-white px-4 py-2 shadow-md transition'
          >
            <FiArrowLeft />
            Back
          </Link>

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

        {aLoading && !auction ? (
          <div className='mt-6 space-y-4'>
            <div className='h-44 rounded-2xl border border-white/10 bg-white/10 animate-pulse' />
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='h-40 rounded-2xl border border-white/10 bg-white/10 animate-pulse' />
              <div className='h-40 rounded-2xl border border-white/10 bg-white/10 animate-pulse' />
            </div>
          </div>
        ) : auction ? (
          <div className='mt-6 space-y-4'>
            <div className='rounded-2xl border border-white/10 bg-white/10 overflow-hidden shadow-lg'>
              <img
                src={getAuctionImageUrl(auction?.title)}
                alt={auction?.title || 'Auction image'}
                className='w-full h-56 object-cover'
                loading='lazy'
              />
            </div>

            <AuctionSummary auction={auction} />

            <div className='grid lg:grid-cols-2 gap-4'>
              <WinnerCard auction={auction} leadingBid={leadingBid} />

              <BidForm
                auction={auction}
                isBuyer={isBuyer}
                isAuthed={!!token}
                loading={loading}
                onSubmitBid={onSubmitBid}
                errorText={bError?.data?.message || bError?.message || null}
              />
            </div>
          </div>
        ) : (
          <div className='mt-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6 text-white'>
            <p className='text-white/80'>Auction not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
