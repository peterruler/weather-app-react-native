import { SafeAreaView, FlatList, Text, View, Image } from 'react-native';
import styles from './styles.js';
// New version as a System module wrapper around the CommonJS code
System.registerDynamic(['./assets/img/rainy.png','./assets/img/sunny.png','./assets/img/cloudy.png'], true, function(require, exports, module) {
    module.exports = require('./assets/img/rainy.png');
});
const WEATHER_DATA = [
  {
    title: 'Winterthur',
    temperature: '25+',
    image: 'sunny',
  },
  {
    title: 'Baden',
    temperature: '25+',
    image: 'rainy',
  },
  {
    title: 'Zürich',
    temperature: '25+',
    image: 'sunny',
  },
  {
    title: 'Fribourg',
    temperature: '25+',
    image: 'cloudy',
  },
  {
    title: 'Bern',
    temperature: '25+',
    image: 'sunny',
  },
];

function ListItem({ title, temp, weather }) {
  let isRainy = false;
  let isCloudy = false;
  let isSunny = false;
  switch (weather) {
    case 'cloudy':
      isCloudy = true;
      break;
    case 'rainy':
      isRainy = true;
      break;
    case 'sunny':
      isSunny = true;
      break;
  }
  return (
    <View style={styles.listItem}>
      <Text style={styles.placeTitle}>{title}</Text>
      <Text style={styles.temp}>{temp}</Text>
      {isRainy && (
        <Image
          className={'icon-' + weather}
          style={{
            width: 30,
            height: 28,
            position: 'relative',
            left: '50%',
            marginLeft: -16,
          }}
          source={require(`./assets/img/rainy.png`)}
        />
      )}
      {isSunny && (
        <Image
          className={'icon-' + weather}
          style={{
            width: 40,
            height: 40,
            position: 'relative',
            left: '50%',
            marginLeft: -20,
          }}
          source={require('./assets/img/sunny.png')}
        />
      )}
      {isCloudy && (
        <Image
          className={'icon-' + weather}
          style={{
            width: 40,
            height: 28,
            position: 'relative',
            left: '50%',
            marginLeft: -20,
          }}
          source={require('./assets/img/cloudy.png')}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={WEATHER_DATA}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            temp={item.temperature}
            weather={item.image}
          />
        )}
        keyExtractor={(item) => item.title}
      />
    </SafeAreaView>
  );
}
