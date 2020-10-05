//import { Decimal, Table } from '@openware/components';
import { Table } from '@openware/components';
import classnames from 'classnames';
import * as React from 'react';
import {
    InjectedIntlProps,
    injectIntl,
    intlShape,
} from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { incrementalOrderBook } from '../../../api';
import { SortAsc, SortDefault, SortDesc } from '../../../assets/images/SortIcons';
import {
    Currency,
    depthFetch,
    Market,
    RootState,
    selectCurrencies,
    selectCurrentMarket,
    selectMarkets,
    selectMarketTickers,
    setCurrentMarket,
    setCurrentPrice,
    Ticker,
} from '../../../modules';

interface ReduxProps {
    currencies: Currency[];
    currentMarket: Market | undefined;
    markets: Market[];
    marketTickers: {
        [key: string]: Ticker,
    };
}

interface DispatchProps {
    setCurrentMarket: typeof setCurrentMarket;
    depthFetch: typeof depthFetch;
    setCurrentPrice: typeof setCurrentPrice;
}

interface OwnProps {
    search: string;
    // currencyQuote: string;
}

interface State {
    sortBy: string;
    reverseOrder: boolean;
    searchFieldValue: string;
}

const handleChangeSortIcon = (sortBy: string, id: string, reverseOrder: boolean) => {
    if (sortBy !== 'none' && id === sortBy && !reverseOrder) {
        return <SortDesc/>;
    }

    if (sortBy !== 'none' && id === sortBy && reverseOrder) {
        return <SortAsc/>;
    }

    return <SortDefault/>;
};

type Props = ReduxProps & OwnProps & DispatchProps & RouteComponentProps & InjectedIntlProps;

//tslint:disable jsx-no-lambda
class SimpleMarketsListComponent extends React.Component<Props, State> {
    //tslint:disable-next-line:no-any
    public static propTypes: React.ValidationMap<any> = {
        intl: intlShape.isRequired,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            sortBy: 'none',
            reverseOrder: false,
            searchFieldValue: '',
        };
    }

    public render() {
        const { markets } = this.props;
        const { searchFieldValue } = this.state;
        const data = this.mapMarkets();
        // tslint:disable
        const currentMarket = this.props.currentMarket || {};
        const selected = currentMarket ? markets.findIndex(el => el.id === currentMarket.id) : 0;
        return (
            <div className="pg-dropdown-markets-list-container" id="gunthy-market-selector">
                <div className={'pg-trading-header-selector-search-wrapper'}>
                    <div className="pg-trading-header-selector-search">
                        <div className="pg-trading-header-selector-search-icon">
                            <img src={require('../../../containers/ToolBar/icons/search.svg')} alt="search" />
                        </div>
                        <input
                            className="pg-trading-header-selector-search-field"
                            onChange={this.searchFieldChangeHandler}
                            value={searchFieldValue}
                        />
                    </div>
                </div>
                <Table
                    data={data.length > 0 ? data : [[]]}
                    header={this.getHeaders()}
                    onSelect={this.currencyPairSelectHandler}
                    selectedKey={selected.toString()}
                />
            </div>
        );
    }

    private currencyPairSelectHandler = (key: string) => {
        // tslint:disable-next-line
        const { markets } = this.props;
        const marketToSet = markets[key];
        this.props.setCurrentPrice();
        if (marketToSet) {
            this.props.setCurrentMarket(marketToSet);
            if (!incrementalOrderBook()) {
              this.props.depthFetch(marketToSet);
            }
        }
    };

    private getHeaders = () => [
        {id: 'id', translationKey: 'market'},
        {id: 'price_change_percent_num', translationKey: 'change'},
    ].map(obj => {
        const {sortBy, reverseOrder} = this.state;
        return (
            {
                ...obj,
                selected: sortBy === obj.id,
                reversed: sortBy === obj.id && reverseOrder,
            }
        );
    }).map(obj => {
        const {sortBy, reverseOrder} = this.state;
        const classname = classnames({
            'pg-dropdown-markets-list-container__header-selected': obj.selected,
        });
        // tslint:disable-next-line
        // console.log(obj);

        return (
            <span className={classname} key={obj.id} onClick={() => this.handleHeaderClick(obj.id)}>
            {this.props.intl.formatMessage({id: `page.body.trade.header.markets.content.${obj.translationKey}`})}
                <span className="sort-icon">
                    {handleChangeSortIcon(sortBy, obj.id, reverseOrder)}
                </span>
            </span>
        );
    });

    private mapMarkets() {
        const { markets, marketTickers /*, currencyQuote */ } = this.props;
        const { searchFieldValue } = this.state;
        const defaultTicker = {
            last: 0,
            vol: 0,
            price_change_percent: '+0.00%',
        };
        const regExp = new RegExp(searchFieldValue.toLowerCase());
        const arr: Market[] = [];

        const marketsMapped = markets.map((market: Market) => {
            return {
                ...market,
                name: (
                    <React.Fragment>
                        <div className="gunthy-currency" key={market.base_unit}> 
                            {market.name}
                        </div>
                    </React.Fragment>
                ),
                price_change_percent: (marketTickers[market.id] || defaultTicker).price_change_percent,
                price_change_percent_num: Number.parseFloat((marketTickers[market.id] || defaultTicker).price_change_percent),
                title: market.name,
            };
        });
        
        const {sortBy, reverseOrder} = this.state;

        if (sortBy !== 'none') {
            marketsMapped.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : b[sortBy] > a[sortBy] ? -1 : 0);
        }

        reverseOrder && marketsMapped.reverse();

        return marketsMapped.reduce((pV, cV) => {
            // const [,quote] = cV.name.toLowerCase().split('/');
            if (cV.title &&
                regExp.test(cV.title.toLowerCase())
                // && (
                //     currencyQuote === '' ||
                //     currencyQuote.toLowerCase() === quote ||
                //     currencyQuote.toLowerCase() === 'all'
                // )
            ) {
                pV.push(cV);
            }
            return pV;
        }, arr).map((market: Market & Ticker, index: number) => {
            const isPositive = /\+/.test((marketTickers[market.id] || defaultTicker).price_change_percent);
            const classname = classnames({
                'pg-dropdown-markets-list-container__positive': isPositive,
                'pg-dropdown-markets-list-container__negative': !isPositive,
            });
            return [
                market.name,
                (<span className={classname}>{market.price_change_percent}</span>),
            ];
        });
    }

    private handleHeaderClick = (key: string) => {
        const {sortBy, reverseOrder} = this.state;
        if (key !== sortBy) {
            this.setState({sortBy: key, reverseOrder: false});
        } else if (key === sortBy && !reverseOrder) {
            this.setState({reverseOrder: true});
        } else {
            this.setState({sortBy: 'none', reverseOrder: false});
        }
    }

    private searchFieldChangeHandler = e => {
        this.setState({
            searchFieldValue: e.target.value,
        });
    }
}

const mapStateToProps = (state: RootState): ReduxProps => ({
    currencies: selectCurrencies(state),
    currentMarket: selectCurrentMarket(state),
    markets: selectMarkets(state),
    marketTickers: selectMarketTickers(state),
});

const mapDispatchToProps = {
    setCurrentMarket,
    depthFetch,
    setCurrentPrice,
};

export const SimpleMarketsList = injectIntl(withRouter(connect(mapStateToProps, mapDispatchToProps)(SimpleMarketsListComponent) as any));
