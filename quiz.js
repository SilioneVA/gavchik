/**
 * Гав-Чик Quiz Logic
 * 
 * Integration points:
 * - TELEGRAM_WEBHOOK: замените на ваш Telegram bot webhook URL
 * - GOOGLE_SHEETS_WEBHOOK: замените на ваш Google Apps Script webhook URL
 *
 * Настройка Google Sheets:
 * 1. Создайте Google Таблицу
 * 2. В меню Расширения → Apps Script создайте скрипт с doPost функцией
 * 3. Разверните как веб-приложение и скопируйте URL в GOOGLE_SHEETS_WEBHOOK
 *
 * Настройка Telegram:
 * 1. Создайте бота через @BotFather
 * 2. Настройте webhook: https://api.telegram.org/bot<TOKEN>/setWebhook
 * 3. Или используйте готовый сервис типа make.com / n8n
 */

// ============================================================
// CONFIGURATION — замените на ваши реальные значения
// ============================================================
const CONFIG = {
  // Telegram Bot webhook (через n8n, make.com, или прямой API)
  TELEGRAM_WEBHOOK: 'https://YOUR_N8N_OR_MAKE_WEBHOOK_URL/telegram',
  
  // Google Sheets webhook (Google Apps Script web app URL)
  GOOGLE_SHEETS_WEBHOOK: 'https://script.google.com/macros/s/AKfycbyjN02CnDiDHR8SBrsm8nYuiXAQHscWr9JTjr1CNE21T368EdyU2n5oKSIAg8Fkdo-p/exec',
  
  // Telegram chat ID куда слать уведомления (ваш личный или группа)
  TELEGRAM_CHAT_ID: '@gavchik_gatchina',
  
  // Включить отправку (false = только лог в консоль для тестирования)
  ENABLED: true
};

// ============================================================
// QUIZ DATA
// ============================================================
const quizAnswers = {
  1: null, // порода
  2: null, // размер
  3: null, // шерсть
  4: null  // результат
};

const stepLabels = {
  1: 'Порода',
  2: 'Размер',
  3: 'Шерсть',
  4: 'Цель'
};

