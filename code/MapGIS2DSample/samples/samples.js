import React, { Component } from 'react';
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { requestMultiplePermission, SYSTEM_LIB_PATH1 } from './utils';
import { Environment } from '@mapgis/mobile-react-native';
import MapDisplay from './map-display';
import MapControl from './map-control';
import MapDocManager from './map-doc-manager';
import MapAnnotation from './map-annotation';
import MapGraphic from './map-graphic';
import MapFeatureQuery from './map-featurequery';
import MapFeatureEdit from './map-featureedit';
import Theme from './theme';
import MapTool from './map-tool';
import MapSpatial from './map-spatial';

let Touchable = TouchableHighlight;
if (Platform.OS === 'android') {
  Touchable = TouchableNativeFeedback;
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#f5f5f5',
  },
  item: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  itemText: {
    color: '#212121',
    fontSize: 18,
  },
  sectionHeader: {
    color: '#757575',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#bdbdbd',
  },
  sectionFooter: {
    height: 16,
  },
});

const ListItem = withNavigation(({ title, route, navigation }) => (
  <Touchable onPress={() => navigation.navigate(route)}>
    <View style={styles.item}>
      <Text style={styles.itemText}>{title}</Text>
    </View>
  </Touchable>
));

function renderSectionHeader({ section }) {
  return <Text style={styles.sectionHeader}>{section.title}</Text>;
}

function renderSectionFooter() {
  return <View style={styles.sectionFooter} />;
}

function mapScreens(components) {
  return Object.keys(components).map(key => ({
    key,
    title: components[key].title,
  }));
}

class Samples extends Component {
  static navigationOptions = { title: 'MapGIS Mobile示例' };

  sections = [
    { title: '地图显示', data: mapScreens(MapDisplay) },
    { title: '地图控制', data: mapScreens(MapControl) },
    { title: '地图文档管理', data: mapScreens(MapDocManager) },
    { title: '地图标注', data: mapScreens(MapAnnotation) },
    { title: '地图覆盖物', data: mapScreens(MapGraphic) },
    { title: '要素查询', data: mapScreens(MapFeatureQuery) },
    { title: '要素编辑', data: mapScreens(MapFeatureEdit) },
    { title: '专题图', data: mapScreens(Theme) },
    { title: '地图工具', data: mapScreens(MapTool) },
    { title: '空间分析与计算', data: mapScreens(MapSpatial) },
  ];

  init = async () => {
    try {
      //请求权限
      await requestMultiplePermission();

      //初始化环境目录
      var environmnet = await Environment.createInstance();
      await environmnet.initialize(SYSTEM_LIB_PATH1);

      //请求授权
      await environmnet.requestAuthorization();
    } catch (e) {
      console.error(e);
    }
  };

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <SectionList
        style={styles.body}
        renderItem={({ item }) => (
          <ListItem title={item.title} route={item.key} />
        )}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        sections={this.sections}
      />
    );
  }
}

export default {
  examples: { screen: Samples },
  ...MapDisplay,
  ...MapControl,
  ...MapDocManager,
  ...MapAnnotation,
  ...MapGraphic,
  ...MapFeatureQuery,
  ...MapFeatureEdit,
  ...Theme,
  ...MapTool,
  ...MapSpatial,
};
