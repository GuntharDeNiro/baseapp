/* tslint:disable */
import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import {
    Area,
    AreaChart,
    // CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    // TooltipPayload,
    XAxis,
    YAxis,
} from 'recharts';
import { Decimal } from '../../components/Decimal';
import {
    Currency,
    klineFetch,
    KlineState,
    Market,
    RootState,
    selectCurrentMarket,
    selectKline,
    selectMarketTickers,
    selectCurrencies,
    Ticker,
} from '../../../modules';
import { localeDate } from '../../../helpers';

interface ReduxProps {
    currentMarket: Market | undefined;
    kline: KlineState;
    currencies: Currency[];
    marketTickers: {
        [key: string]: Ticker,
    };
}

interface DispatchProps {
    fetchKline: typeof klineFetch;
}

type Props = ReduxProps & DispatchProps & InjectedIntlProps;

interface InfraState {
    resolution: number;
    from: number;
    to: number;
    mode: number;
}

const modeArray = [
    {id: '1H', label: 'custom.trading.simple.1h', value: 3600, resolution: 1},
    {id: '24H', label: 'custom.trading.simple.24h', value: 24*3600, resolution: 30},
    {id: '1W', label: 'custom.trading.simple.1w', value: 7*24*3600, resolution: 240},
    {id: '1M',label: 'custom.trading.simple.1m', value: 31*24*3600, resolution: 720},
    {id: '1Y',label: 'custom.trading.simple.1y', value: 366*24*3600, resolution: 10080},
    {id: 'MAX',label: 'custom.trading.simple.all', value: 0, valueFrom: 1578866400, resolution: 0},
];

export class SimpleTradingChartContainer extends React.Component<Props, InfraState> {
    constructor(props: Props) {
        super(props);
        const currTime = (new Date()).getTime() / 1000;
        this.state = {
            resolution: modeArray[0].resolution,
            mode: modeArray[0].value,
            from: Math.round(currTime - modeArray[0].value),
            to: Math.round(currTime),
        }
    }

    public componentDidMount() {
        const { currentMarket, fetchKline } = this.props;
        if (currentMarket) {
            const payload = {
                ...this.state,
                market: currentMarket.id,
            }
            fetchKline(payload);
        }
    }

    public componentWillReceiveProps(nextProps) {
        const { currentMarket, fetchKline } = this.props;
        if ((!currentMarket && nextProps.currentMarket) || (currentMarket !== nextProps.currentMarket)) {
            const payload = {
                ...this.state,
                market: nextProps.currentMarket.id,
            }
            fetchKline(payload);
        }
    }

    public render() {
        const { currentMarket } = this.props;
        return (
            <div className="pg-infrastructure">
                <div className="pg-infrastructure-header cr-table-header__content">
                    <div className="cr-title-component">
                        {currentMarket && currentMarket.name}
                    </div>
                </div>
                {this.renderContent()}
            </div>
        );
    }

    private CustomTooltip = props => {
        const { active, payload} = props;
        if (active) {
            const data = payload.length > 0 ? payload[0].payload : {open: 0, close: 0, high: 0, low: 0, volume: 0};
            return (
                <div className="gunthy-pnl-chart__tooltip">
                    <div className="gunthy-pnl-chart__tooltip-value">{data.close} <span className="gunthy-pnl-chart__tooltip-value-currency">USDc</span></div>
                    <div className="gunthy-pnl-chart__tooltip-time">{localeDate(data.date / 1000, 'shortDate')}</div>
                </div>
            );
        }
    
        return null;
    };

    private customTickFormatter = (timestamp) => {
        const { resolution } = this.state;
        let timeFormat = (resolution <= 30) ? 'meridiemTime' : 'onlyDate';
        return localeDate(timestamp / 1000, timeFormat);
    }