// ============================================================
// RESULT ENGINE — определение услуги по ответам
// ============================================================
function calculateResult(answers) {
  const coat    = answers[1]; // longhair | curly | shorthair | wire | mixed
  const size    = answers[2]; // tiny | small | medium | large
  const cond    = answers[3]; // great | normal | tangled | shedding
  const goal    = answers[4]; // full_groom | bath_only | hygiene | spa

  // СПА-программа
  if (goal === 'spa') {
    return {
      title: 'СПА-программа',
      desc: 'Максимальный уход для вашего питомца',
      icon: '🌸',
      service: 'СПА-программа «Люкс»',
      includes: [
        'Купание с увлажняющей маской',
        'Ароматерапия и кондиционирование',
        'Профессиональная стрижка',
        'Укладка и финишный спрей',
        'Все гигиенические процедуры'
      ]
    };
  }

  // Только гигиена
  if (goal === 'hygiene') {
    return {
      title: 'Гигиенический груминг',
      desc: 'Необходимый минимум для здоровья и комфорта',
      icon: '💅',
      service: 'Гигиенический пакет',
      includes: [
        'Стрижка когтей',
        'Чистка ушей',
        'Подрезка шерсти между подушечками',
        'Чистка анальных желёз (по необходимости)'
      ]
    };
  }

  // Только купание
  if (goal === 'bath_only') {
    if (cond === 'tangled') {
      return {
        title: 'Купание + Расколтунивание',
        desc: 'Сначала распутаем, потом помоем',
        icon: '🛁',
        service: 'Купание + работа с колтунами',
        includes: [
          'Профессиональное расколтунивание',
          'Купание со смягчающей шампунью',
          'Сушка феном и расчёсывание',
          'Консультация по домашнему уходу'
        ]
      };
    }
    if (cond === 'shedding') {
      return {
        title: 'Купание + Десхеддинг',
        desc: 'Избавим от подшёрстка и лишней шерсти',
        icon: '🌀',
        service: 'Купание + десхеддинг',
        includes: [
          'Купание с шампунью против линьки',
          'Профессиональное вычёсывание подшёрстка',
          'Сушка феном с продувкой',
          'Финальное расчёсывание'
        ]
      };
    }
    return {
      title: 'Купание и уход',
      desc: 'Свежесть и блеск шерсти',
      icon: '🛁',
      service: 'Купание + сушка',
      includes: [
        'Купание с профессиональной шампунью',
        'Нанесение кондиционера',
        'Сушка феном и расчёсывание',
        'Лёгкая тримминг (по запросу)'
      ]
    };
  }

  // Full groom — основная логика
  if (cond === 'tangled') {
    return {
      title: 'Полный груминг + Колтуны',
      desc: 'Деликатная работа с запущенной шерстью',
      icon: '✂️',
      service: 'Груминг с расколтуниванием',
      includes: [
        'Деликатное расколтунивание',
        'Купание со смягчающими средствами',
        'Стрижка с учётом состояния шерсти',
        'Все гигиенические процедуры',
        'Консультация по домашнему уходу'
      ]
    };
  }

  if (coat === 'shorthair' || coat === 'wire') {
    if (size === 'large') {
      return {
        title: 'Груминг для крупной собаки',
        desc: 'Полный уход для крупных пород',
        icon: '🦮',
        service: 'Полный груминг — XL',
        includes: [
          'Купание в большой ванне',
          'Профессиональная сушка',
          'Тримминг / обработка шерсти',
          'Гигиенические процедуры',
          'Расчёсывание и укладка'
        ]
      };
    }
    return {
      title: 'Базовый груминг',
      desc: 'Купание, уход и гигиена',
      icon: '✨',
      service: 'Базовый груминг',
      includes: [
        'Купание с профессиональной шампунью',
        'Сушка и расчёсывание',
        'Гигиенические процедуры',
        'Лёгкий тримминг (по желанию)'
      ]
    };
  }

  if (coat === 'curly' || coat === 'longhair') {
    return {
      title: 'Полный груминг — Стандарт',
      desc: 'Стрижка по стандарту породы + полный уход',
      icon: '✂️',
      service: 'Полный груминг',
      includes: [
        'Купание с профессиональной шампунью',
        'Сушка феном и расчёсывание',
        'Стрижка по стандарту породы',
        'Все гигиенические процедуры',
        'Укладка и финишный спрей'
      ]
    };
  }

  // Метис / по умолчанию
  return {
    title: 'Комплексный груминг',
    desc: 'Мастер подберёт оптимальный уход',
    icon: '🐾',
    service: 'Комплексный груминг (подбор мастера)',
    includes: [
      'Консультация мастера перед процедурой',
      'Купание с подбором шампуня',
      'Стрижка или тримминг по состоянию',
      'Гигиенические процедуры',
      'Рекомендации по домашнему уходу'
    ]
  };
}

// ============================================================
// SEND DATA FUNCTIONS
// ============================================================
async function sendToTelegram(data) {
  const message = `
🐾 *Новая заявка из квиза — Гав-Чик*

👤 Хозяин: *${data.ownerName}*
🐕 Питомец: *${data.petName}*
📞 Контакт: \`${data.phone}\`
⏰ Удобное время: *${data.preferredTime || 'не указано'}*

📋 *Квиз:*
• Порода: ${data.quiz.breed}
• Размер: ${data.quiz.size}
• Шерсть: ${data.quiz.coat}
• Цель: ${data.quiz.goal}

🎯 *Рекомендованная услуга:*
${data.result}

⏱ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
`;

  if (!CONFIG.ENABLED) {
    console.log('[Telegram] Данные для отправки:', message);
    return { ok: true };
  }

  try {
    const res = await fetch(CONFIG.TELEGRAM_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CONFIG.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    return res.json();
  } catch (e) {
    console.error('[Telegram] Ошибка:', e);
    return null;
  }
}

async function sendToGoogleSheets(data) {
  const payload = {
    timestamp: new Date().toISOString(),
    ownerName: data.ownerName,
    petName: data.petName,
    phone: data.phone,
    preferredTime: data.preferredTime || '',
    breed: data.quiz.breed,
    size: data.quiz.size,
    coat: data.quiz.coat,
    goal: data.quiz.goal,
    result: data.result,
    source: 'quiz-landing'
  };

  if (!CONFIG.ENABLED) {
    console.log('[Google Sheets] Данные для записи:', payload);
    return { success: true };
  }

  return new Promise((resolve) => {
    try {
      // Используем скрытый iframe + форма — единственный надёжный способ отправить
      // данные в Google Apps Script без CORS-ошибок. Fetch с no-cors теряет параметры
      // при редиректе с script.google.com → script.googleusercontent.com.
      const iframeId = 'gs-submit-frame-' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeId;
      iframe.id = iframeId;
      iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;left:-9999px';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = CONFIG.GOOGLE_SHEETS_WEBHOOK;
      form.target = iframeId;
      form.style.cssText = 'display:none;';

      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up after a short delay
      setTimeout(() => {
        try { document.body.removeChild(form); } catch(e) {}
        try { document.body.removeChild(iframe); } catch(e) {}
      }, 5000);

      resolve({ success: true });
    } catch (e) {
      console.error('[Google Sheets] Ошибка:', e);
      resolve(null);
    }
  });
}


}

