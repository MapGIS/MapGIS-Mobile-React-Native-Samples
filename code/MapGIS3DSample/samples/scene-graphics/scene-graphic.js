import React, { Component } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import {
  AltitudeMode,
  Dot,
  Dot3D,
  Dots3D,
  DriverType,
  GraphicCircle3D,
  GraphicEllipse3D,
  GraphicImage3D,
  GraphicModel,
  GraphicMultiPoint3D,
  GraphicPlaceMarker,
  GraphicPoint3D,
  GraphicPolygon3D,
  GraphicPolyline3D,
  GraphicText3D,
  IntList,
  MGSceneView,
  ObjectManager,
  Scene,
  ServerLayer3D,
  SRSType,
  SunLightingMode,
  TerrainLayer3D,
  Viewpoint,
} from '@mapgis/mobile-react-native';
import {
  IMG_FILE_PATH2,
  IMG_FILE_PATH_GUOQI,
  MODLE_FILE_PATH,
  MODLE_FILE_PATH_ANIMATION,
  MODLE_FILE_PATH_PARTICLE,
  TERRAIN_FILE_PATH
} from '../utils';

export default class SceneGraphic extends Component {
  static navigationOptions = { title: '场景覆盖物交互' };

  constructor() {
    super();
    this.state = {
      data: [
        {
          id: '文字',
        },
        {
          id: '图片',
        },
        {
          id: '地标',
        },
        {
          id: '模型1',
        },
        {
          id: '模型2',
        },
        {
          id: '模型3',
        },
        {
          id: '点',
        },
        {
          id: '线',
        },
        {
          id: '区',
        },
        {
          id: '圆',
        },
        {
          id: '椭圆',
        },
        {
          id: '动态浏览',
        },
      ],
      selectedId: '',

      dot3DsLine: [],
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    await this.initData();

    let serverLayer3D = await ServerLayer3D.createInstance();
    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);
    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    let terrainLayer3D = await TerrainLayer3D.createInstance();
    await terrainLayer3D.setDriverType(DriverType.Driver_Type_GDAL);
    await terrainLayer3D.setSRSByString(SRSType.SRS_Type_Global);
    await terrainLayer3D.setURL(TERRAIN_FILE_PATH);

    let scene = await Scene.createInstance();
    await scene.addLayer(serverLayer3D);
    await scene.addLayer(terrainLayer3D);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      this.initScene();
    }
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  initScene = async () => {
    let graphic3DsOverlay = await this.sceneView.getDefaultGraphics3DOverlay();

    if (this.graphicText3D1 === null || this.graphicText3D1 === undefined) {
      this.graphicText3D1 = await GraphicText3D.createInstance();
      await this.graphicText3D1.setAttributeValue('name', 'GraphicText3D1');
      await graphic3DsOverlay.addGraphic(this.graphicText3D1);
    }

    if (this.graphicText3D2 === null || this.graphicText3D2 === undefined) {
      this.graphicText3D2 = await GraphicText3D.createInstance();
      await this.graphicText3D2.setAttributeValue('name', 'GraphicText3D2');
      await graphic3DsOverlay.addGraphic(this.graphicText3D2);
    }

    if (this.graphicText3D3 === null || this.graphicText3D3 === undefined) {
      this.graphicText3D3 = await GraphicText3D.createInstance();
      await this.graphicText3D3.setAttributeValue('name', 'GraphicText3D3');
      await graphic3DsOverlay.addGraphic(this.graphicText3D3);
    }

    if (this.graphicImage3D === null || this.graphicImage3D === undefined) {
      this.graphicImage3D = await GraphicImage3D.createInstance();
      await this.graphicImage3D.setAttributeValue('name', 'GraphicImage3D');
      await graphic3DsOverlay.addGraphic(this.graphicImage3D);
    }

    if (this.graphicModel === null || this.graphicModel === undefined) {
      this.graphicModel = await GraphicModel.createInstance();
      await this.graphicModel.setAttributeValue('name', 'GraphicModel');
      await graphic3DsOverlay.addGraphic(this.graphicModel);
    }

    if (this.graphicmodelParticle === null || this.graphicmodelParticle === undefined) {
      this.graphicmodelParticle = await GraphicModel.createInstance();
      await this.graphicmodelParticle.setAttributeValue('name', 'GraphicmodelParticle');
      await graphic3DsOverlay.addGraphic(this.graphicmodelParticle);
    }

    if (this.graphicmodelAnimation === null || this.graphicmodelAnimation === undefined) {
      this.graphicmodelAnimation = await GraphicModel.createInstance();
      await this.graphicmodelAnimation.setAttributeValue('name', 'GraphicmodelAnimation');
      await graphic3DsOverlay.addGraphic(this.graphicmodelAnimation);
    }

    if (this.graphicPlaceMarker === null || this.graphicPlaceMarker === undefined) {
      this.graphicPlaceMarker = await GraphicPlaceMarker.createInstance();
      await this.graphicPlaceMarker.setAttributeValue('name', 'GraphicPlaceMarker');
      await graphic3DsOverlay.addGraphic(this.graphicPlaceMarker);
    }

    if (this.graphicPoint3D === null || this.graphicPoint3D === undefined) {
      this.graphicPoint3D = await GraphicPoint3D.createInstance();
      await this.graphicPoint3D.setAttributeValue('name', 'GraphicPoint3D');
      await graphic3DsOverlay.addGraphic(this.graphicPoint3D);
    }

    if (this.graphicMultiPoint3D === null || this.graphicMultiPoint3D === undefined) {
      this.graphicMultiPoint3D = await GraphicMultiPoint3D.createInstance();
      await this.graphicMultiPoint3D.setAttributeValue('name', 'GraphicMultiPoint3D');
      await graphic3DsOverlay.addGraphic(this.graphicMultiPoint3D);
    }

    if (this.graphicPolyline3D === null || this.graphicPolyline3D === undefined) {
      this.graphicPolyline3D = await GraphicPolyline3D.createInstance();
      await this.graphicPolyline3D.setAttributeValue('name', 'GraphicPolyline3D');
      await graphic3DsOverlay.addGraphic(this.graphicPolyline3D);
    }

    if (this.graphicPolygon3D === null || this.graphicPolygon3D === undefined) {
      this.graphicPolygon3D = await GraphicPolygon3D.createInstance();
      await this.graphicPolygon3D.setAttributeValue('name', 'GraphicPolgon3D');
      await graphic3DsOverlay.addGraphic(this.graphicPolygon3D);
    }

    if (this.graphicPolygon3DTF === null || this.graphicPolygon3DTF === undefined) {
      this.graphicPolygon3DTF = await GraphicPolygon3D.createInstance();
      await this.graphicPolygon3DTF.setAttributeValue('name', 'GraphicPolgon3DTF');
      await graphic3DsOverlay.addGraphic(this.graphicPolygon3DTF);
    }

    if (this.graphicCircle3D === null || this.graphicCircle3D === undefined) {
      this.graphicCircle3D = await GraphicCircle3D.createInstance();
      await this.graphicCircle3D.setAttributeValue('name', 'GraphicCircle3D');
      await graphic3DsOverlay.addGraphic(this.graphicCircle3D);
    }

    if (this.graphicEllipse3D === null || this.graphicEllipse3D === undefined) {
      this.graphicEllipse3D = await GraphicEllipse3D.createInstance();
      await this.graphicEllipse3D.setAttributeValue('name', 'GraphicEllipse3D');
      await graphic3DsOverlay.addGraphic(this.graphicEllipse3D);
    }

    await this.sceneView.registerSceneViewGraphicListener();
  };

