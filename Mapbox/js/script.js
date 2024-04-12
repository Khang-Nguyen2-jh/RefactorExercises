const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoia2hhbmdubDIwMDAiLCJhIjoiY2x1YzJmaXAxMGJydDJsbnp5ZHVxc3d5YyJ9.9XJ0Rn79ws8YqmVHbEaMOA";
const API_URL = "https://api.mapbox.com/search/searchbox/v1";
const SESSION_TOKEN = "014aa4cf-7273-4461-88e8-86b555e06243";
const DEFAULT_CENTER = [108.339537475899, 14.3154241771087];
const DEFAULT_ZOOM_LEVEL = 4;
const ZOOM_LEVEL = 8;
const DEBOUNCE_TIME = 1000; // set debounce time 1s

// Create map
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  DEFAULT_CENTER,
  DEFAULT_ZOOM_LEVEL,
});
// Loading map
map.on("load", function () {
  map.resize();
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Implement debouncing function
const debounce = (mainFunction, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};

// Clear old suggestions
const handleClearSuggestions = () => {
  const suggestions = document.getElementsByClassName("suggest-locations")[0];
  suggestions.replaceChildren();
};

// Clear old address detail
const handleClearAddressDetail = () => {
  const addressInfo = document.getElementsByClassName("bottom-left-section");
  addressInfo[0].replaceChildren();
};

// Handle get address on the search bar when change
const handleSearch = () => {
  const debouncedGetSuggestionLocation = debounce(
    getSuggestLocationFromMapboxAPI,
    DEBOUNCE_TIME
  );
  const searchInput = document.getElementById("searchString");
  searchInput.addEventListener("input", (event) => {
    handleClearSuggestions();
    // check value (contains letters or digits)
    if (/[a-zA-Z]/.test(event.target.value) || /\d/.test(event.target.value)) {
      debouncedGetSuggestionLocation(event.target.value);
    }
  });
};

// Handle call API to get suggest locations
const getSuggestLocationFromMapboxAPI = async (address) => {
  const queryParams = {
    q: address,
    language: "en",
    session_token: SESSION_TOKEN,
    access_token: MAPBOX_ACCESS_TOKEN,
  };
  const queryString = new URLSearchParams(queryParams).toString();
  const fullURL = `${API_URL}/suggest?${queryString}`;
  // Fetch data from URL
  const response = await fetch(fullURL);
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  } else {
    const data = await response.json();
    const suggestions = data.suggestions;
    handleSuggestData(suggestions);
  }
};

// Handle add new suggest locations
const handleSuggestData = async (suggestions) => {
  for (let suggestion of suggestions) {
    const newSuggestionSection = document.createElement("section");
    newSuggestionSection.innerHTML = `<p>${suggestion.name}</p>`;
    newSuggestionSection.classList.add("suggest-location");
    // Attach the onClick event listener to the new child element
    newSuggestionSection.addEventListener("click", () =>
      handleChooseLocation(suggestion.mapbox_id)
    );
    const element = document.getElementsByClassName("suggest-locations");
    element[0].appendChild(newSuggestionSection);
  }
};

// Handle when choose new location
const handleChooseLocation = async (mapboxId) => {
  // Clear suggestion list
  handleClearSuggestions();
  handleClearAddressDetail();
  // Call API to get address detail
  const addressDetail = await handleGetAddressDetail(mapboxId);
  // Handle render after getting address detail
  handleSetSearchData(addressDetail.properties.name);
  handleSetAddressDetail(addressDetail.properties);
  handleSetMapLocation(addressDetail.properties.coordinates);
};

// Handle get address detail
const handleGetAddressDetail = async (mapboxId) => {
  const queryParams = {
    session_token: SESSION_TOKEN,
    access_token: MAPBOX_ACCESS_TOKEN,
  };
  const queryString = new URLSearchParams(queryParams).toString();
  const fullURL = `${API_URL}/retrieve/${mapboxId}?${queryString}`;
  // Fetch data from URL
  const response = await fetch(fullURL);
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const addressDetailData = await response.json();
  return addressDetailData.features.length
    ? addressDetailData.features[0]
    : null;
};

const handleSetSearchData = (addressName) => {
  const searchInput = document.getElementById("searchString");
  searchInput.value = addressName;
};

const handleSetAddressDetail = (addressDetail) => {
  const bottomLeftSection = document.getElementsByClassName(
    "bottom-left-section"
  )[0];
  const addressInfo = document.createElement("section");
  addressInfo.innerHTML = `
    <h3>${addressDetail.name}</h3>
    <p>${addressDetail.full_address}</p>
    <p>Coordinates: [${addressDetail.coordinates.latitude}, ${addressDetail.coordinates.longitude}]</p>
    `;
  addressInfo.classList.add("addressInfo");
  bottomLeftSection.appendChild(addressInfo);
};

const handleSetMapLocation = (coordinates) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([coordinates.longitude, coordinates.latitude])
    .addTo(map);
  map.jumpTo({
    center: marker.getLngLat(),
    zoom: ZOOM_LEVEL,
  });
};

const main = () => {
  handleSearch();
};

main();
