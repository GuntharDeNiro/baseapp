export const PG_TITLE_PREFIX = 'Gunthy';

export const pgRoutes = (isLoggedIn: boolean, isLight?: boolean): string[][] => {
    const routes = [
        ['page.header.navbar.trade', '/simpleTrading/', `trade${isLight ? 'Light' : ''}`],
        ['page.header.navbar.wallets', '/wallets', `wallets${isLight ? 'Light' : ''}`],
        ['page.header.navbar.openOrders', '/orders', `orders${isLight ? 'Light' : ''}`],
        ['page.header.navbar.history', '/history', `history${isLight ? 'Light' : ''}`],
    ];
    const routesUnloggedIn = [
        ['page.header.navbar.signIn', '/signin', `signin${isLight ? 'Light' : ''}`],
        ['page.header.signUp', '/signup', `signup${isLight ? 'Light' : ''}`],
        ['page.header.navbar.trade', '/simpleTrading/', `trade${isLight ? 'Light' : ''}`],
    ];
    return isLoggedIn ? routes : routesUnloggedIn;
};

export const DEFAULT_CCY_PRECISION = 4;
export const STORAGE_DEFAULT_LIMIT = 50;
export const VALUATION_PRIMARY_CURRENCY = 'USD';
export const VALUATION_SECONDARY_CURRENCY = 'ETH';

export const colors = {
    light: {
        chart: {
            primary: '#fff',
            up: '#54B489',
            down: '#E85E59',
        },
        navbar: {
            avatar: '#fea301',
            language: '#fea301',
            logout: '#fea301',
            sun: '#fff',
            moon: '#fea301',
        },
    },
    basic: {
        chart: {
            primary: '#353535',
            up: '#54B489',
            down: '#E85E59',
        },
        navbar: {
            avatar: '#353535',
            language: '#353535',
            logout: '#fff',
            sun: '#fff',
            moon: '#fea301',
        },
    },
};