  initData = async () => {
    let dot3DsLine = [];

    let dot3Ds1 = await Dot3D.createInstance(116.405419, 39.916927, 9000);
    let dot3Ds2 = await Dot3D.createInstance(26.00, 23.71, 9000);
    let dot3Ds3 = await Dot3D.createInstance(103.382843, 1.098812, 90000.00);
    let dot3Ds4 = await Dot3D.createInstance(116.405419, 39.916927, 9000);
    dot3DsLine.push(dot3Ds1);
    dot3DsLine.push(dot3Ds2);
    dot3DsLine.push(dot3Ds3);
    dot3DsLine.push(dot3Ds4);

    this.setState({ dot3DsLine: dot3DsLine });

    this.beijingDot3Lst = await Dots3D.createInstance();
    let beijingDot1 = await Dot3D.createInstance(114.217508, 42.00238, 9000);
    let beijingDot2 = await Dot3D.createInstance(118.503816, 42.00238, 9000);
    let beijingDot3 = await Dot3D.createInstance(116.499216, 39.834152, 9000);
    let beijingDot4 = await Dot3D.createInstance(114.217508, 39.834152, 9000);
    let beijingDot5 = await Dot3D.createInstance(114.217508, 42.00238, 9000);
    await this.beijingDot3Lst.append(beijingDot1);
    await this.beijingDot3Lst.append(beijingDot2);
    await this.beijingDot3Lst.append(beijingDot3);
    await this.beijingDot3Lst.append(beijingDot4);
    await this.beijingDot3Lst.append(beijingDot5);

    this.polgon3DTFDots = await Dots3D.createInstance();
    let polgon3DTF1 = await Dot3D.createInstance(86.2544329679595, 27.4991561270377, 0);
    let polgon3DTF2 = await Dot3D.createInstance(86.617298341765, 27.4873419055649, 0);
    let polgon3DTF3 = await Dot3D.createInstance(86.4468360033727, 27.1700456717257, 0);
    let polgon3DTF4 = await Dot3D.createInstance(86.4164565767285, 27.3708874367622, 0);
    let polgon3DTF5 = await Dot3D.createInstance(86.105911326588, 27.4586502248454, 0);
    let polgon3DTF6 = await Dot3D.createInstance(86.2544329679595, 27.4991561270377, 0);
    await this.polgon3DTFDots.append(polgon3DTF1);
    await this.polgon3DTFDots.append(polgon3DTF2);
    await this.polgon3DTFDots.append(polgon3DTF3);
    await this.polgon3DTFDots.append(polgon3DTF4);
    await this.polgon3DTFDots.append(polgon3DTF5);
    await this.polgon3DTFDots.append(polgon3DTF6);
  };

