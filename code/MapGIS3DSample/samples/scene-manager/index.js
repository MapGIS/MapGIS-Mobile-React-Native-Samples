import {mapComponents} from '../utils';
import SceneViewData from './scene-view-data';
import SceneLayerControl from './scene-layer-control';
import SceneViewScheme from './scene-view-scheme';
import SceneViewQuery from './scene-view-query';

export default mapComponents('SceneManager', {
  SceneViewData,
  SceneLayerControl,
  SceneViewScheme,
  SceneViewQuery,
});