// ============================================================
// QUIZ STATE & DOM
// ============================================================
let currentStep = 0; // 0 = hero, 1-4 = steps, 5 = result

const heroSection   = document.querySelector('.hero');
const quizSection   = document.getElementById('quiz-section');
const quizProgress  = document.getElementById('quiz-progress');
const progressFill  = document.getElementById('progress-fill');
const progressText  = document.getElementById('progress-text');
const btnBack       = document.getElementById('btn-back');

function showStep(step) {
  // Hide all steps and result
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`step-${i}`).hidden = true;
  }
  document.getElementById('quiz-result').hidden = true;

  if (step >= 1 && step <= 4) {
    document.getElementById(`step-${step}`).hidden = false;
    quizProgress.hidden = false;
    progressFill.style.width = `${(step / 4) * 100}%`;
    progressText.textContent = `Шаг ${step} из 4`;
    btnBack.style.display = step === 1 ? 'none' : 'flex';
    
    // Scroll to quiz
    quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    currentStep = step;
  } else if (step === 5) {
    showResult();
  }
}

function startQuiz() {
  heroSection.style.display = 'none';
  showStep(1);
}

function goBack() {
  if (currentStep > 1) {
    quizAnswers[currentStep] = null;
    showStep(currentStep - 1);
  }
}

function showResult() {
  quizProgress.hidden = true;
  document.getElementById('quiz-result').hidden = false;
  currentStep = 5;

  const result = calculateResult(quizAnswers);

  // Populate result UI
  document.getElementById('result-title').textContent = result.title;
  document.getElementById('result-desc').textContent  = result.desc;
  document.getElementById('result-icon').textContent  = result.icon;
  document.getElementById('result-service').textContent = result.service;

  const includesList = document.getElementById('result-includes');
  includesList.innerHTML = result.includes
    .map(item => `<li>${item}</li>`)
    .join('');

  // Summary chips
  const chips = document.getElementById('summary-chips');
  chips.innerHTML = Object.entries(quizAnswers)
    .filter(([k, v]) => v !== null)
    .map(([step, val]) => {
      const btn = document.querySelector(`[data-step="${step}"][data-value="${val}"]`);
      const label = btn ? btn.dataset.label : val;
      return `<span class="summary-chip">${stepLabels[step]}: ${label}</span>`;
    })
    .join('');

  quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Start quiz button
document.getElementById('start-quiz').addEventListener('click', startQuiz);

// Back button
btnBack.addEventListener('click', goBack);

// Option cards
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    const step = parseInt(card.dataset.step);
    const value = card.dataset.value;
    
    quizAnswers[step] = value;
    
    // Visual feedback
    card.classList.add('selected');
    setTimeout(() => card.classList.remove('selected'), 200);
    
    // Auto-advance after brief pause
    setTimeout(() => {
      if (step < 4) {
        showStep(step + 1);
      } else {
        showStep(5);
      }
    }, 320);
  });
});