  setSelect = async (item) => {
    this.setState({ selectedId: item.id })
    if (item.id == '文字') {
      this.graphicText3DSelected();
    } else if (item.id == '图片') {
      this.graphicImage3DSelected();
    } else if (item.id == '地标') {
      this.graphicPlaceMarkerSelected();
    } else if (item.id == '模型1') {
      this.graphicModelSelected();
    } else if (item.id == '模型2') {
      this.graphicModelParticleSelected();
    } else if (item.id == '模型3') {
      this.graphicModelAnimationSelected();
    } else if (item.id == '点') {
      this.graphicPoint3DSelected();
    } else if (item.id == '线') {
      this.graphicPolyline3DSelected();
    } else if (item.id == '区') {
      this.graphicPolgon3DSelected();
    } else if (item.id == '圆') {
      this.graphicCircle3DSelected();
    } else if (item.id == '椭圆') {
      this.graphicEllipse3DSelected();
    } else if (item.id == '动态浏览') {
      this.defaultShowSelected();
    }
  }

  graphicText3DSelected = async () => {
    if (this.graphicText3D1 !== null && this.graphicText3D1 !== undefined) {
      let dot3d = await Dot3D.createInstance(114.410142, 30.521057, 0);
      await this.graphicText3D1.setText('wuhan武汉');
      await this.graphicText3D1.setPoint(dot3d);
      let textViewPoint = await Viewpoint.createInstanceByParam(dot3d, 1.693187, -42.132855, 6034295.16114);
      await this.sceneView.jumptoViewPoint(textViewPoint, 1);
    }
  };

