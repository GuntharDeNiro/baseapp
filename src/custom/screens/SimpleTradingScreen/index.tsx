import { Decimal } from '@openware/components';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect, MapDispatchToPropsFunction, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { incrementalOrderBook } from '../../../api';
import { Grid } from '../../../components/Grid';
import {
    SimpleMarketsList,
} from '../../components';
import {
    SimpleMarketDetails,
    SimpleOrderComponent,
    SimpleTradingChart,
} from '../../containers';
import { ToolBar } from '../../../containers';
import { getUrlPart, setDocumentTitle } from '../../../helpers';
import {
    RootState,
    selectCurrentMarket,
    selectMarketTickers,
    selectUserInfo,
    selectUserLoggedIn,
    setCurrentMarket,
    setCurrentPrice,
    Ticker,
    User,
} from '../../../modules';
import { Market, marketsFetch, selectMarkets } from '../../../modules/public/markets';
import { depthFetch } from '../../../modules/public/orderBook';
import { rangerConnectFetch, RangerConnectFetch } from '../../../modules/public/ranger';
import { RangerState } from '../../../modules/public/ranger/reducer';
import { selectRanger } from '../../../modules/public/ranger/selectors';
import { selectWallets, Wallet, walletsFetch } from '../../../modules/user/wallets';

const breakpoints = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
};

const cols = {
    lg: 9,
    md: 9,
    sm: 12,
    xs: 12,
    xxs: 12,
};

interface ReduxProps {
    currentMarket: Market | undefined;
    markets: Market[];
    wallets: Wallet [];
    user: User;
    rangerState: RangerState;
    userLoggedIn: boolean;
    tickers: {
        [pair: string]: Ticker,
    };
}

interface DispatchProps {
    depthFetch: typeof depthFetch;
    marketsFetch: typeof marketsFetch;
    accountWallets: typeof walletsFetch;
    rangerConnect: typeof rangerConnectFetch;
    setCurrentPrice: typeof setCurrentPrice;
    setCurrentMarket: typeof setCurrentMarket;
}


type Props = DispatchProps & ReduxProps & RouteComponentProps & InjectedIntlProps;

class SimpleTrading extends React.Component<Props> {

    private gridItems = [
        {
            i: 1,
            render: () => <SimpleMarketDetails />,
        },
        {
            i: 2,
            render: () => <SimpleTradingChart />,
        },
        {
            i: 3,
            render: () => <SimpleOrderComponent />,
        },
    ];

    public componentDidMount() {
        setDocumentTitle('Trading');
        const { wallets, markets, currentMarket, userLoggedIn, rangerState: { connected, withAuth } } = this.props;

        if (markets.length < 1) {
            this.props.marketsFetch();
        }
        if (!wallets || wallets.length === 0) {
            this.props.accountWallets();
        }
        if (currentMarket && !incrementalOrderBook()) {
            this.props.depthFetch(currentMarket);
        }
        if (!connected) {
            this.props.rangerConnect({ withAuth: userLoggedIn });
        }

        if (userLoggedIn && !withAuth) {
            this.props.rangerConnect({ withAuth: userLoggedIn });
        }
    }

    public componentWillUnmount() {
        this.props.setCurrentPrice(undefined);
    }

    public componentWillReceiveProps(nextProps) {
        const {
            history,
            markets,
            userLoggedIn,
        } = this.props;

        if (userLoggedIn !== nextProps.userLoggedIn) {
            this.props.rangerConnect({ withAuth: nextProps.userLoggedIn });
        }

        if (markets.length !== nextProps.markets.length) {
            this.setMarketFromUrlIfExists(nextProps.markets);
        }

        if (nextProps.currentMarket) {
            const marketFromUrl = history.location.pathname.split('/');
            const marketNotMatched = nextProps.currentMarket.id !== marketFromUrl[marketFromUrl.length - 1];
            if (marketNotMatched) {
                history.replace(`/simpleTrading/${nextProps.currentMarket.id}`);
                if (!incrementalOrderBook()) {
                  this.props.depthFetch(nextProps.currentMarket);
                }
            }
        }

        if (nextProps.currentMarket && nextProps.tickers) {
            this.setTradingTitle(nextProps.currentMarket, nextProps.tickers);
        }
    }

