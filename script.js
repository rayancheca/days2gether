document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURATION ---
  const startDate = new Date("2024-05-06T00:00:00"); // Ensure this is correct
  const NUM_FLOATING_HEARTS = 50; // Increased quantity
  const ANNIVERSARY_DURATION_MS = 3600000; // 1 hour
  const PERIODIC_BURST_INTERVAL_MS = 250; // 10 minutes

  // --- State Variables ---
  let anniversaryYearCelebrated = 0;
  let anniversaryTimeoutId = null;
  let periodicBurstIntervalId = null;

  // DOM Element References
  const elements = {
    years: document.getElementById("years"),
    months: document.getElementById("months"),
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    timerSection: document.getElementById("timer-section"),
    bunny1: document.getElementById("bunny1"),
    bunny2: document.getElementById("bunny2"),
    bird: document.getElementById("bird"),
    cat: document.getElementById("cat"),
    secretTrigger: document.getElementById("secret-trigger"),
    musicButton: document.getElementById("music-button"),
    hiddenMessageOverlay: document.getElementById("hidden-message-overlay"),
    closeMessageButton: document.getElementById("close-message-button"),
    floatingContainer: document.querySelector(".floating-elements"),
    animals: null, // Will be populated by GSAP
  };

  // --- SOUND INITIALIZATION (Howler.js) ---
  let sounds = {};
  let ambientSoundId = null;
  let musicSoundId = null;
  let isMusicPlaying = false;
  if (typeof Howl !== "undefined") {
    try {
      sounds.ambient = new Howl({
        src: ["sounds/ambient.mp3", "sounds/ambient.ogg"],
        loop: true,
        volume: 0.1,
        html5: true,
      });
      sounds.chirp = new Howl({ src: ["sounds/chirp.wav"], volume: 0.5 });
      sounds.purr = new Howl({ src: ["sounds/purr.wav"], volume: 0.6 });
      sounds.click = new Howl({ src: ["sounds/click.wav"], volume: 0.4 });
      sounds.secret = new Howl({ src: ["sounds/secret.wav"], volume: 0.7 });
      sounds.loveSong = new Howl({
        src: ["sounds/love_song.mp3", "sounds/love_song.ogg"],
        volume: 0.8,
        loop: false,
        onend: function () {
          isMusicPlaying = false;
          elements.musicButton.textContent = "🎵";
        },
      });
      document.body.addEventListener("click", playAmbientSoundOnce, {
        once: true,
      });
      document.body.addEventListener("touchstart", playAmbientSoundOnce, {
        once: true,
      });
    } catch (error) {
      console.error("Error initializing Howler sounds.", error);
      sounds = {
        ambient: null,
        chirp: null,
        purr: null,
        click: null,
        secret: null,
        loveSong: null,
      };
    }
  } else {
    console.warn("Howler.js not loaded.");
    sounds = {
      ambient: null,
      chirp: null,
      purr: null,
      click: null,
      secret: null,
      loveSong: null,
    };
  }
  function playAmbientSoundOnce() {
    if (
      sounds.ambient &&
      typeof sounds.ambient.play === "function" &&
      !ambientSoundId &&
      !sounds.ambient.playing(ambientSoundId)
    ) {
      ambientSoundId = sounds.ambient.play();
      if (
        ambientSoundId !== null &&
        typeof sounds.ambient.fade === "function"
      ) {
        sounds.ambient.fade(0, 0.1, 2000, ambientSoundId);
        console.log("Attempting to play ambient sound.");
      } else {
        console.log("Could not play ambient sound or Howl instance invalid.");
      }
    }
    document.body.removeEventListener("click", playAmbientSoundOnce);
    document.body.removeEventListener("touchstart", playAmbientSoundOnce);
  }

  // --- TIMER CALCULATION & UPDATE ---
  function updateTimer() {
    const now = new Date();
    let diff = now - startDate;
    if (diff < 0) {
      diff = 0;
    }
    let cy = now.getFullYear();
    let cm = now.getMonth();
    let cd = now.getDate();
    let ch = now.getHours();
    let cmin = now.getMinutes();
    let cs = now.getSeconds();
    let sy = startDate.getFullYear();
    let sm = startDate.getMonth();
    let sd = startDate.getDate();
    let sh = startDate.getHours();
    let smin = startDate.getMinutes();
    let ss = startDate.getSeconds();
    let yd = cy - sy;
    let md = cm - sm;
    if (md < 0) {
      yd--;
      md += 12;
    }
    let dd = cd - sd;
    if (dd < 0) {
      md--;
      let dlm = new Date(cy, cm, 0).getDate();
      dd += dlm;
      if (md < 0) {
        yd--;
        md += 12;
      }
    }
    let hd = ch - sh;
    if (hd < 0) {
      dd--;
      hd += 24;
      if (dd < 0) {
        md--;
        let dlm = new Date(cy, cm, 0).getDate();
        dd += dlm;
        if (md < 0) {
          yd--;
          md += 12;
        }
      }
    }
    let mind = cmin - smin;
    if (mind < 0) {
      hd--;
      mind += 60;
      if (hd < 0) {
        dd--;
        hd += 24;
        if (dd < 0) {
          md--;
          let dlm = new Date(cy, cm, 0).getDate();
          dd += dlm;
          if (md < 0) {
            yd--;
            md += 12;
          }
        }
      }
    }
    let secd = cs - ss;
    if (secd < 0) {
      mind--;
      secd += 60;
      if (mind < 0) {
        hd--;
        mind += 60;
        if (hd < 0) {
          dd--;
          hd += 24;
          if (dd < 0) {
            md--;
            let dlm = new Date(cy, cm, 0).getDate();
            dd += dlm;
            if (md < 0) {
              yd--;
              md += 12;
            }
          }
        }
      }
    }
    // Update DOM
    if (elements.years) elements.years.textContent = yd >= 0 ? yd : 0;
    if (elements.months) elements.months.textContent = md >= 0 ? md : 0;
    if (elements.days) elements.days.textContent = dd >= 0 ? dd : 0;
    if (elements.hours)
      elements.hours.textContent = String(hd >= 0 ? hd : 0).padStart(2, "0");
    if (elements.minutes)
      elements.minutes.textContent = String(mind >= 0 ? mind : 0).padStart(
        2,
        "0"
      );
    if (elements.seconds)
      elements.seconds.textContent = String(secd >= 0 ? secd : 0).padStart(
        2,
        "0"
      );
    // Anniversary Check
    if (yd >= 1 && anniversaryYearCelebrated < yd) {
      anniversaryYearCelebrated = yd;
      startAnniversaryCelebration(yd);
    }
  }

  // --- Anniversary Celebration Functions ---
  function startAnniversaryCelebration(yearNumber) {
    console.log(`Starting Anniversary Celebration for Year ${yearNumber}!`);
    createAnniversaryConfetti();
    document.body.classList.add("anniversary-active");
    clearTimeout(anniversaryTimeoutId);
    clearInterval(periodicBurstIntervalId);
    anniversaryTimeoutId = setTimeout(() => {
      console.log(`Anniversary hour for Year ${yearNumber} ended.`);
      document.body.classList.remove("anniversary-active");
      clearInterval(periodicBurstIntervalId);
    }, ANNIVERSARY_DURATION_MS);
    setTimeout(() => {
      createPeriodicBurst();
      periodicBurstIntervalId = setInterval(
        createPeriodicBurst,
        PERIODIC_BURST_INTERVAL_MS
      );
    }, 2000);
  }
  function createAnniversaryConfetti() {
    console.log("ANNIVERSARY BURST!");
    const count = 100;
    const symbols = ["💖", "🎉", "⭐", "❤️", "✨"];
    const colors = [
      "#FADADD",
      "#F7DC6F",
      "#D6EAF8",
      "#E8DAEF",
      "#FFD700",
      "#FFFFFF",
    ];
    if (typeof anime === "undefined") {
      return;
    }
    const rect = document.body.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
      confetti.style.fontSize = `${Math.random() * 15 + 10}px`;
      confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
      const startX = rect.width / 2;
      const startY = rect.height / 2;
      document.body.appendChild(confetti);
      anime({
        targets: confetti,
        translateX: [0, anime.random(-rect.width / 1.5, rect.width / 1.5)],
        translateY: [0, anime.random(-rect.height / 1.5, rect.height / 1.5)],
        scale: [1, anime.random(0.5, 1)],
        opacity: [1, 0],
        rotate: anime.random(-540, 540),
        easing: "easeOutExpo",
        duration: anime.random(1500, 2500),
        begin: function (anim) {
          anim.animatables[0].target.style.position = "absolute";
          anim.animatables[0].target.style.left = `${startX}px`;
          anim.animatables[0].target.style.top = `${startY}px`;
          anim.animatables[0].target.style.opacity = 1;
          anim.animatables[0].target.style.zIndex = 101;
        },
        complete: function (anim) {
          anim.animatables[0].target.remove();
        },
      });
    }
  }
  function createPeriodicBurst() {
    console.log("Periodic Anniversary Burst!");
    const count = 15;
    const symbols = ["✨", "⭐", "💖"];
    const colors = ["#FADADD", "#F7DC6F", "#E8DAEF"];
    if (typeof anime === "undefined") {
      return;
    }
    const rect = document.body.getBoundingClientRect();
    const startX = rect.width / 2;
    const startY = 50;
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
      confetti.style.fontSize = `${Math.random() * 8 + 6}px`;
      confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(confetti);
      anime({
        targets: confetti,
        translateX: [0, anime.random(-rect.width / 2, rect.width / 2)],
        translateY: [0, anime.random(rect.height / 3, rect.height / 1.5)],
        scale: [1, 0.5],
        opacity: [1, 0],
        rotate: anime.random(-360, 360),
        easing: "easeOutSine",
        duration: anime.random(2000, 3500),
        begin: function (anim) {
          anim.animatables[0].target.style.position = "absolute";
          anim.animatables[0].target.style.left = `${startX}px`;
          anim.animatables[0].target.style.top = `${startY}px`;
          anim.animatables[0].target.style.opacity = 1;
          anim.animatables[0].target.style.zIndex = 101;
        },
        complete: function (anim) {
          anim.animatables[0].target.remove();
        },
      });
    }
  }

  // --- ANIMATIONS (GSAP & anime.js) ---
  if (typeof gsap !== "undefined" && typeof gsap.utils !== "undefined") {
    elements.animals = gsap.utils.toArray(".animal");
    // Random Jump Animation Function
    function randomJump(element) {
      if (!element) return;
      gsap.to(element, {
        y: "-=20px",
        duration: 0.3,
        ease: "power1.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.delayedCall(gsap.utils.random(1.5, 5, true), randomJump, [
            element,
          ]);
        },
      });
    }
    // Apply to all animals
    if (elements.animals && elements.animals.length > 0) {
      elements.animals.forEach((animal) => {
        gsap.delayedCall(gsap.utils.random(0, 1.5, true), randomJump, [animal]);
      });
    } else {
      console.warn(
        "No elements with class '.animal' found for jumping animation."
      );
    }
  } else {
    console.warn("GSAP not loaded. Animations will be disabled.");
  }

  // --- Create Multiple Floating Hearts ---
  function createFloatingHearts(container, count) {
    if (!container) {
      console.warn("Floating container not found for hearts!");
      return;
    }
    const heartTypes = ["❤️", "✨", "🌸", "💖", "⭐"];
    const colors = [
      "rgba(250, 218, 221, 0.6)",
      "rgba(247, 220, 111, 0.5)",
      "rgba(232, 218, 239, 0.6)",
      "rgba(214, 234, 248, 0.5)",
    ];
    let actualCount = count;
    if (window.innerWidth < 480) {
      actualCount = Math.floor(count / 1.5);
    }
    for (let i = 0; i < actualCount; i++) {
      const heart = document.createElement("div");
      heart.classList.add("floating-heart");
      heart.innerHTML =
        heartTypes[Math.floor(Math.random() * heartTypes.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${Math.random() * 1 + 0.8}rem`;
      heart.style.color = colors[Math.floor(Math.random() * colors.length)];
      heart.style.animationDuration = `${Math.random() * 6 + 8}s`;
      heart.style.animationDelay = `${Math.random() * 8}s`;
      heart.style.opacity = `${Math.random() * 0.4 + 0.3}`;
      container.appendChild(heart);
    }
  }
  createFloatingHearts(elements.floatingContainer, NUM_FLOATING_HEARTS);

  // --- Timer Click Confetti Effect (anime.js) ---
  function createConfetti(event) {
    if (typeof anime === "undefined") {
      console.warn("anime.js not loaded. Confetti effect disabled.");
      return;
    }
    if (sounds.click) sounds.click.play();
    const rect = elements.timerSection.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      const colors = ["#FADADD", "#F7DC6F", "#D6EAF8", "#E8DAEF", "#FFF8E7"];
      const symbols = ["❤️", "✨", "🌸", "⭐"];
      confetti.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
      confetti.style.fontSize = `${Math.random() * 12 + 8}px`;
      confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
      elements.timerSection.appendChild(confetti);
      anime({
        targets: confetti,
        translateX: [0, anime.random(-100, 100)],
        translateY: [0, anime.random(-120, 50)],
        scale: [1, anime.random(0.3, 0.8)],
        opacity: [1, 0],
        rotate: anime.random(-360, 360),
        easing: "easeOutExpo",
        duration: anime.random(800, 1500),
        begin: function (anim) {
          anim.animatables[0].target.style.left = `${clickX}px`;
          anim.animatables[0].target.style.top = `${clickY}px`;
          anim.animatables[0].target.style.opacity = 1;
        },
        complete: function (anim) {
          anim.animatables[0].target.remove();
        },
      });
    }
  }

  // --- EVENT LISTENERS ---
  if (startDate && !isNaN(startDate)) {
    updateTimer();
    setInterval(updateTimer, 1000);
  } else {
    console.error("Invalid Start Date!");
  }
  if (elements.timerSection) {
    elements.timerSection.addEventListener("click", createConfetti);
  }
  if (
    elements.secretTrigger &&
    elements.hiddenMessageOverlay &&
    elements.closeMessageButton
  ) {
    elements.secretTrigger.addEventListener("click", () => {
      if (sounds.secret) sounds.secret.play();
      elements.hiddenMessageOverlay.style.display = "block";
      if (typeof anime !== "undefined")
        anime({
          targets: elements.hiddenMessageOverlay,
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutQuad",
        });
      elements.hiddenMessageOverlay.setAttribute("aria-hidden", "false");
      elements.closeMessageButton.focus();
    });
    elements.closeMessageButton.addEventListener("click", () => {
      if (typeof anime !== "undefined") {
        anime({
          targets: elements.hiddenMessageOverlay,
          opacity: [1, 0],
          duration: 300,
          easing: "easeInQuad",
          complete: () => {
            elements.hiddenMessageOverlay.style.display = "none";
            elements.hiddenMessageOverlay.setAttribute("aria-hidden", "true");
          },
        });
      } else {
        elements.hiddenMessageOverlay.style.display = "none";
        elements.hiddenMessageOverlay.setAttribute("aria-hidden", "true");
      }
    });
    elements.hiddenMessageOverlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        elements.closeMessageButton.click();
      }
    });
  }
  if (elements.musicButton && sounds.loveSong) {
    elements.musicButton.addEventListener("click", () => {
      if (!isMusicPlaying) {
        if (sounds.loveSong.state() === "loaded")
          musicSoundId = sounds.loveSong.play();
        isMusicPlaying = true;
        elements.musicButton.textContent = "⏸️";
      } else {
        sounds.loveSong.pause(musicSoundId);
        isMusicPlaying = false;
        elements.musicButton.textContent = "🎵";
      }
    });
  }

  // --- INITIALIZATION ---
  console.log(
    "Romantic Timer Initialized! (Random Jump + CSS Garden + Anniversary)"
  );
}); // End DOMContentLoaded
