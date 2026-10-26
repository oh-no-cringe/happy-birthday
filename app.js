(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const content = window.BIRTHDAY_CONTENT;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const questions = [
    { kicker: 'начнём с очевидного', art: 'cake', title: 'У тебя сегодня день рождения?', description: 'Отвечай честно. Тут всё очень серьёзно.', answers: ['Да, мой день! 🎂', 'Я просто посмотреть'], wrong: 'Именинница обнаружена. Отпираться бесполезно 😌', success: 'Так и знала моя праздничная интуиция. С днём тебя ♡' },
    { kicker: 'самый важный вопрос', art: '♡', title: 'Ты меня любишь?', description: 'Моё сердце внимательно следит за ответом.', answers: ['Да, конечно ❤️', 'Нет'], wrong: 'Ответ неверный. Попробуй ещё раз, я в тебя верю 😏', success: 'Ну всё. Теперь я улыбаюсь как котеночек )' },
    { kicker: 'уточнение для моего сердца', art: '♡♡', title: 'А сильно?', description: 'Можно без скромности. Это же мы.', answers: ['О-о-очень', 'Сильнее, чем ты думаешь'], success: 'Так, я сейчас растаю… А я тебя ещё сильнее ❤️', bothCorrect: true },
    { kicker: 'праздничный план готов', art: 'bow', title: 'Готова быть самой любимой именинницей?', description: 'В программе: поздравления, нежность и обнимашки.', answers: ['Готова 🥰', 'А есть выбор?'], success: 'Отлично. Сегодня всё самое хорошее — для тебя ♡', alternate: 'Выбор у тебя всегда есть 😈', bothCorrect: true }
  ];
  let current = 0;
  let locked = false;
  let opening = false;
  let nextTimer;
  let celebrationTimer;

  function showScreen(id) {
    for (const screen of document.querySelectorAll('.screen')) screen.hidden = screen.id !== id;
    document.body.classList.toggle('is-letter', id === 'letter-screen');
    window.scrollTo({ top: 0, behavior: 'auto' });
    const heading = $(id).querySelector('h1,h2');
    if (heading) heading.focus({ preventScroll: true });
  }

  function celebrate() {
    if (reducedMotion) return;
    clearTimeout(celebrationTimer);
    $('confetti').replaceChildren();
    const colors = ['#7a263e', '#cda5a4', '#c4a26a', '#e6c7a8', '#a76879'];
    for (let i = 0; i < 42; i++) {
      const piece = document.createElement('i');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * .7}s`;
      piece.style.animationDuration = `${2.5 + Math.random()}s`;
      piece.style.borderRadius = i % 3 === 0 ? '50%' : '1px';
      $('confetti').append(piece);
    }
    celebrationTimer = setTimeout(() => $('confetti').replaceChildren(), 4300);
  }

  function renderQuestion() {
    const question = questions[current];
    locked = false;
    $('counter').textContent = `0${current + 1} / 0${questions.length}`;
    $('progress').replaceChildren();
    questions.forEach((_, index) => {
      const segment = document.createElement('span');
      segment.className = index <= current ? 'active' : '';
      $('progress').append(segment);
    });
    $('progress').setAttribute('aria-label', `Вопрос ${current + 1} из ${questions.length}`);
    $('question-kicker').textContent = question.kicker;
    $('question-title').textContent = question.title;
    $('question-description').textContent = question.description;
    const illustration = $('question-illustration');
    illustration.replaceChildren();
    if (['cake', 'bow'].includes(question.art)) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', question.art === 'cake' ? '#little-cake' : '#bow');
      svg.append(use);
      illustration.append(svg);
    } else illustration.textContent = question.art;
    $('feedback').textContent = '';
    $('answers').replaceChildren();
    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `button ${index === 0 ? 'primary' : 'secondary'}`;
      button.textContent = answer;
      button.addEventListener('click', () => answerQuestion(index));
      $('answers').append(button);
    });
    $('question-card').classList.remove('card-enter', 'shake');
    void $('question-card').offsetWidth;
    $('question-card').classList.add('card-enter');
    $('question-title').focus({ preventScroll: true });
  }

  function answerQuestion(index) {
    if (locked) return;
    const question = questions[current];
    if (index === 1 && !question.bothCorrect) {
      $('feedback').textContent = question.wrong;
      $('question-card').classList.remove('shake');
      void $('question-card').offsetWidth;
      $('question-card').classList.add('shake');
      return;
    }
    locked = true;
    $('feedback').textContent = index === 1 && question.alternate ? question.alternate : question.success;
    for (const button of $('answers').children) button.disabled = true;
    // Явная кнопка даёт время прочитать реакцию, без автоматического перелистывания.
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'button primary';
    next.textContent = current === questions.length - 1 ? 'А теперь загадай желание ✧' : 'Дальше →';
    next.addEventListener('click', () => {
      if (current < questions.length - 1) { current++; renderQuestion(); }
      else { showScreen('cake-screen'); celebrate(); }
    }, { once: true });
    $('answers').replaceChildren(next);
    next.focus({ preventScroll: true });
  }

  function start() {
    if (opening) return;
    opening = true;
    $('start').disabled = true;
    $('envelope').disabled = true;
    $('envelope').classList.add('is-open');
    nextTimer = setTimeout(() => { current = 0; renderQuestion(); showScreen('quiz'); }, reducedMotion ? 0 : 800);
  }
  $('start').addEventListener('click', start);
  $('envelope').addEventListener('click', start);

  $('blow').addEventListener('click', () => {
    $('blow').disabled = true;
    $('birthday-cake').classList.add('blown');
    $('birthday-cake').setAttribute('aria-label', 'Праздничный торт. Свечи погасли, желание загадано.');
    $('cake-title').replaceChildren(document.createTextNode('Пусть сбудется '));
    const emphasis = document.createElement('em');
    emphasis.textContent = 'всё.';
    $('cake-title').append(emphasis);
    $('cake-copy').textContent = 'И даже немножко больше, чем ты загадала ♡';
    $('cake-note').textContent = 'с днём рождения, моё счастье';
    $('blow').hidden = true;
    $('open-letter').hidden = false;
    $('open-letter').focus({ preventScroll: true });
    celebrate();
  });
  $('open-letter').addEventListener('click', () => { showScreen('letter-screen'); celebrate(); });

  $('recipient').textContent = content.recipient;
  $('signature').textContent = content.signature;
  for (const paragraph of content.paragraphs) {
    const p = document.createElement('p');
    p.textContent = paragraph;
    $('letter-body').append(p);
  }
  content.photos.slice(4, 6).forEach((_, offset) => {
    const frame = document.querySelector('.photo-one').cloneNode(true);
    frame.className = `polaroid photo-${offset === 0 ? 'five' : 'six'}`;
    frame.querySelector('.photo-window').dataset.photo = String(offset + 4);
    document.querySelector('.scrapbook').append(frame);
  });
  content.photos.forEach((photo, index) => {
    const container = document.querySelector(`[data-photo="${index}"]`);
    if (container && photo.caption) container.parentElement.querySelector('figcaption').textContent = photo.caption;
    if (!photo.src) return;
    if (container) {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.style.objectPosition = photo.position || '50% 50%';
      img.addEventListener('load', () => container.replaceChildren(img), { once: true });
      img.src = photo.src;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-photo';
    button.setAttribute('aria-label', `Открыть фото: ${photo.caption}`);
    const galleryImage = new Image();
    galleryImage.alt = photo.caption;
    galleryImage.loading = 'lazy';
    galleryImage.decoding = 'async';
    galleryImage.style.objectPosition = photo.position || '50% 50%';
    galleryImage.src = photo.src;
    const caption = document.createElement('span');
    caption.textContent = photo.caption;
    button.append(galleryImage, caption);
    button.addEventListener('click', () => {
      $('large-photo').src = photo.src;
      $('large-photo').alt = photo.caption;
      $('large-caption').textContent = photo.caption;
      $('photo-dialog').showModal();
    });
    $('memory-grid').append(button);
    $('memory-section').hidden = false;
  });
  $('close-photo').addEventListener('click', () => $('photo-dialog').close());
  $('photo-dialog').addEventListener('click', (event) => {
    if (event.target === $('photo-dialog')) $('photo-dialog').close();
  });

  $('replay').addEventListener('click', () => {
    clearTimeout(nextTimer);
    clearTimeout(celebrationTimer);
    $('confetti').replaceChildren();
    opening = false;
    locked = false;
    current = 0;
    $('start').disabled = false;
    $('envelope').disabled = false;
    $('envelope').classList.remove('is-open');
    $('birthday-cake').classList.remove('blown');
    $('birthday-cake').setAttribute('aria-label', 'Праздничный торт с тремя горящими свечами');
    $('cake-title').replaceChildren(document.createTextNode('Загадай '));
    const emphasis = document.createElement('em');
    emphasis.textContent = 'желание.';
    $('cake-title').append(emphasis);
    $('cake-copy').replaceChildren(document.createTextNode('Самое-самое заветное.'), document.createElement('br'), document.createTextNode('Никуда не торопись. Я подожду ♡'));
    $('cake-note').textContent = 'одно нажатие — и пусть всё сбудется';
    $('blow').hidden = false;
    $('blow').disabled = false;
    $('open-letter').hidden = true;
    showScreen('intro');
    $('start').focus({ preventScroll: true });
  });
})();
