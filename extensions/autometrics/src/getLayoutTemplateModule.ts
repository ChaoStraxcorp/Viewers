import ViewerLayout from './ViewerLayout';

const getLayoutTemplateModule = ({
  servicesManager,
  extensionManager,
  commandsManager,
  hotkeysManager,
}) => {
  function ViewerLayoutWithServices(props) {
    return ViewerLayout({
      servicesManager,
      extensionManager,
      commandsManager,
      hotkeysManager,
      ...props,
    });
  }

  return [
    {
      name: 'viewerLayout',
      id: 'viewerLayout',
      component: ViewerLayoutWithServices,
    },
  ];
};

export default getLayoutTemplateModule;
