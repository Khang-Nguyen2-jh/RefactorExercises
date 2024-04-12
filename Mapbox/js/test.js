import mapBox from "./script.js";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoia2hhbmdubDIwMDAiLCJhIjoiY2x1YzJmaXAxMGJydDJsbnp5ZHVxc3d5YyJ9.9XJ0Rn79ws8YqmVHbEaMOA";
const SESSION_TOKEN = "014aa4cf-7273-4461-88e8-86b555e06243";
const newMapbox = mapBox();
newMapbox.init("mapbox", MAPBOX_ACCESS_TOKEN, SESSION_TOKEN, {
  defaultWidth: "800px",
  defaultHeight: "500px",
  defaultDebounceTime: 1000,
  defaultCenter: [108.339537475899, 14.3154241771087],
  defaultZoomLevel: 2,
});
newMapbox.updateContainerStyles({
  width: "600px",
  height: "400px",
});
newMapbox.title.updateContent("Custom Title");
newMapbox.title.updateStyles({
  "font-size": "30px",
  color: "red",
});
newMapbox.map.updateZoomLevel(4);
