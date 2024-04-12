let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

function createSlides(data) {
  // Get containers
  const container = document.getElementById("slideshow-container");
  // Get dotlist
  const dotlist = document.getElementById("dotlist");
  // Create slides
  for (let index = data.length - 1; index >= 0; index--) {
    // Add slide
    const slideNode = document.createElement("div");
    slideNode.setAttribute("class", "mySlides fade");
    if (index === 0) {
      slideNode.classList.add("initial-slide");
    }
    slideNode.innerHTML = `
    <div class="numbertext">${index + 1}/${data.length}</div>
    <img src=${data[index].src} style="width:100%">
    <div class="text">${data[index].caption}</div>
    `;
    container.prepend(slideNode);
    // Add dot
    const newDot = document.createElement("span");
    newDot.classList.add("dot");
    newDot.addEventListener("click", () => {
      currentSlide(index + 1);
    });
    dotlist.prepend(newDot);
  }
  // Show initial slide
  const initialSlide = document.getElementsByClassName("initial-slide");
  initialSlide[0].style.display = "block";
}

const main = () => {
  const data = [
    {
      src: "./assets/img1.jpeg",
      caption: "Caption 1",
    },
    {
      src: "./assets/img2.jpeg",
      caption: "Caption 2",
    },
    {
      src: "./assets/img3.jpeg",
      caption: "Caption 3",
    },
    {
      src: "./assets/img1.jpeg",
      caption: "Caption 1",
    },
    {
      src: "./assets/img2.jpeg",
      caption: "Caption 2",
    },
    {
      src: "./assets/img3.jpeg",
      caption: "Caption 3",
    },
  ];
  window.onload = () => {
    createSlides(data);
    showSlides(slideIndex);
  };
};

// ata

main();
