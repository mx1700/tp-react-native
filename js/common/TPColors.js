/**
 * @providesModule TPColors
 */

const LOCATION_COLORS = {
  'HERBST': '#00E3AD',
  'HERBST A': '#00E3AD',
  'HERBST B': '#00E3AD',
  'HACKER X': '#4D99EF',
  'HACKER Y': '#CF72B1',
  'COWELL': '#6A6AD5',
  'COWELL C': '#6A6AD5',
  'FOOD TENT': '#FFCD3B',
};

function colorForLocation(location) {
  if (!location) {
    return 'black';
  }

  var color = LOCATION_COLORS[location.toUpperCase()];
  if (!color) {
    console.warn(`Location '${location}' has no color`);
    color = 'black';
  }
  return color;
}

function colorForTopic(count, index) {
  const hue = Math.round(360 * index / (count + 1));
  return `hsl(${hue}, 74%, 65%)`;
}

module.exports = {
  actionText: '#3FB4CF',
  inactiveText: '#9B9B9B',
  darkText: '#032250',
  lightText: '#7F91A7',


  cellBorder: '#EEEEEE',
  darkBackground: '#183E63',
  colorForLocation,
  colorForTopic,

  contentText: '#484848',
  spaceBackground: '#f8f8f8',
  line: '#ddd',
  //light: '#455ede',
  light: '#0076FF',
  //inactive: "#9B9B9B",
  inactive: "#aaa",
  dark: '#2a36b1',

  refreshColor: '#0098ff'
};