  graphicImage3DSelected = async () => {
    if (this.graphicImage3D !== null && this.graphicImage3D !== undefined) {
      let mode = await this.sceneView.getSunLightingMode();
      if (mode === SunLightingMode.NONE) {
        await this.sceneView.setSunLightingMode(SunLightingMode.LIGHT);
      }
      else {
        await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
      }

      let dot1 = await Dot.createInstance(106.00, 30.00);
      let dot2 = await Dot.createInstance(116.0, 30.00);
      let dot3 = await Dot.createInstance(106.00, 35.00);
      let dot4 = await Dot.createInstance(116.00, 35.00);
      await this.graphicImage3D.setImagePath(IMG_FILE_PATH_GUOQI);
      await this.graphicImage3D.setCorners(dot1, dot2, dot3, dot4);

      let dot3d = await Dot3D.createInstance(106.00, 30.00, 30);
      let iamgeViewPoint = await Viewpoint.createInstanceByParam(dot3d, 1.693, -42.132, 6034995.16);
      await this.sceneView.jumptoViewPoint(iamgeViewPoint, 1);
    }
  };

  graphicPlaceMarkerSelected = async () => {
    if (this.graphicPlaceMarker !== null && this.graphicPlaceMarker !== undefined) {
      let dot3d = await Dot3D.createInstance(116.405419, 39.916927, 0);
      await this.graphicPlaceMarker.setPosition(dot3d);
      await this.graphicPlaceMarker.setImagePath(IMG_FILE_PATH2);
      await this.graphicPlaceMarker.setLabelText('北京');
      await this.graphicPlaceMarker.setColor('rgba(255, 255, 0, 255)');
      await this.graphicPlaceMarker.setLabelTextSize(50);

      let dot3d1 = await Dot3D.createInstance(116.405419, 39.91692, 0);
      let markerViewPoint = await Viewpoint.createInstanceByParam(dot3d1, 1.69317, -42.132, 6034295.1614);
      await this.sceneView.jumptoViewPoint(markerViewPoint, 1);
    }
  };

  graphicModelSelected = async () => {
    if (this.graphicModel !== null && this.graphicModel !== undefined) {
      let dot3d = await Dot3D.createInstance(114.35580, 30.512496132231561, 100.0);
      await this.graphicModel.setModelPath(MODLE_FILE_PATH);
      await this.graphicModel.setPoint(dot3d);
      await this.graphicModel.setAngleAroundX(270);
      await this.graphicModel.setAltitudeMode(AltitudeMode.CLAMPTOTERRAIN);

      let dot3d1 = await Dot3D.createInstance(114.355602, 30.512828, 3650);
      let viewPoint = await Viewpoint.createInstanceByParam(dot3d1, 0.5110828, -45.907147, 2000.3258346);
      await this.sceneView.jumptoViewPoint(viewPoint, 2);
    }
  };

  graphicModelParticleSelected = async () => {
    if (this.graphicmodelParticle !== null && this.graphicmodelParticle !== undefined) {
      let dot3d = await Dot3D.createInstance(114.367782, 30.516891, 100.00);
      await this.graphicmodelParticle.setModelPath(MODLE_FILE_PATH_PARTICLE);
      await this.graphicmodelParticle.setPoint(dot3d);
      await this.graphicmodelParticle.setAngleAroundX(0);
      await this.graphicmodelParticle.setAltitudeMode(AltitudeMode.RELATIVETOTERRAIN);

      let dot3d1 = await Dot3D.createInstance(114.368156, 30.517354, 3649.824084);
      let viewPointParticle = await Viewpoint.createInstanceByParam(dot3d1, 30.1533, -48.037, 388.42648);
      await this.sceneView.jumptoViewPoint(viewPointParticle, 2);
    }
  };

