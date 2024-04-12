import carousel from "./Carousel.js";

const main = async () => {
  const newCarousel = carousel();
  await newCarousel.init("container", "./data/data.json", {
    containerStyles: {
      width: "500px",
      height: "500px",
    },
  });
  newCarousel.updateStyles({
    width: "700px",
  });
  newCarousel.topIndexNumber.updateStyles({
    "background-color": "red",
  });
  newCarousel.caption.updateStyles({
    "font-size": "22px",
    fontFamily: "Arial, sans-serif",
  });
  const carousel2 = carousel();
  await carousel2.init("container2", "./data/data.json");
};

main();
