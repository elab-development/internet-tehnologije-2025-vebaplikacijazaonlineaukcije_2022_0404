export const API = {
  // auth
  register: '/register',
  login: '/login',
  logout: '/logout',
  me: '/me',

  // categories
  categories: '/categories',
  category: (id) => `/categories/${id}`,

  // auctions
  auctions: '/auctions',
  auction: (id) => `/auctions/${id}`,

  // bids
  bids: '/bids',
  bid: (id) => `/bids/${id}`,
  auctionBids: (auctionId) => `/auctions/${auctionId}/bids`,
  userBids: (userId) => `/users/${userId}/bids`,
};