  graphicModelAnimationSelected = async () => {
    if (this.graphicmodelAnimation !== null && this.graphicmodelAnimation !== undefined) {
      let dot3d = await Dot3D.createInstance(86.48, 27.5, 0.00);
      await this.graphicmodelAnimation.setModelPath(MODLE_FILE_PATH_ANIMATION);
      await this.graphicmodelAnimation.setPoint(dot3d);
      await this.graphicmodelAnimation.setAltitudeMode(AltitudeMode.RELATIVETOTERRAIN);
      await this.graphicmodelAnimation.setAngleAroundX(90);

      await this.graphicmodelAnimation.setScaleX(1000);
      await this.graphicmodelAnimation.setScaleY(1000);
      await this.graphicmodelAnimation.setScaleZ(1000);

      let dot3d1 = await Dot3D.createInstance(86.48, 27.5, 0.00);
      let viewPointAnimation = await Viewpoint.createInstanceByParam(dot3d1, 0, -45, 280000);
      await this.sceneView.jumptoViewPoint(viewPointAnimation, 2);
    }
  };

  graphicPoint3DSelected = async () => {
    if (this.graphicMultiPoint3D !== null && this.graphicMultiPoint3D !== undefined) {

      // let dot3d = await Dot3D.createInstance(116.312845, 39.839309, 9000.00);
      // await this.graphicPoint3D.setPoint();
      // await this.graphicPoint3D.setSize(20);
      // await this.graphicPoint3D.setColor('rgba(255, 0, 0, 255)');
      // await this.graphicPoint3D.setAltitudeMode(AltitudeMode.RELATIVETOTERRAIN);

      await this.graphicMultiPoint3D.setPoints(this.state.dot3DsLine);
      await this.graphicMultiPoint3D.setPointSize(20);
      await this.graphicMultiPoint3D.setColor('rgba(255, 0, 0, 255)');

      let dot3d1 = await Dot3D.createInstance(116.312845, 39.839309, 0.00);
      let pointViewpoint = await Viewpoint.createInstanceByParam(dot3d1, 0, -45, 280000);
      await this.sceneView.jumptoViewPoint(pointViewpoint, 1);
    }
  };

  graphicPolyline3DSelected = async () => {
    if (this.graphicPolyline3D !== null && this.graphicPolyline3D !== undefined) {
      await this.graphicPolyline3D.setPoints(this.state.dot3DsLine);
      await this.graphicPolyline3D.setColor('rgba(255, 255, 0, 128)');
      await this.graphicPolyline3D.setLineWidth(10);
      await this.graphicPolyline3D.setAltitudeMode(AltitudeMode.CLAMPTOTERRAIN);
    }
  };

  graphicPolgon3DSelected = async () => {
    if (this.graphicPolygon3DTF !== null && this.graphicPolygon3DTF !== undefined) {
      // let dot3d = await Dot3D.createInstance(116.405419, 39.916927, 9000);
      // await this.graphicText3D2.setPoint(dot3d);
      // await this.graphicText3D2.setText('beijing');
      //
      // await this.graphicPolygon3D.setPoints(mBeijingDot3Lst);
      // await this.graphicPolygon3D.setBorderlineWidth(1);
      // await this.graphicPolygon3D.setBorderlineColor('rgba(0, 0, 0, 128)');
      // await this.graphicPolygon3D.setColor('rgba(0, 0, 200, 128)');
      // await this.graphicPolygon3D.setExtrusionHeight(90000);
      // await this.graphicPolygon3D.init();

      let intList = await IntList.createInstance();
      let size = await this.polgon3DTFDots.size();
      await intList.append(size);

      await this.graphicPolygon3DTF.setPointsByDots(this.polgon3DTFDots, intList);
      await this.graphicPolygon3DTF.setBorderlineWidth(5.0);
      await this.graphicPolygon3DTF.setBorderlineColor('rgba(0, 0, 255, 255)');
      await this.graphicPolygon3DTF.setColor('rgba(255, 0, 0, 255)');
      await this.graphicPolygon3DTF.setAltitudeMode(AltitudeMode.RELATIVETOTERRAIN);

      let dot3d1 = await Dot3D.createInstance(86.4164565767285, 27.3708874367622, 29.200001);
      let polygonViewPoint = await Viewpoint.createInstanceByParam(dot3d1, 1.693187, -42.132855, 6034295.16114);
      await this.sceneView.jumptoViewPoint(polygonViewPoint, 1);
    }
  };

