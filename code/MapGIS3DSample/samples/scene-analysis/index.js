import {mapComponents} from '../utils';
import SceneMeasureDistance from './scene-measure-distance';
import SceneBombAnalysis from './scene-bomb-analysis';
import SceneTerrianMeasureDistance from './scene-terrian-measure-distance';

export default mapComponents('SceneAnalysis', {
  SceneMeasureDistance,
  SceneBombAnalysis,
  SceneTerrianMeasureDistance,
});
