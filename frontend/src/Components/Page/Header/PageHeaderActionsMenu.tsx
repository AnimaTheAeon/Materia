import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Icon from 'Components/Icon';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import MenuItem from 'Components/Menu/MenuItem';
import MenuItemSeparator from 'Components/Menu/MenuItemSeparator';
import useTheme from 'Helpers/Hooks/useTheme';
import { align, icons, kinds } from 'Helpers/Props';
import { saveUISettings, setUISettingsValue } from 'Store/Actions/Settings/ui';
import { restart, shutdown } from 'Store/Actions/systemActions';
import translate from 'Utilities/String/translate';
import styles from './PageHeaderActionsMenu.css';

// setUISettingsValue comes from a JS action creator, so describe its payload here.
const setUISetting = setUISettingsValue as unknown as (payload: {
  name: string;
  value: string;
}) => { type: string };

interface PageHeaderActionsMenuProps {
  onKeyboardShortcutsPress(): void;
}

function PageHeaderActionsMenu(props: PageHeaderActionsMenuProps) {
  const { onKeyboardShortcutsPress } = props;

  const dispatch = useDispatch();

  const { authentication, isContainerized } = useSelector(
    (state: AppState) => state.system.status.item
  );

  const formsAuth = authentication === 'forms';

  const handleRestartPress = useCallback(() => {
    dispatch(restart());
  }, [dispatch]);

  const handleShutdownPress = useCallback(() => {
    dispatch(shutdown());
  }, [dispatch]);

  const theme = useTheme();
  const nextTheme = theme === 'green' ? 'materia' : 'green';

  const handleThemePress = useCallback(() => {
    dispatch(setUISetting({ name: 'theme', value: nextTheme }));
    dispatch(saveUISettings());
  }, [dispatch, nextTheme]);

  return (
    <div>
      <Menu alignMenu={align.RIGHT}>
        <MenuButton className={styles.menuButton} aria-label="Menu Button">
          <Icon name={icons.INTERACTIVE} title={translate('Menu')} />
        </MenuButton>

        <MenuContent>
          <MenuItem onPress={onKeyboardShortcutsPress}>
            <Icon className={styles.itemIcon} name={icons.KEYBOARD} />
            {translate('KeyboardShortcuts')}
          </MenuItem>

          <MenuItem onPress={handleThemePress}>
            <Icon className={styles.itemIcon} name={icons.PALETTE} />
            {nextTheme === 'green'
              ? 'Switch to Box of X'
              : 'Switch to FFVII menu'}
          </MenuItem>

          <MenuItemSeparator />

          <MenuItem onPress={handleRestartPress}>
            <Icon className={styles.itemIcon} name={icons.RESTART} />
            {translate('Restart')}
          </MenuItem>

          {isContainerized ? null : (
            <MenuItem onPress={handleShutdownPress}>
              <Icon
                className={styles.itemIcon}
                name={icons.SHUTDOWN}
                kind={kinds.DANGER}
              />
              {translate('Shutdown')}
            </MenuItem>
          )}

          {formsAuth ? (
            <>
              <MenuItemSeparator />

              <MenuItem
                to={`${window.Prowlarr.urlBase}/logout`}
                noRouter={true}
              >
                <Icon className={styles.itemIcon} name={icons.LOGOUT} />
                {translate('Logout')}
              </MenuItem>
            </>
          ) : null}
        </MenuContent>
      </Menu>
    </div>
  );
}

export default PageHeaderActionsMenu;
