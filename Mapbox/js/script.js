const mapBox = () => {
  const API_URL = "https://api.mapbox.com/search/searchbox/v1";
  let mapboxContainerId;
  let mapboxContainer;
  let mapboxTitle;
  let mapboxMap;
  let mapboxAccessToken;
  let mapboxSessionToken;
  let mapboxZoomLevel;
  let marker = null;
  let mapboxDebounceTime;
  const createMapboxContainer = (defaultWidth, defaultHeight) => {
    const createLeftSection = () => {
      const createTopLeftSection = () => {
        const topLeftSection = document.createElement("section");
        topLeftSection.classList.add(`top-left-section-${mapboxContainerId}`);
        const title = document.createElement("h1");
        title.innerHTML = mapboxTitle;
        const searchInput = document.createElement("input");
        searchInput.id = `searchString-${mapboxContainerId}`;
        searchInput.classList.add(`searchString-${mapboxContainerId}`);
        searchInput.placeholder = "Type new address here";
        const suggestLocations = document.createElement("section");
        suggestLocations.classList.add(
          `suggest-locations-${mapboxContainerId}`
        );
        topLeftSection.appendChild(title);
        topLeftSection.appendChild(searchInput);
        topLeftSection.appendChild(suggestLocations);
        return topLeftSection;
      };
      const createBottomLeftSection = () => {
        const bottomLeftSection = document.createElement("section");
        bottomLeftSection.classList.add(
          `bottom-left-section-${mapboxContainerId}`
        );
        return bottomLeftSection;
      };
      const leftSection = document.createElement("section");
      leftSection.classList.add(`left-section-${mapboxContainerId}`);
      leftSection.appendChild(createTopLeftSection());
      leftSection.appendChild(createBottomLeftSection());
      return leftSection;
    };
    const createRightSection = () => {
      const rightSection = document.createElement("section");
      rightSection.classList.add(`right-section-${mapboxContainerId}`);
      const mapSection = document.createElement("section");
      mapSection.id = "map";
      rightSection.appendChild(mapSection);
      return rightSection;
    };
    updateElementStyles(mapboxContainer, {
      display: "flex",
      "flex-direction": "row",
      "justify-content": "space-between",
      width: defaultWidth,
      height: defaultHeight,
    });
    const leftSection = createLeftSection();
    const rightSection = createRightSection();
    mapboxContainer.appendChild(leftSection);
    mapboxContainer.appendChild(rightSection);
  };
  const initMapbox = (defaultCenter, defaultZoomLevel) => {
    mapboxgl.accessToken = mapboxAccessToken;
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultCenter, // starting position [lng, lat]
      zoom: defaultZoomLevel,
    });
    map.on("load", function () {
      map.resize();
    });
    map.addControl(new mapboxgl.NavigationControl());
    return map;
  };
  const clearSuggestionsList = () => {
    const suggestions = document.getElementsByClassName(
      `suggest-locations-${mapboxContainerId}`
    )[0];
    suggestions.replaceChildren();
  };
  const clearAddressDetailCard = () => {
    const addressInfo = document.getElementsByClassName(
      `bottom-left-section-${mapboxContainerId}`
    );
    addressInfo[0].replaceChildren();
  };
  const setSearchData = (addressName) => {
    const searchInput = document.getElementById(
      `searchString-${mapboxContainerId}`
    );
    searchInput.value = addressName;
  };
  const renderAccessDetailCard = (addressDetail) => {
    const bottomLeftSection = document.getElementsByClassName(
      `bottom-left-section-${mapboxContainerId}`
    )[0];
    const addressInfo = document.createElement("section");
    addressInfo.innerHTML = `
      <h3>${addressDetail.name}</h3>
      <p>${addressDetail.full_address}</p>
      <p>Coordinates: [${addressDetail.coordinates.latitude}, ${addressDetail.coordinates.longitude}]</p>
      `;
    addressInfo.classList.add(`addressInfo-${mapboxContainerId}`);
    bottomLeftSection.appendChild(addressInfo);
  };
  const setMapLocation = (coordinates) => {
    if (marker) {
      marker.remove();
    }
    marker = new mapboxgl.Marker()
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(mapboxMap);
    mapboxMap.jumpTo({
      center: marker.getLngLat(),
      zoom: mapboxZoomLevel,
    });
  };
  const getAddressDetailByAddressId = async (mapboxId) => {
    const queryParams = {
      session_token: mapboxSessionToken,
      access_token: mapboxAccessToken,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const fullURL = `${API_URL}/retrieve/${mapboxId}?${queryString}`;
    const response = await fetch(fullURL);
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      window.alert(message);
    }
    const addressDetailData = await response.json();
    return addressDetailData.features.length
      ? addressDetailData.features[0]
      : null;
  };
  const updateMapboxWhenChangeAddressDetail = async (mapboxId) => {
    clearSuggestionsList();
    clearAddressDetailCard();
    const addressDetail = await getAddressDetailByAddressId(mapboxId);
    setSearchData(addressDetail.properties.name);
    renderAccessDetailCard(addressDetail.properties);
    setMapLocation(addressDetail.properties.coordinates);
  };
  const renderSuggestData = async (suggestions) => {
    suggestions.forEach((suggestion) => {
      const newSuggestionSection = document.createElement("section");
      newSuggestionSection.innerHTML = `<p>${suggestion.name}</p>`;
      newSuggestionSection.classList.add(
        `suggest-location-${mapboxContainerId}`
      );
      newSuggestionSection.addEventListener("click", () =>
        updateMapboxWhenChangeAddressDetail(suggestion.mapbox_id)
      );
      const element = document.getElementsByClassName(
        `suggest-locations-${mapboxContainerId}`
      );
      element[0].appendChild(newSuggestionSection);
    });
  };
  const getSuggestLocationFromMapboxAPI = async (address) => {
    const queryParams = {
      q: address,
      language: "en",
      session_token: mapboxSessionToken,
      access_token: mapboxAccessToken,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const fullURL = `${API_URL}/suggest?${queryString}`;
    const response = await fetch(fullURL);
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    } else {
      const data = await response.json();
      const suggestions = data.suggestions;
      renderSuggestData(suggestions);
    }
  };
  const handleSearchAddress = () => {
    const debounce = (mainFunction, delay) => {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          mainFunction(...args);
        }, delay);
      };
    };
    const debouncedGetSuggestionLocation = debounce(
      getSuggestLocationFromMapboxAPI,
      mapboxDebounceTime
    );
    const searchInput = document.getElementById(
      `searchString-${mapboxContainerId}`
    );
    searchInput.addEventListener("input", (event) => {
      clearSuggestionsList();
      if (
        /[a-zA-Z]/.test(event.target.value) ||
        /\d/.test(event.target.value)
      ) {
        debouncedGetSuggestionLocation(event.target.value);
      }
    });
  };
  const updateElementStyles = (element, styles) => {
    for (let key in styles) {
      element.style[key] = styles[key];
    }
  };
  const init = (
    containerId,
    accessToken,
    sessionToken,
    options = {
      defaultWidth: "1200px",
      defaultHeight: "600px",
      title: "Mapbox",
      defaultCenter: [108.339537475899, 14.3154241771087],
      defaultZoomLevel: 4,
      defaultDebounceTime: 1000,
    }
  ) => {
    mapboxContainerId = containerId;
    mapboxContainer = document.getElementById(containerId);
    mapboxAccessToken = accessToken;
    mapboxSessionToken = sessionToken;
    mapboxTitle = options.title;
    mapboxDebounceTime = options.defaultDebounceTime;
    mapboxZoomLevel = options.defaultZoomLevel;
    createMapboxContainer(options.defaultWidth, options.defaultHeight);
    mapboxMap = initMapbox(options.defaultCenter, mapboxZoomLevel);
    handleSearchAddress();
  };
  return {
    init,
    updateContainerStyles: (newStyles) => {
      updateElementStyles(mapboxContainer, newStyles);
    },
    title: {
      updateStyles: (styles) => {
        const topLeftSection = document.getElementsByClassName(
          `top-left-section-${mapboxContainerId}`
        )[0];
        const title = topLeftSection.getElementsByTagName("h1")[0];
        updateElementStyles(title, styles);
      },
      updateContent: (newContent) => {
        const topLeftSection = document.getElementsByClassName(
          `top-left-section-${mapboxContainerId}`
        )[0];
        topLeftSection.getElementsByTagName("h1")[0].innerHTML = newContent;
      },
    },
    input: {
      updateStyles: (styles) => {
        const input = document.getElementById(
          `searchString-${mapboxContainerId}`
        );
        updateElementStyles(input, styles);
      },
      updateDebounceTime: (newDebounceTime) => {
        if (newDebounceTime >= 0) {
          mapboxDebounceTime = newDebounceTime;
        }
      },
    },
    addressDetailCard: {
      updateCardStyles: (styles) => {
        const addressDetailCard = document.getElementsByClassName(
          `addressInfo-${mapboxContainerId}`
        );
        updateElementStyles(addressDetailCard, styles);
      },
      updateTitleStyles: (styles) => {
        const cardTitle = document.querySelector(
          `.addressInfo-${mapboxContainerId}`
        );
        console.log(cardTitle);
        updateElementStyles(cardTitle, styles);
      },
      updateContentStyles: (styles) => {},
    },
    map: {
      updateZoomLevel: (newZoomLevel) => {
        if (newZoomLevel > 0) {
          mapboxZoomLevel = newZoomLevel;
        }
      },
    },
  };
};

export default mapBox;
