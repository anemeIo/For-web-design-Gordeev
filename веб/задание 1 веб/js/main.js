
    const section = document.querySelector('.section2');
    const cards = document.querySelectorAll('.card');
    
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.dots');
    let index = 0;

    // Создаём точки
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function goToSlide(i) {
      index = i;
      slider.style.transform = `translateX(-${100 * i}%)`;
      dots.forEach(dot => dot.classList.remove('active'));
      dots[i].classList.add('active');
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      goToSlide(index);
    }

    setInterval(nextSlide, 4000); // смена каждые 4 сек
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (!card.classList.contains('active')) {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          section.classList.add('hide-others');
        }
      });

      const backBtn = card.querySelector('.back-btn');
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('active');
        section.classList.remove('hide-others');
      });
    });
