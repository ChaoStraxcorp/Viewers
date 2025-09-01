import { id } from './id';
import getPanelModule from './getPanelModule';
import getLayoutTemplateModule from './getLayoutTemplateModule';
import './Icons'; // Register custom icons

const autometricsExtension = {
  id,
  getPanelModule,
  getLayoutTemplateModule,
};

export default autometricsExtension;