    public render() {
        const rowHeight = 14;
        const allGridItems = [...this.gridItems];
        const rgl = {
            lg: [
                { x: 0, y: 0, w: 2, h: 38, i: '1', minH: 38, maxH: 48, minW: 2, isDraggable: true },
                { x: 2, y: 0, w: 5, h: 38, i: '2', minH: 38, minW: 5, isDraggable: true },
                { x: 7, y: 0, w: 2, h: 38, i: '3', minH: 38, minW: 2, isDraggable: true },
            ],
            md: [
                { x: 0, y: 0, w: 2, h: 38, i: '1', minH: 38, maxH: 48, minW: 2, isDraggable: true },
                { x: 2, y: 0, w: 5, h: 38, i: '2', minH: 38, minW: 5, isDraggable: true },
                { x: 7, y: 0, w: 2, h: 38, i: '3', minH: 38, minW: 2, isDraggable: true },
            ],
            sm: [
                { x: 0, y: 0, w: 12, h: 35, i: '1', minH: 22, maxH: 22, minW: 12, isDraggable: false },
                { x: 0, y: 35, w: 12, h: 30, i: '2', minH: 30, minW: 12, isDraggable: false },
                { x: 0, y: 65, w: 12, h: 40, i: '3', minH: 18, minW: 12, isDraggable: false },
            ],
        };

        return (
            <div className={'pg-trading-screen'}>
                <div className={'pg-trading-wrap'}>
                    <ToolBar/>
                    <div style={{display: 'flex'}}>
                        <div style={{flexBasis: '260px'}} className="gunthy-sidelist">
                            <SimpleMarketsList search="" currencyQuote="usdc"/>
                        </div>
                        <div style={{flexGrow: 6}}>
                            <Grid
                                breakpoints={breakpoints}
                                className="layout"
                                children={allGridItems}
                                cols={cols}
                                draggableHandle=".cr-table-header__content, .pg-trading-screen__tab-panel, .draggable-container"
                                layouts={rgl}
                                rowHeight={rowHeight}
                                onLayoutChange={() => {return;}}
                                handleResize={this.handleResize}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private setMarketFromUrlIfExists = (markets: Market[]): void => {
        const urlMarket: string = getUrlPart(2, window.location.pathname);
        const market: Market | undefined = markets.find(item => item.id === urlMarket);

        if (market) {
            this.props.setCurrentMarket(market);
        }
    };

    private setTradingTitle = (market: Market, tickers: ReduxProps['tickers']) => {
        const tickerPrice = tickers[market.id] ? tickers[market.id].last : '0.0';
        document.title = `${Decimal.format(tickerPrice, market.price_precision)} ${market.name}`;
    };

    private handleResize = (layout, oldItem, newItem) => {
        switch (oldItem.i) {
            case '1':
                this.setState({
                    orderComponentResized: newItem.w,
                });
                break;
            case '3':
                this.setState({
                    orderBookComponentResized: newItem.w,
                });
                break;
            default:
                break;
        }
    };
}

const mapStateToProps: MapStateToProps<ReduxProps, {}, RootState> = state => ({
    currentMarket: selectCurrentMarket(state),
    markets: selectMarkets(state),
    wallets: selectWallets(state),
    user: selectUserInfo(state),
    rangerState: selectRanger(state),
    userLoggedIn: selectUserLoggedIn(state),
    tickers: selectMarketTickers(state),
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, {}> = dispatch => ({
    marketsFetch: () => dispatch(marketsFetch()),
    depthFetch: payload => dispatch(depthFetch(payload)),
    accountWallets: () => dispatch(walletsFetch()),
    rangerConnect: (payload: RangerConnectFetch['payload']) => dispatch(rangerConnectFetch(payload)),
    setCurrentPrice: payload => dispatch(setCurrentPrice(payload)),
    setCurrentMarket: payload => dispatch(setCurrentMarket(payload)),
});

// tslint:disable-next-line no-any
const SimpleTradingScreen = injectIntl(withRouter(connect(mapStateToProps, mapDispatchToProps)(SimpleTrading) as any));

export {
    SimpleTradingScreen,
};
