import {mapComponents} from '../utils';
import BasicSceneHandle from './basic-scene-handle';
import SceneViewMode from './scene-view-mode';
import SceneViewSetParams from './scene-view-set-params';
import SceneViewListen from './scene-view-listen';
import SceneViewControl from './scene-view-control';

export default mapComponents('SceneHandle', {
  BasicSceneHandle,
  SceneViewMode,
  SceneViewSetParams,
  SceneViewListen,
  SceneViewControl,
});