  graphicCircle3DSelected = async () => {
    if (this.graphicText3D1 !== null && this.graphicText3D1 !== undefined && this.graphicCircle3D !== null && this.graphicCircle3D !== undefined) {
      await this.sceneView.setAmbientLightColor('rgba(255, 255, 255, 255)');
      let dot3d = await Dot3D.createInstance(26.00, 23.71, 9000);
      await this.graphicText3D1.setPoint(dot3d);
      // let dot3d = await Dot3D.createInstance(60.292969,31.952162, 9000);
      // await this.graphicText3D1.setPoint(dot3d);
      await this.graphicText3D1.setText('Egypt');

      await this.graphicCircle3D.setBorderlineColor('rgba(0, 0, 0, 128)');
      await this.graphicCircle3D.setBorderlineWidth(1);
      await this.graphicCircle3D.setColor('rgba(200, 0, 0, 128)');
      await this.graphicCircle3D.setCenterPoint(dot3d);
      await this.graphicCircle3D.setRadius(500000);
      await this.graphicCircle3D.setAltitudeMode(AltitudeMode.NONE);

      let dot3d1 = await Dot3D.createInstance(26.00, 23.71, 29.200001);
      let circleViewPoint = await Viewpoint.createInstanceByParam(dot3d1, 1.693187, -42.132855, 6034295.16114);
      await this.sceneView.jumptoViewPoint(circleViewPoint, 1);
    }
  };

  graphicEllipse3DSelected = async () => {
    if (this.graphicText3D3 !== null && this.graphicText3D3 !== undefined && this.graphicEllipse3D !== null && this.graphicEllipse3D !== undefined) {
      let dot3d = await Dot3D.createInstance(103.382843, 1.098812, 9000.00);
      await this.graphicText3D3.setPoint(dot3d);
      await this.graphicText3D3.setText('Singapore');

      await this.graphicEllipse3D.setBorderlineWidth(1);
      await this.graphicEllipse3D.setPoint(dot3d);
      await this.graphicEllipse3D.setRadiusMinor(100000);
      await this.graphicEllipse3D.setRadiusMajor(300000);
      await this.graphicEllipse3D.setColor('rgba(255, 0, 0, 255)');
      await this.graphicEllipse3D.setAltitudeMode(AltitudeMode.NONE);

      let dot3d1 = await Dot3D.createInstance(103.382843, 1.098812, 29.200001);
      let ellipseViewPoint = await Viewpoint.createInstanceByParam(dot3d1, 1.693187, -42.132855, 6034295.16114);
      await this.sceneView.jumptoViewPoint(ellipseViewPoint, 1);
    }
  };

