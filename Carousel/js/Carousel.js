const carousel = () => {
  let container;
  let containerId;
  let data;
  let currentSlideIndex = 0;
  const readDataFromJSON = async (link) => {
    const response = await fetch(link);
    if (response.ok) {
      const jsonData = await response.json();
      return jsonData;
    } else {
      window.alert(`Cannot read file at ${link}`);
      return null;
    }
  };
  const plusSlides = (additionalNumber) => {
    showSlides((currentSlideIndex += additionalNumber));
  };
  const currentSlide = (slideIndex) => {
    currentSlideIndex = slideIndex;
    showSlides(currentSlideIndex);
  };
  const showSlides = (slideIndex) => {
    let slides = document.getElementsByClassName(`mySlides-${containerId}`);
    let dots = document.getElementsByClassName(`dot-${containerId}`);
    if (slideIndex > slides.length - 1) {
      currentSlideIndex = 0;
    }
    if (slideIndex < 0) {
      currentSlideIndex = slides.length - 1;
    }
    Array.from(slides).forEach((slide) => (slide.style.display = "none"));
    Array.from(dots).forEach((dot) => {
      dot.className = dot.className.replace("active", "");
    });
    slides[currentSlideIndex].style.display = "block";
    dots[currentSlideIndex].className += " active";
  };
  const createSlides = (carouselData = []) => {
    const createSlide = (slideRecord, index, slideRecordLength) => {
      const newSlide = document.createElement("section");
      newSlide.classList.add(`mySlides-${containerId}`, "fade");
      newSlide.innerHTML = `<section class="numbertext-${containerId}">${
        index + 1
      }/${slideRecordLength}</section>
      <img src=${slideRecord.src} style="width:100%; height:100%">
      <section class="text-${containerId}">${slideRecord.caption}</section>`;
      return newSlide;
    };
    const createNavigationButtons = (buttonList) => {
      const createButton = ({ classList, onClickHandler, innerData }) => {
        const button = document.createElement("button");
        button.classList.add(classList);
        button.onclick = onClickHandler;
        button.innerHTML = innerData;
        return button;
      };
      return buttonList.map((buttonData) => createButton(buttonData));
    };
    const slideshowContainer = document.createElement("section");
    slideshowContainer.classList.add(`slideshow-container-${containerId}`);
    carouselData.forEach((slideRecord, index) => {
      const newSlide = createSlide(slideRecord, index, data.length);
      slideshowContainer.appendChild(newSlide);
    });
    slideshowContainer.firstChild.classList.add("initial-slide");
    const navigationButtons = createNavigationButtons([
      {
        classList: "prev",
        onClickHandler: () => plusSlides(-1),
        innerData: "&#10094",
      },
      {
        classList: "next",
        onClickHandler: () => plusSlides(1),
        innerData: "&#10095",
      },
    ]);
    navigationButtons.forEach((buttonItem) => {
      slideshowContainer.appendChild(buttonItem);
    });
    return slideshowContainer;
  };
  const createDotList = (dataLength) => {
    const createDot = (onClickHandler) => {
      const dot = document.createElement("span");
      dot.onclick = onClickHandler;
      dot.classList.add(`dot-${containerId}`);
      return dot;
    };
    const dotContainer = document.createElement("section");
    dotContainer.style.textAlign = "center";
    dotContainer.style.marginTop = "10px";
    for (let index = 0; index < dataLength; index++) {
      const newDot = createDot(() => currentSlide(index));
      dotContainer.appendChild(newDot);
    }
    return dotContainer;
  };
  const updateStyles = (element, styles) => {
    for (let key in styles) {
      element.style[key] = styles[key];
    }
  };
  const updateContainerStyles = (containerStyles) => {
    updateStyles(container, containerStyles);
  };
  const updateCaptionStyles = (captionStyles) => {
    const captions = document.getElementsByClassName(`text-${containerId}`);
    Array.from(captions).forEach((caption) =>
      updateStyles(caption, captionStyles)
    );
  };
  const updateTopIndexNumberTextStyles = (topIndexNumberTextStyles) => {
    const topIndexNumberTexts = document.getElementsByClassName(
      `numbertext-${containerId}`
    );
    Array.from(topIndexNumberTexts).forEach((topIndexNumberText) =>
      updateStyles(topIndexNumberText, topIndexNumberTextStyles)
    );
  };
  const init = async (
    newContainerId = "",
    dataLink = "",
    { containerStyles, captionStyles, topIndexNumberTextStyles } = {}
  ) => {
    containerId = newContainerId;
    container = document.getElementById(containerId);
    data = await readDataFromJSON(dataLink);
    const slide = createSlides(data);
    const dot = createDotList(data.length);
    container.appendChild(slide);
    container.appendChild(dot);
    updateContainerStyles(containerStyles);
    updateCaptionStyles(captionStyles);
    updateTopIndexNumberTextStyles(topIndexNumberTextStyles);
  };
  return {
    init,
    updateStyles: (containerStyles) => updateContainerStyles(containerStyles),
    caption: {
      updateStyles: (captionStyles) => updateCaptionStyles(captionStyles),
    },
    topIndexNumber: {
      updateStyles: (topIndexNumberTextStyles) =>
        updateTopIndexNumberTextStyles(topIndexNumberTextStyles),
    },
  };
};

export default carousel;
