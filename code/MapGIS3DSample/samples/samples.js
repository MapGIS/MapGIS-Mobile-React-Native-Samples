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
import { Environment } from '@mapgis/uniform-core-react-native';
import SceneHandle from './scene-handle';
import SceneManager from './scene-manager';
import SceneGraphics from './scene-graphics';
import SceneFly from './scene-fly';
import SceneAnalysis from './scene-analysis';

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
  static navigationOptions = { title: 'MapGIS 3D Sample示例' };

  sections = [
    { title: '场景操作', data: mapScreens(SceneHandle) },
    { title: '场景管理', data: mapScreens(SceneManager) },
    { title: '场景覆盖物', data: mapScreens(SceneGraphics) },
    { title: '场景飞行', data: mapScreens(SceneFly) },
    { title: '三维分析', data: mapScreens(SceneAnalysis) },
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
  ...SceneHandle,
  ...SceneManager,
  ...SceneGraphics,
  ...SceneFly,
  ...SceneAnalysis,
};