    private renderContent = () => {
        const { kline, currentMarket, marketTickers } = this.props;
        if (!currentMarket) {
            return '';
        }
        const defaultChart = {open: 0, high: 0, low: 0, close: 0, volume: 0};
        const { from, to } = this.state;
        const data = (kline && kline.data.length > 1) ? [...kline.data] : [{...defaultChart, date: from * 1000}, {...defaultChart, date: to * 1000}];
        const fixed = 2;
        const defaultTicker = {
            last: 0,
            price_change_percent: '+0.00%',
        };
        const priceChange = (marketTickers[currentMarket.id] || defaultTicker).price_change_percent;
        const indexPrice = parseFloat(Number((marketTickers[currentMarket.id] || defaultTicker).last).toFixed(2));
        const percent = priceChange.substr(1, priceChange.length-2);
        const change = (Number(indexPrice) * Number(percent) / 100).toFixed(2);
        const classChange = (priceChange.includes('+')) ? 'change-green' : 'change-red';
        const colorChart = (priceChange.includes('+')) ? 'var(--color-green)' : 'var(--color-red)';
        return (
            <React.Fragment>
                <div className="gunthy-simple__chart-add">
                    <div className="gunthy-simple__chart-add-price">
                        <Decimal fixed={fixed}>{indexPrice}</Decimal> <span className="currency">USDc</span>
                        <span className={classChange}>{priceChange.charAt(0)}{change} ({percent}%)</span>
                    </div>
                    <div className="gunthy-simple__chart-switch-mode">
                        {modeArray.map(this.renderMode)}
                    </div>
                </div>
                <div className="gunthy-simple__chart">
                    <ResponsiveContainer width="100%" height={this.getStaticHeight()}>
                        <AreaChart data={data}
                                margin={{top: 10, right: 20, left: 20, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorPNL" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colorChart} stopOpacity={0.7} />
                                    <stop offset="95%" stopColor={colorChart} stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tickCount={10} interval="preserveStartEnd" type="number" domain={[from * 1000, to * 1000]} tickFormatter={this.customTickFormatter} axisLine={false} tick={{fill: 'var(--bright)'}} />
                            <YAxis type="number" domain={[dataMin => (Number((dataMin * 0.975).toFixed(2))), dataMax => (Number((dataMax * 1.025).toFixed(2)))]} tick={{fill: 'var(--bright)'}} />
                            <Tooltip content={<this.CustomTooltip />}/>
                            <Area type='monotone' dataKey='close' stroke={colorChart} fill="url(#colorPNL)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </React.Fragment>
        );
    }

    private renderMode = (data) => {
        const { mode } = this.state;
        const cn = mode === data.value ? 'gunthy-simple__chart-mode-active' : 'gunthy-simple__chart-mode';
        return (
            <div key={data.id} className={cn} onClick={this.handleMode.bind(this, data)}>
                <FormattedMessage id={data.label} />
            </div>
        )
    }

    private handleMode = (data) => {
        const { mode } = this.state;
        const { currentMarket, fetchKline} = this.props;
        if (mode !== data.value) {
            const to = (new Date()).getTime() / 1000;
            const from = (data.value === 0) ? data.valueFrom : (to - data.value);
            let resolution = data.resolution;
            if (!resolution) {
                if (to - from >= 9*30*24*60*60) {
                    resolution = 10080;
                } else if (to - from >= 2*30*24*60*60) {
                    resolution = 4320;
                } else {
                    resolution = 1440;
                }
            }
            this.setState({
                mode: data.value,
                resolution,
                to: Math.round(to),
                from: Math.round(from),
            });
            fetchKline({
                resolution,
                to: Math.round(to),
                from: Math.round(from),
                market: currentMarket.id,
            });
        }
    }

    private getStaticHeight = () => {
        const header = document.getElementsByTagName('header')[0];
        const headerHeight = header ? header.clientHeight : 0;
        const headerContainer = document.getElementsByClassName('pg-infrastructure')[0];
        const headerContainerHeight = headerContainer ? headerContainer.clientHeight : 0;
        return headerContainerHeight - headerHeight * 2;
    };
    
}

const mapStateToProps = (state: RootState): ReduxProps => ({
    currentMarket: selectCurrentMarket(state),
    marketTickers: selectMarketTickers(state),
    kline: selectKline(state),
    currencies: selectCurrencies(state),
});

const mapDispatchToProps = dispatch => ({
    fetchKline: payload => dispatch(klineFetch(payload)),
});

export type InfrastructureSimpleProps = ReduxProps;

export const SimpleTradingChart = injectIntl(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(SimpleTradingChartContainer),
);
