/* tslint:disable */
import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Decimal } from '../../components';
import {
    Market,
    RootState,
    selectCurrentMarket,
    selectMarketTickers,
    Ticker,
} from '../../../modules';

interface ReduxProps {
    currentMarket: Market | undefined;
    marketTickers: {
        [key: string]: Ticker,
    };
}

type Props = ReduxProps & InjectedIntlProps;

export class SimpleMarketDetailsContainer extends React.Component<Props> {

    public render() {
        return (
            <div className="pg-index-details">
                <div className="cr-table-header__content">
                    <div className="cr-title-component">
                        <FormattedMessage id="custom.body.trade.header.marketDetails" />
                    </div>
                </div>
                {this.renderContent()}
            </div>
        );
    }

    private renderContent = () => {
        const { currentMarket, marketTickers } = this.props;
        const fixed = (currentMarket && currentMarket.price_precision) || 2;
        const defaultTicker = {
            last: 0,
            high: 0,
            low: 0,
            price_change_percent: '+0.00%',
        };
        const last = ((currentMarket && marketTickers[currentMarket.id]) || defaultTicker).last;
        const low = ((currentMarket && marketTickers[currentMarket.id]) || defaultTicker).low;
        const high = ((currentMarket && marketTickers[currentMarket.id]) || defaultTicker).high;
        const priceChange = ((currentMarket && marketTickers[currentMarket.id]) || defaultTicker).price_change_percent;
        const colorClass = priceChange.includes('+') ? 'value-green' : 'value-red';
        // const price = parseFloat(Number(((currentMarket && marketTickers[currentMarket.id]) || defaultTicker).last).toFixed(2));
        return (
            <div className="gunthy-simple__index">
                <div className="gunthy-simple__index-point">
                    <div>
                        <div className="label">
                            <FormattedMessage id="custom.body.trade.marketDetails.last" />
                        </div>
                        <div className="value">
                            <Decimal fixed={fixed} thousSep=",">{last}</Decimal> {currentMarket ? currentMarket.quote_unit.toUpperCase() : ''}
                        </div>
                    </div>
                </div>
                <div className="gunthy-simple__index-point">
                    <div>
                        <div className="label">
                            <FormattedMessage id="custom.body.trade.marketDetails.high" />
                        </div>
                        <div className="value">
                            <Decimal fixed={fixed} thousSep=",">{high}</Decimal> {currentMarket ? currentMarket.quote_unit.toUpperCase() : ''}
                        </div>
                    </div>
                </div>
                <div className="gunthy-simple__index-point">
                    <div>
                        <div className="label">
                            <FormattedMessage id="custom.body.trade.marketDetails.since24H" />
                        </div>
                        <div className={`value ${colorClass}`}>
                            {priceChange}
                        </div>
                    </div>
                </div>
                <div className="gunthy-simple__index-point">
                    <div>
                        <div className="label">
                            <FormattedMessage id="custom.body.trade.marketDetails.low" />
                        </div>
                        <div className="value">
                            <Decimal fixed={fixed} thousSep=",">{low}</Decimal> {currentMarket ? currentMarket.quote_unit.toUpperCase() : ''}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): ReduxProps => ({
    currentMarket: selectCurrentMarket(state),
    marketTickers: selectMarketTickers(state),
});

export type SimpleMarketDetailsProps = ReduxProps;

export const SimpleMarketDetails = injectIntl(
    connect(mapStateToProps)(SimpleMarketDetailsContainer),
);