  defaultShowSelected = async () => {
    await this.sceneView.setAmbientLightColor('rgba(255, 255, 255, 255)');

    let scene = await this.sceneView.getScene();
    if (scene !== null && scene !== undefined) {

      // 北京视角
      let intList = await IntList.createInstance();
      let size = await this.beijingDot3Lst.size();
      await intList.append(size);

      await this.graphicPolygon3D.setPointsByDots(this.beijingDot3Lst, intList);
      await this.graphicPolygon3D.setBorderlineWidth(1);
      await this.graphicPolygon3D.setBorderlineColor('rgba(0, 0, 0, 128)');
      await this.graphicPolygon3D.setColor('rgba(0, 0, 200, 128)');
      await this.graphicPolygon3D.setExtrusionHeight(90000);

      let dot3d = await Dot3D.createInstance(116.405419, 39.916927, 0);
      await this.graphicText3D2.setPoint(dot3d);
      await this.graphicText3D2.setText('beijing');

      let dot3d1 = await Dot3D.createInstance(116.091222, 39.891972, -3032.809451);
      let beijingViewPoint = await Viewpoint.createInstanceByParam(dot3d1, -9.552734, -85.370509, 753879.8132);
      await this.sceneView.jumptoViewPoint(beijingViewPoint, 2);

      await threadSleep(3000);
      // 埃及视角：
      let dot3d2 = await Dot3D.createInstance(26.00, 23.71, 9000);
      await this.graphicCircle3D.setBorderlineColor('rgba(0, 0, 0, 128)');
      await this.graphicCircle3D.setBorderlineWidth(1);
      await this.graphicCircle3D.setColor('rgba(200, 0, 0, 128)');
      await this.graphicCircle3D.setCenterPoint(dot3d2);
      await this.graphicCircle3D.setRadius(500000);
      await this.graphicCircle3D.setAltitudeMode(AltitudeMode.NONE);

      let dot1 = await Dot.createInstance(106.00, 30.00);
      let dot2 = await Dot.createInstance(116.0, 30.00);
      let dot3 = await Dot.createInstance(106.00, 35.00);
      let dot4 = await Dot.createInstance(116.00, 35.00);
      await this.graphicImage3D.setImagePath(IMG_FILE_PATH_GUOQI);
      await this.graphicImage3D.setCorners(dot1, dot2, dot3, dot4);

      let dot3d3 = await Dot3D.createInstance(26.00, 23.71, 9000);
      await this.graphicText3D1.setPoint(dot3d3);
      await this.graphicText3D1.setText('Egypt');

      let dot3d4 = await Dot3D.createInstance(26.00, 23.71, -4289.470116);
      let aiViewPoint = await Viewpoint.createInstanceByParam(dot3d4, -7.8840078, -74.09905, 24999700.42684);
      await this.sceneView.jumptoViewPoint(aiViewPoint, 2);
      await this.graphicPolyline3D.setPoints(this.state.dot3DsLine);
      await this.graphicPolyline3D.setColor('rgba(255, 255, 0, 128)');
      await this.graphicPolyline3D.setLineWidth(6);
      await this.graphicPolyline3D.setAltitudeMode(AltitudeMode.NONE);

      await threadSleep(3000);
      // 新加坡
      let dot3d5 = await Dot3D.createInstance(103.382843, 1.098812, 90000.00);
      await this.graphicEllipse3D.setBorderlineWidth(1);
      await this.graphicEllipse3D.setPoint(dot3d5);
      await this.graphicEllipse3D.setRadiusMinor(100000);
      await this.graphicEllipse3D.setRadiusMajor(300000);
      await this.graphicEllipse3D.setColor('rgba(255, 0, 0, 255)');
      await this.graphicEllipse3D.setAltitudeMode(AltitudeMode.NONE);

      let dot3d6 = await Dot3D.createInstance(103.382843, 1.098812, 0.00);
      await this.graphicText3D3.setPoint(dot3d6);
      await this.graphicText3D3.setText('Singapore');

      let dot3d7 = await Dot3D.createInstance(103.382843, 1.098812, -3032.809451);
      let hangzhouViewPoint = await Viewpoint.createInstanceByParam(dot3d7, -9.552734, -85.370509, 753879.8132);
      await this.sceneView.jumptoViewPoint(hangzhouViewPoint, 2);
    }
  };

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        this.setSelect(item)
      }}
    >
      <View style={styles.listItem}>
        <Text style={{
          fontSize: 16,
          color: item.id == this.state.selectedId ? ('#ffff00') : ('#fff'),
        }}>{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />
        <FlatList
          style={styles.list}
          keyExtractor={(item) => item.id}
          data={this.state.data}
          extraData={this.state.selectedId}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

function threadSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
