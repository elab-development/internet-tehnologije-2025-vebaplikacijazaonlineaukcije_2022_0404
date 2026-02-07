import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useBidsStore } from '../stores/bids.store';
import { useAuctionsStore } from '../stores/auctions.store';
import { parseLaravelDate } from '../utils/formaters';
import { useTransactionsStore } from '../stores/transactions.store';
import PayTransactionModal from '../components/modals/PayTransactionModal';
import BuyerParticipationTable from '../components/profile/BuyerParticipationTable';
import SellerAuctionsTable from '../components/profile/SellerAuctionsTable';
import ProfileHeader from '../components/profile/ProfileHeader';
import CreateAuctionModal from '../components/modals/CreateAuctionModal';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.me);
  const authLoading = useAuthStore((s) => s.loading);
  const authError = useAuthStore((s) => s.error);

  const bids = useBidsStore((s) => s.bids);
  const fetchMyBids = useBidsStore((s) => s.fetchMyBids);
  const bidsLoading = useBidsStore((s) => s.loading);
  const bidsError = useBidsStore((s) => s.error);
  const clearBidsError = useBidsStore((s) => s.clearError);

  const auctions = useAuctionsStore((s) => s.auctions);
  const fetchAuctions = useAuctionsStore((s) => s.fetchAuctions);
  const fetchAuction = useAuctionsStore((s) => s.fetchAuction);
  const auctionsLoading = useAuctionsStore((s) => s.loading);
  const auctionsError = useAuctionsStore((s) => s.error);
  const clearAuctionsError = useAuctionsStore((s) => s.clearError);

  const transactions = useTransactionsStore((s) => s.transactions);
  const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);
  const createTransaction = useTransactionsStore((s) => s.createTransaction); // nije neophodno ovde
  const txLoading = useTransactionsStore((s) => s.loading);
  const txError = useTransactionsStore((s) => s.error);
  const clearTxError = useTransactionsStore((s) => s.clearError);

  const [fallbackAuctionsById, setFallbackAuctionsById] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState(null);

  const role = user?.role || null;
  const loading = authLoading || bidsLoading || auctionsLoading || txLoading;

  const errorText =
    authError?.message ||
    bidsError?.message ||
    auctionsError?.message ||
    txError?.message ||
    authError?.data?.message ||
    bidsError?.data?.message ||
    auctionsError?.data?.message ||
    txError?.data?.message ||
    null;

  const load = async () => {
    clearBidsError();
    clearAuctionsError();
    try {
      if (token && !user) await me();

      if (role === 'buyer') {
        await fetchTransactions();
        const data = await fetchMyBids();

        const list = data?.bids ?? [];
        const missingAuctionIds = Array.from(
          new Set(
            list
              .map((b) => b?.auction?.id ?? b?.auction_id ?? b?.auctionId)
              .filter(Boolean),
          ),
        ).filter((id) => {
          const b = list.find(
            (x) => (x?.auction?.id ?? x?.auction_id ?? x?.auctionId) === id,
          );
          return !(b && b.auction);
        });

        if (missingAuctionIds.length) {
          const map = { ...fallbackAuctionsById };
          for (const id of missingAuctionIds) {
            if (!map[id]) {
              const a = await fetchAuction(id);
              if (a) map[id] = a;
            }
          }
          setFallbackAuctionsById(map);
        }
      }

      if (role === 'seller') {
        await fetchAuctions({ user_id: user?.id, per_page: 100 });
      }
    } catch {}
  };

  useEffect(() => {
    load();
  }, [token, role, user?.id]);

  const buyerRows = useMemo(() => {
    if (role !== 'buyer') return [];

    const byAuction = new Map();

    (bids || []).forEach((bid) => {
      const auctionId = bid?.auction?.id ?? bid?.auction_id ?? bid?.auctionId;
      if (!auctionId) return;

      const auction = bid.auction || fallbackAuctionsById[auctionId] || null;

      const cur = byAuction.get(auctionId) || {
        auctionId,
        auction,
        myMaxBid: null,
        myBidsCount: 0,
        lastBidAt: null,
      };

      const amount = Number(bid.amount);
      if (!Number.isNaN(amount)) {
        cur.myMaxBid =
          cur.myMaxBid === null ? amount : Math.max(cur.myMaxBid, amount);
      }
      cur.myBidsCount += 1;

      const bidAt = parseLaravelDate(bid.created_at || bid.updated_at || null);
      if (bidAt) {
        cur.lastBidAt = cur.lastBidAt
          ? new Date(Math.max(cur.lastBidAt, bidAt))
          : bidAt;
      }

      if (!cur.auction && auction) cur.auction = auction;

      byAuction.set(auctionId, cur);
    });

    const rows = Array.from(byAuction.values()).map((r) => {
      const a = r.auction;
      const highest = a?.highest_bid ?? a?.highestBid ?? null;
      const startPrice = a?.start_price ?? a?.startPrice ?? null;
      const currentHighest = highest ?? startPrice ?? null;

      const end = parseLaravelDate(a?.end_time ?? a?.endTime ?? null);
      const ended = end ? new Date() > end : false;

      const myWinsNow =
        r.myMaxBid !== null &&
        currentHighest !== null &&
        Number(r.myMaxBid) >= Number(currentHighest);

      let status = 'UNKNOWN';
      if (currentHighest === null || r.myMaxBid === null) status = 'UNKNOWN';
      else if (!ended) status = myWinsNow ? 'WINNING' : 'OUTBID';
      else status = myWinsNow ? 'WON' : 'LOST';

      return {
        ...r,
        auction: a,
        currentHighest: currentHighest !== null ? Number(currentHighest) : null,
        ended,
        status,
      };
    });

    rows.sort((x, y) => {
      const ax =
        parseLaravelDate(x.auction?.end_time ?? null)?.getTime?.() ?? 0;
      const ay =
        parseLaravelDate(y.auction?.end_time ?? null)?.getTime?.() ?? 0;
      return ay - ax;
    });

    return rows;
  }, [bids, role, fallbackAuctionsById]);

  const sellerRows = useMemo(() => {
    if (role !== 'seller') return [];
    return (auctions || []).slice().sort((a, b) => {
      const ax = parseLaravelDate(a?.created_at ?? null)?.getTime?.() ?? 0;
      const ay = parseLaravelDate(b?.created_at ?? null)?.getTime?.() ?? 0;
      return ay - ax;
    });
  }, [auctions, role]);

  const paidByAuctionId = useMemo(() => {
    const map = {};
    (transactions || []).forEach((t) => {
      const aid = t?.auction?.id ?? t?.auction_id ?? null;
      if (aid) map[aid] = t;
    });
    return map;
  }, [transactions]);

  return (
    <div className='min-h-[calc(100vh-96px)]'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <div className='flex items-start justify-between gap-4'>
          <ProfileHeader user={user} />

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

        {/* MAIN */}
        <div className='mt-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-6'>
          {loading && !user ? (
            <div className='text-white/70'>Loading profile...</div>
          ) : !user ? (
            <div className='text-white/70'>You are not logged in.</div>
          ) : role === 'admin' ? (
            <div className='text-white'>
              <h2 className='text-xl font-semibold'>Admin</h2>
              <p className='mt-2 text-white/70'>Admin Dashboard upcoming.</p>
            </div>
          ) : role === 'buyer' ? (
            <div>
              <h2 className='text-xl font-semibold text-white'>My bids</h2>
              <p className='mt-1 text-sm text-white/70'>
                Auctions you participated in and whether you are winning.
              </p>

              <div className='mt-5'>
                <BuyerParticipationTable
                  rows={buyerRows}
                  paidByAuctionId={paidByAuctionId}
                  onPay={(row) => {
                    setPayRow(row);
                    setPayOpen(true);
                  }}
                />
              </div>
            </div>
          ) : role === 'seller' ? (
            <div>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <h2 className='text-xl font-semibold text-white'>
                    My auctions
                  </h2>
                  <p className='mt-1 text-sm text-white/70'>
                    Auctions you created
                  </p>
                </div>

                <button
                  type='button'
                  className='inline-flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white font-medium px-4 py-2.5 shadow-md transition'
                  onClick={() => setCreateOpen(true)}
                >
                  Create Auction
                </button>
              </div>

              <div className='mt-5'>
                <SellerAuctionsTable rows={sellerRows} />
              </div>
            </div>
          ) : (
            <div className='text-white/70'>Unknown role.</div>
          )}
        </div>
      </div>

      <CreateAuctionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          load();
        }}
      />

      <PayTransactionModal
        open={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPayRow(null);
        }}
        row={payRow}
        existingTransaction={
          payRow ? paidByAuctionId?.[payRow.auctionId] : null
        }
        onPaid={() => {
          fetchTransactions().catch(() => {});
        }}
      />
    </div>
  );
}
