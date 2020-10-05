import * as React from 'react';
import { injectIntl } from 'react-intl';
import { connect, MapDispatchToPropsFunction } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
    Market,
    RootState,
    selectCurrentColorTheme,
    selectCurrentMarket,
    selectMarketSelectorState,
    selectMobileWalletUi,
    selectSidebarState,
    setMobileWalletUi,
    toggleMarketSelector,
    toggleSidebar,
} from '../../modules';
import { HeaderToolbar } from '../HeaderToolbar';
import { NavBar } from '../NavBar';

// import logo from '../../assets/images/logo.svg';
// import logoLight from '../../assets/images/logoLight.svg';

interface ReduxProps {
    currentMarket: Market | undefined;
    colorTheme: string;
    mobileWallet: string;
    sidebarOpened: boolean;
    marketSelectorOpened: boolean;
}

interface DispatchProps {
    setMobileWalletUi: typeof setMobileWalletUi;
    toggleSidebar: typeof toggleSidebar;
    toggleMarketSelector: typeof toggleMarketSelector;
}

// tslint:disable no-any jsx-no-multiline-js
class Head extends React.Component<any> {
    public render() {
        const {
            location,
            mobileWallet,
        } = this.props;
        const tradingCls = window.location.pathname.includes('/trading') ? 'pg-container-trading' : '';

        return (
            <React.Fragment>
            {!['/confirm'].some(r => location.pathname.includes(r)) &&
                <header className={`pg-header`}>
                    <div className={`pg-container pg-header__content ${tradingCls}`}>
                        <div
                            className={`pg-sidebar__toggler ${mobileWallet && 'pg-sidebar__toggler-mobile'}`}
                            onClick={this.openSidebar}
                        >
                            <span className="pg-sidebar__toggler-item"/>
                            <span className="pg-sidebar__toggler-item"/>
                            <span className="pg-sidebar__toggler-item"/>
                        </div>
                        {this.renderMarketToggler()}
                        {this.renderMEXSSO()}
                        <div className="pg-header__market-selector-toggle" onClick={() => {window.open('https://platform.gunthy.org', '_blank');}}>FOREX</div>
                        {location.pathname.includes('/simpleT') ? (<div className="pg-header__market-selector-toggle adv-trade" onClick={this.goToAdvanced}>Advanced&nbsp;Trading</div>) : ''}
                        <div className="pg-header__location">
                            {mobileWallet ? <span>{mobileWallet}</span> : <span>{location.pathname.split('/')[1]}</span>}
                        </div>
                        {this.renderMobileWalletNav()}
                        <div className="pg-header__navbar">
                            {this.renderMarketToolbar()}
                            <NavBar onLinkChange={this.closeMenu}/>
                        </div>
                    </div>
                </header>}
          </React.Fragment>
        );
    }

    public renderMobileWalletNav = () => {
        const { colorTheme, mobileWallet } = this.props;
        const isLight = colorTheme === 'light' ? 'Light' : '';

        return mobileWallet && (
            <div onClick={this.backWallets} className="pg-header__toggler">
                <img alt="" src={require(`./back${isLight}.svg`)} />
            </div>
        );
    };

    public translate = (id: string) => {
        return id ? this.props.intl.formatMessage({ id }) : '';
    };

    private goToAdvanced = () => {
        let href = window.location.href;
        window.location.href = href.replace('simpleT', 't');
    }

    private renderMarketToolbar = () => {
        const { location } = this.props;
        if (!location.pathname.includes('/trading/')) {
            return null;
        }

        return <HeaderToolbar/>;
    };

    private renderMarketToggler = () => {
        const { location, currentMarket, marketSelectorOpened, colorTheme } = this.props;
        const isLight = colorTheme === 'light';
        if (!location.pathname.includes('/trading/')) {
            return null;
        }

        return (
            <div className="pg-header__market-selector-toggle" onClick={this.props.toggleMarketSelector}>
                <p className="pg-header__market-selector-toggle-value">
                    {currentMarket && currentMarket.name}
                </p>
                {marketSelectorOpened ? (
                    <img src={require(`./arrows/arrowBottom${isLight ? 'Light' : ''}.svg`)} alt="arrow"/>
                ) : (
                    <img src={require(`./arrows/arrowRight${isLight ? 'Light' : ''}.svg`)} alt="arrow"/>
                )}
            </div>
        );
    };

    private renderMEXSSO = () => {
        const { colorTheme } = this.props;
        const isLight = colorTheme === 'light';

        return (
            <div className="pg-header__market-selector-toggle" onClick={() => window.location.href = '/api/v2/barong/identity/sessions/sso'}>
                <p className="pg-header__market-selector-toggle-value">MEX</p>
                <img src={require(`./arrows/arrowRight${isLight ? 'Light' : ''}.svg`)} alt="arrow" />
            </div>
        )
    };

    private openSidebar = () => this.props.toggleSidebar(!this.props.sidebarOpened);

    private backWallets = () => this.props.setMobileWalletUi('');

    private closeMenu = (e: any) => this.props.setMobileWalletUi('');
}

const mapStateToProps = (state: RootState): ReduxProps => ({
    currentMarket: selectCurrentMarket(state),
    colorTheme: selectCurrentColorTheme(state),
    mobileWallet: selectMobileWalletUi(state),
    sidebarOpened: selectSidebarState(state),
    marketSelectorOpened: selectMarketSelectorState(state),
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, {}> =
    dispatch => ({
        setMobileWalletUi: payload => dispatch(setMobileWalletUi(payload)),
        toggleSidebar: payload => dispatch(toggleSidebar(payload)),
        toggleMarketSelector: () => dispatch(toggleMarketSelector()),
    });

const Header = injectIntl(withRouter(connect(mapStateToProps, mapDispatchToProps)(Head) as any) as any);

export {
    Header,
};