// Lead form submission
document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn  = document.getElementById('form-submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitLoad = document.getElementById('submit-loading');
  
  // Validate
  let hasError = false;
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      hasError = true;
    }
  });
  
  if (hasError) {
    const firstError = form.querySelector('.error');
    firstError?.focus();
    return;
  }
  
  // Loading state
  submitBtn.disabled = true;
  submitText.hidden = true;
  submitLoad.hidden = false;
  
  const result = calculateResult(quizAnswers);
  const formData = {
    ownerName:     form.querySelector('#owner-name').value.trim(),
    petName:       form.querySelector('#pet-name').value.trim(),
    phone:         form.querySelector('#phone').value.trim(),
    preferredTime: form.querySelector('#preferred-time').value,
    quiz: {
      breed: getAnswerLabel(1),
      size:  getAnswerLabel(2),
      coat:  getAnswerLabel(3),
      goal:  getAnswerLabel(4)
    },
    result: result.service
  };
  
  // Send to both integrations in parallel
  await Promise.allSettled([
    sendToTelegram(formData),
    sendToGoogleSheets(formData)
  ]);
  
  // Show success — hide form, reveal success block
  form.style.display = 'none';
  const successEl = document.getElementById('form-success');
  successEl.style.display = 'flex';
});

function getAnswerLabel(step) {
  const val = quizAnswers[step];
  if (!val) return '—';
  const btn = document.querySelector(`[data-step="${step}"][data-value="${val}"]`);
  return btn ? btn.dataset.label : val;
}

// Retake quiz
document.getElementById('retake-quiz').addEventListener('click', () => {
  Object.keys(quizAnswers).forEach(k => quizAnswers[k] = null);
  const leadForm = document.getElementById('lead-form');
  leadForm.style.display = '';
  const successEl2 = document.getElementById('form-success');
  successEl2.style.display = 'none';
  // Reset form fields
  leadForm.reset();
  const submitBtn  = document.getElementById('form-submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitLoad = document.getElementById('submit-loading');
  submitBtn.disabled = false;
  submitText.hidden = false;
  submitLoad.hidden = true;
  
  heroSection.style.display = '';
  document.getElementById('quiz-result').hidden = true;
  quizProgress.hidden = true;
  for (let i = 1; i <= 4; i++) document.getElementById(`step-${i}`).hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  currentStep = 0;
});

// Waitlist forms
document.querySelectorAll('.waitlist-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type  = form.dataset.type;
    const input = form.querySelector('.waitlist-input');
    const btn   = form.querySelector('.btn-waitlist');
    
    if (!input.value.trim()) { input.focus(); return; }
    
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    
    await sendWaitlistEntry(type, input.value.trim());
    
    // Success message
    const row = form.querySelector('.waitlist-input-row');
    row.style.display = 'none';
    let msg = form.querySelector('.waitlist-success-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'waitlist-success-msg';
      form.appendChild(msg);
    }
    msg.textContent = '✅ Записали вас в лист ожидания!';
    msg.style.display = 'block';
  });
});

// Theme toggle
(function() {
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);
  
  const sunIcon  = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moonIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  
  if (t) {
    t.innerHTML = d === 'dark' ? sunIcon : moonIcon;
    t.addEventListener('click', () => {
      d = d === 'dark' ? 'light' : 'dark';
      r.setAttribute('data-theme', d);
      t.innerHTML = d === 'dark' ? sunIcon : moonIcon;
      t.setAttribute('aria-label', 'Переключить на ' + (d === 'dark' ? 'светлую' : 'тёмную') + ' тему');
    });
  }
})();

// Scroll fade animations — with fallback for browsers/bots without scroll
(function() {
  const els = document.querySelectorAll('.review-card, .upcoming-card');
  
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('fade-up', 'visible'));
    return;
  }
  
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );
  
  els.forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });

  // Fallback: if elements remain invisible after 2s (e.g., very short pages), show them
  setTimeout(() => {
    els.forEach(el => { if (!el.classList.contains('visible')) el.classList.add('visible'); });
  }, 1500);
})();

// Phone input mask (simple)
document.getElementById('phone').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '');
  if (v.startsWith('8')) v = '7' + v.slice(1);
  if (v.startsWith('7') && v.length > 1) {
    let formatted = '+7';
    if (v.length > 1) formatted += ' (' + v.slice(1, 4);
    if (v.length >= 4) formatted += ') ' + v.slice(4, 7);
    if (v.length >= 7) formatted += '-' + v.slice(7, 9);
    if (v.length >= 9) formatted += '-' + v.slice(9, 11);
    this.value = formatted;
  }
});
