export const USER_ROUTES = {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout'
};

export const PLAYER_ROUTES = {
    PLAYER_REGISTRATION: '/player-register',
    GET_ALL: '/get-all-players',
    GET_DETAILS: '/get-player-details/:playerId',
    UPDATE_DETAILS: '/update-player-details',
    DELETE: '/delete-player',
    UPLOAD_PROFILE:'/upload-profile/:id'
};
export const OWNER_ROUTES = {
  OWNER_REGISTRATION: '/owner-register',
  GET_ALL: '/get-all-owners',
  GET_DETAILS: '/get-owner-details/:ownerId',
  UPDATE_DETAILS: '/update-owner-details',
  DELETE: '/delete-owner/:ownerId',
  ASSIGN: '/assign-to-owner/:ownerId',
  UPDATE_POINTS: '/update-points',

};
export const TOURNAMENT_ROUTES = {
    TOURNAMENT_REGISTRATION: '/tournament-register',
    GET_ALL: '/get-all-tournaments',
    GET_DETAILS: '/get-tournament-details/:tournamentId',
    UPDATE_DETAILS: '/update-tournament-details',
    DELETE: '/delete-tournament/:tournamentId',
    ADD_TEAM: '/add-team/:tournamentId',
    GET_TEAMS: '/get-teams/:tournamentId',
    GET_TOURNAMENTS: '/get-tournaments/:teamId',
    UPDATE_TEAM_TOURNAMENTS: '/update-team-tournaments/:id'
};

export const AUCTION_ROUTES = {
  START: '/auction-start',
  LIVE_AUCTION:  '/live-auction',
  END_AUCTION: '/end-auction',
  AUCTION_DETAILS: '/auction-details/:auctionId',
  TOP_BIDDERS: '/top-bidder',
  EXPORT: '/export-data',
  DOWNLOAD: '/download-csv'
};

export const TEAM_ROUTES = {
CREATE: '/create-team',
GET_ALL: '/get-all-teams',
GET_DETAILS: '/get-team-details/:teamId',
UPDATE_DETAILS: '/update-team-details/:teamId',
DELETE: '/delete-team/:teamId',
ADD_PLAYER: '/add-player/:teamId'
};

export const BID_ROUTES = {
  BID: '/bid-player',
  BID_STATUS: '/bid-status',
  GET_ALL: '/get-all-bids/:auctionId',
  GET: '/get-bid-details/:bidId'
};
export const ADMIN_ROUTES = {
  ADMIN_STATISTICS: '/admin-statistics'
};

export const BID_HISTORY_ROUTES = {
CREATE_BID_HISTORY: '/create-bid-history',
GET_BID_BY_TEAMS: '/get-bid-by-teams/:teamId',
GET_BID_BY_AUCTION: '/get-bid-by-auction/:auctionId',
GET_BID_BY_PLAYER: '/get-bid-by-player/:playerId'
};

export const BASE_API_ROUTES = {
    USERS: '/users',
    PLAYERS: '/players',
    OWNERS: '/owners',
    TOURNAMENTS:'/tournaments',
    AUCTIONS: '/auctions',
    BID: '/bids',
    TEAMS: '/teams',
    ADMIN: '/admin',
    BID_HISTORY: '/bid-history'
};

export const REST_API_PREFIX = {
 API_V1: '/api/v1'
};

