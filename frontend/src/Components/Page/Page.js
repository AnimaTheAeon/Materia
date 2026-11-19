import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppUpdatedModal from 'App/AppUpdatedModal';
import ColorImpairedContext from 'App/ColorImpairedContext';
import ConnectionLostModal from 'App/ConnectionLostModal';
import SignalRConnector from 'Components/SignalRConnector';
import UpdateProgress, { isUpdateShowing } from 'Components/UpdateProgress/UpdateProgress';
import AuthenticationRequiredModal from 'FirstRun/AuthenticationRequiredModal';
import locationShape from 'Helpers/Props/Shapes/locationShape';
import BladesLayout from './Blades/BladesLayout';
import GreenFrame from './Green/GreenFrame';
import PageHeader from './Header/PageHeader';
import Mc360Layout from './Mc360/Mc360Layout';
import PageStatusBar from './PageStatusBar';
import PageTimeBox from './PageTimeBox';
import PageSidebar from './Sidebar/PageSidebar';
import styles from './Page.css';

class Page extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isUpdatedModalOpen: false,
      isConnectionLostModalOpen: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate(prevProps) {
    const {
      isDisconnected,
      isUpdated
    } = this.props;

    if (!prevProps.isUpdated && isUpdated) {
      this.setState({ isUpdatedModalOpen: true });
    }

    if (prevProps.isDisconnected !== isDisconnected) {
      this.setState({ isConnectionLostModalOpen: isDisconnected });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  //
  // Listeners

  onResize = () => {
    this.props.onResize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  onUpdatedModalClose = () => {
    this.setState({ isUpdatedModalOpen: false });
  };

  onConnectionLostModalClose = () => {
    this.setState({ isConnectionLostModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      className,
      location,
      children,
      isSmallScreen,
      isSidebarVisible,
      enableColorImpairedMode,
      authenticationEnabled,
      isGreenTheme,
      isBladesTheme,
      isMc360Theme,
      onSidebarToggle,
      onSidebarVisibleChange
    } = this.props;

    return (
      <ColorImpairedContext.Provider value={enableColorImpairedMode}>
        <div className={className}>
          <SignalRConnector />

          {
            isMc360Theme ?
              <Mc360Layout location={location}>
                {children}
              </Mc360Layout> :
              null
          }

          {
            isBladesTheme ?
              <BladesLayout location={location}>
                {children}
              </BladesLayout> :
              null
          }

          {
            !isBladesTheme && !isMc360Theme && (isGreenTheme ?
              <GreenFrame location={location}>
                {children}
              </GreenFrame> :
              <>
                <PageHeader
                  onSidebarToggle={onSidebarToggle}
                  isSmallScreen={isSmallScreen}
                />

                <div className={styles.main}>
                  {children}

                  <div className={styles.rightColumn}>
                    <PageSidebar
                      location={location}
                      isSmallScreen={isSmallScreen}
                      isSidebarVisible={isSidebarVisible}
                      onSidebarVisibleChange={onSidebarVisibleChange}
                    />

                    <PageTimeBox />
                  </div>
                </div>

                <PageStatusBar />
              </>)
          }

          <UpdateProgress />

          <AppUpdatedModal
            isOpen={this.state.isUpdatedModalOpen && !isUpdateShowing()}
            onModalClose={this.onUpdatedModalClose}
          />

          <ConnectionLostModal
            isOpen={this.state.isConnectionLostModalOpen && !isUpdateShowing()}
            onModalClose={this.onConnectionLostModalClose}
          />

          <AuthenticationRequiredModal
            isOpen={!authenticationEnabled}
          />
        </div>
      </ColorImpairedContext.Provider>
    );
  }
}

Page.propTypes = {
  className: PropTypes.string,
  location: locationShape.isRequired,
  children: PropTypes.node.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  isUpdated: PropTypes.bool.isRequired,
  isDisconnected: PropTypes.bool.isRequired,
  enableColorImpairedMode: PropTypes.bool.isRequired,
  authenticationEnabled: PropTypes.bool.isRequired,
  isGreenTheme: PropTypes.bool.isRequired,
  isBladesTheme: PropTypes.bool,
  isMc360Theme: PropTypes.bool,
  onResize: PropTypes.func.isRequired,
  onSidebarToggle: PropTypes.func.isRequired,
  onSidebarVisibleChange: PropTypes.func.isRequired
};

Page.defaultProps = {
  className: styles.page
};

export default Page;
