import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Icons, useModal } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '../Toolbar/Toolbar';
import HeaderPatientInfo from './HeaderPatientInfo';
import { PatientInfoVisibility } from './HeaderPatientInfo/HeaderPatientInfo';
import { preserveQueryParameters } from '@ohif/app';
import { Types } from '@ohif/core';

function ViewerHeader({ appConfig }: withAppTypes<{ appConfig: AppTypes.Config }>) {
  const { servicesManager, extensionManager, commandsManager } = useSystem();
  const { customizationService } = servicesManager.services;

  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation();
  const { show } = useModal();

  const AboutModal = customizationService.getCustomization(
    'ohif.aboutModal'
  ) as Types.MenuComponentCustomization;

  const UserPreferencesModal = customizationService.getCustomization(
    'ohif.userPreferencesModal'
  ) as Types.MenuComponentCustomization;

  const menuOptions = [
    {
      title: AboutModal?.menuTitle ?? t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: AboutModal?.title ?? t('AboutModal:About OHIF Viewer'),
          containerClassName: AboutModal?.containerClassName ?? 'max-w-md',
        }),
    },
    {
      title: UserPreferencesModal.menuTitle ?? t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          content: UserPreferencesModal,
          title: UserPreferencesModal.title ?? t('UserPreferencesModal:User preferences'),
          containerClassName:
            UserPreferencesModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
        }),
    },
  ];

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }

  return (
    <div className="flex h-[52px] w-full items-center justify-between bg-black px-4 text-white">
      {/* Left side - Patient Info */}
      <div className="flex items-center">
        {appConfig.showPatientInfo !== PatientInfoVisibility.DISABLED && (
          <HeaderPatientInfo
            servicesManager={servicesManager}
            appConfig={appConfig}
          />
        )}
      </div>

      {/* Center - Primary Toolbar */}
      <div className="flex items-center justify-center">
        <Toolbar buttonSection="primary" />
      </div>

      {/* Right side - Secondary Toolbar and Menu */}
      <div className="flex items-center gap-2">
        <Toolbar buttonSection="secondary" />

        {/* Menu Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Simple dropdown menu implementation
              const menu = document.createElement('div');
              menu.className =
                'absolute right-0 top-full z-50 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5';
              menu.innerHTML = menuOptions
                .map(
                  option => `
                <button class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" onclick="this.parentElement.remove()">
                  ${option.title}
                </button>
              `
                )
                .join('');

              const button = document.querySelector('[data-menu-button]');
              button?.parentElement?.appendChild(menu);

              // Close menu when clicking outside
              document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target as Node)) {
                  menu.remove();
                  document.removeEventListener('click', closeMenu);
                }
              });
            }}
            data-menu-button
          >
            <Icons.ByName name="chevron-down" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewerHeader;
