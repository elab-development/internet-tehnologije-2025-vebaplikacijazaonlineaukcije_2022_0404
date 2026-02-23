export function getAuctionImageUrl(title = 'auction', w = 1200, h = 500) {
  const seed = encodeURIComponent(
    String(title).trim().toLowerCase() || 'auction',
  );
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
