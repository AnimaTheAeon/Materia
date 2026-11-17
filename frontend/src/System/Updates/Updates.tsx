import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchGeneralSettings } from 'Store/Actions/settingsActions';
import { fetchUpdates } from 'Store/Actions/systemActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import { UpdateMechanism } from 'typings/Settings/General';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import translate from 'Utilities/String/translate';
import UpdateChanges from './UpdateChanges';
import styles from './Updates.css';

const VERSION_REGEX = /\d+\.\d+\.\d+\.\d+/i;

function createUpdatesSelector() {
  return createSelector(
    (state: AppState) => state.system.updates,
    (state: AppState) => state.settings.general,
    (updates, generalSettings) => {
      const { error: updatesError, items } = updates;

      const isFetching = updates.isFetching || generalSettings.isFetching;
      const isPopulated = updates.isPopulated && generalSettings.isPopulated;

      return {
        isFetching,
        isPopulated,
        updatesError,
        generalSettingsError: generalSettings.error,
        items,
        updateMechanism: generalSettings.item.updateMechanism,
      };
    }
  );
}

function Updates() {
  const currentVersion = useSelector((state: AppState) => state.app.version);
  const { packageUpdateMechanismMessage } = useSelector(
    createSystemStatusSelector()
  );
  const { shortDateFormat, longDateFormat, timeFormat } = useSelector(
    createUISettingsSelector()
  );
  const isInstallingUpdate = useSelector(
    createCommandExecutingSelector(commandNames.APPLICATION_UPDATE)
  );

  const {
    isFetching,
    isPopulated,
    updatesError,
    generalSettingsError,
    items,
    updateMechanism,
  } = useSelector(createUpdatesSelector());

  const dispatch = useDispatch();
  const [isMajorUpdateModalOpen, setIsMajorUpdateModalOpen] = useState(false);
  const hasError = !!(updatesError || generalSettingsError);
  const hasUpdates = isPopulated && !hasError && items.length > 0;

  const externalUpdaterPrefix = translate('UpdateAppDirectlyLoadError');
  const externalUpdaterMessages: Partial<Record<UpdateMechanism, string>> = {
    external: translate('ExternalUpdater'),
    apt: translate('AptUpdater'),
    docker: translate('DockerUpdater'),
  };

  const { isMajorUpdate, hasUpdateToInstall } = useMemo(() => {
    const majorVersion = parseInt(
      currentVersion.match(VERSION_REGEX)?.[0] ?? '0'
    );

    const latestVersion = items[0]?.version;
    const latestMajorVersion = parseInt(
      latestVersion?.match(VERSION_REGEX)?.[0] ?? '0'
    );

    return {
      isMajorUpdate: latestMajorVersion > majorVersion,
      hasUpdateToInstall: items.some(
        (update) => update.installable && update.latest
      ),
    };
  }, [currentVersion, items]);

  const handleInstallLatestPress = useCallback(() => {
    if (isMajorUpdate) {
      setIsMajorUpdateModalOpen(true);
    } else {
      dispatch(executeCommand({ name: commandNames.APPLICATION_UPDATE }));
    }
  }, [isMajorUpdate, setIsMajorUpdateModalOpen, dispatch]);

  const handleInstallLatestMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);

    dispatch(
      executeCommand({
        name: commandNames.APPLICATION_UPDATE,
        installMajorUpdate: true,
      })
    );
  }, [setIsMajorUpdateModalOpen, dispatch]);

  const handleCancelMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);
  }, [setIsMajorUpdateModalOpen]);

  useEffect(() => {
    dispatch(fetchUpdates());
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  // Check now: asks the update server again, like every other app.
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const handleCheckPress = useCallback(() => {
    dispatch(fetchUpdates());
    setCheckedAt(new Date());
  }, [dispatch]);

  const shortVersion = currentVersion.split('.').slice(0, 3).join('.');
  const latestItem = items.find((update) => update.latest);
  let statusMessage = `You're on Materia ${shortVersion}, the newest version.`;

  if (updatesError) {
    statusMessage = `You're on Materia ${shortVersion}. Materia couldn't reach the update server; press Check now to try again.`;
  } else if (hasUpdateToInstall && latestItem) {
    statusMessage = `Materia ${latestItem.version} is ready. You're on ${shortVersion}.`;
  }

  let statusIcon = icons.CHECK_CIRCLE;

  if (updatesError) {
    statusIcon = icons.WARNING;
  } else if (hasUpdateToInstall) {
    statusIcon = icons.DOWNLOAD;
  }

  if (checkedAt && !isFetching && !updatesError) {
    statusMessage += ` Checked at ${checkedAt.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}.`;
  }

  return (
    <PageContent title={translate('Updates')}>
      <PageContentBody>
        {isPopulated || hasError ? null : <LoadingIndicator />}

        {isPopulated || updatesError ? (
          <div className={styles.messageContainer}>
            <Icon
              className={
                hasUpdateToInstall ? styles.updateIcon : styles.upToDateIcon
              }
              name={statusIcon}
              kind={updatesError ? kinds.WARNING : undefined}
              size={30}
            />

            <div className={styles.message}>{statusMessage}</div>

            <SpinnerButton
              className={styles.check}
              isSpinning={isFetching}
              onPress={handleCheckPress}
            >
              Check now
            </SpinnerButton>
          </div>
        ) : null}

        {hasUpdateToInstall ? (
          <div className={styles.messageContainer}>
            {updateMechanism === 'builtIn' || updateMechanism === 'script' ? (
              <SpinnerButton
                kind={kinds.PRIMARY}
                isSpinning={isInstallingUpdate}
                onPress={handleInstallLatestPress}
              >
                {translate('InstallLatest')}
              </SpinnerButton>
            ) : (
              <>
                <Icon name={icons.WARNING} kind={kinds.WARNING} size={30} />

                <div className={styles.message}>
                  {externalUpdaterPrefix}{' '}
                  <InlineMarkdown
                    data={
                      packageUpdateMechanismMessage ||
                      externalUpdaterMessages[updateMechanism] ||
                      externalUpdaterMessages.external
                    }
                  />
                </div>
              </>
            )}
          </div>
        ) : null}

        {hasUpdates && (
          <div>
            {items.map((update) => {
              return (
                <div key={update.version} className={styles.update}>
                  <div className={styles.info}>
                    <div className={styles.version}>{update.version}</div>
                    <div className={styles.space}>&mdash;</div>
                    <div
                      className={styles.date}
                      title={formatDateTime(
                        update.releaseDate,
                        longDateFormat,
                        timeFormat
                      )}
                    >
                      {formatDate(update.releaseDate, shortDateFormat)}
                    </div>

                    {update.branch === 'master' ? null : (
                      <Label className={styles.label}>{update.branch}</Label>
                    )}

                    {update.version === currentVersion ? (
                      <Label
                        className={styles.label}
                        kind={kinds.SUCCESS}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('CurrentlyInstalled')}
                      </Label>
                    ) : null}

                    {update.version !== currentVersion && update.installedOn ? (
                      <Label
                        className={styles.label}
                        kind={kinds.INVERSE}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('PreviouslyInstalled')}
                      </Label>
                    ) : null}
                  </div>

                  {update.changes ? (
                    <div>
                      <UpdateChanges
                        title={translate('New')}
                        changes={update.changes.new}
                      />

                      <UpdateChanges
                        title={translate('Fixed')}
                        changes={update.changes.fixed}
                      />
                    </div>
                  ) : (
                    <div>{translate('MaintenanceRelease')}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {generalSettingsError ? (
          <Alert kind={kinds.DANGER}>
            {translate('FailedToFetchSettings')}
          </Alert>
        ) : null}

        <ConfirmModal
          isOpen={isMajorUpdateModalOpen}
          kind={kinds.WARNING}
          title={translate('InstallMajorVersionUpdate')}
          message={
            <div>
              <div>{translate('InstallMajorVersionUpdateMessage')}</div>
              <div>
                <InlineMarkdown
                  data={translate('InstallMajorVersionUpdateMessageLink', {
                    domain: 'prowlarr.com',
                    url: 'https://prowlarr.com/#downloads',
                  })}
                />
              </div>
            </div>
          }
          confirmLabel={translate('Install')}
          onConfirm={handleInstallLatestMajorVersionPress}
          onCancel={handleCancelMajorVersionPress}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default Updates;
