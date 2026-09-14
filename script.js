document.addEventListener("DOMContentLoaded", () => {

  const selectedInterests = new Set();

  const interestCards = document.querySelectorAll(".interest-card");
  const selectedCount = document.getElementById("selectedCount");
  const findVibes = document.getElementById("findVibes");

  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastText = document.getElementById("toastText");

  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const changeZone = document.getElementById("changeZone");
  const confirmZone = document.getElementById("confirmZone");
  const zoneName = document.getElementById("zoneName");

  let selectedZone = "Campus Area";
  let toastTimer;


  /* ---------------- TOAST ---------------- */

  function showToast(title, text) {
    toastTitle.textContent = title;
    toastText.textContent = text;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }


  /* ---------------- INTERESTS ---------------- */

  interestCards.forEach(card => {

    card.addEventListener("click", () => {

      const interest = card.dataset.interest;

      if (selectedInterests.has(interest)) {
        selectedInterests.delete(interest);
        card.classList.remove("selected");
        card.querySelector("i").textContent = "+";
      } else {
        selectedInterests.add(interest);
        card.classList.add("selected");
        card.querySelector("i").textContent = "✓";
      }

      selectedCount.textContent = selectedInterests.size;
    });

  });


  /* ---------------- FIND VIBES ---------------- */

  findVibes.addEventListener("click", () => {

    if (selectedInterests.size === 0) {
      showToast(
        "Choose your vibe first",
        "Select at least one interest to start discovering."
      );
      return;
    }

    const interestText = [...selectedInterests].join(", ");

    showToast(
      "Vibe scan started ✦",
      `Looking for ${interestText} around your zone.`
    );

    setTimeout(() => {
      document.getElementById("signals").scrollIntoView({
        behavior: "smooth"
      });
    }, 500);

  });


  /* ---------------- START DISCOVERING ---------------- */

  document.getElementById("startDiscover").addEventListener("click", () => {

    document.getElementById("discover").scrollIntoView({
      behavior: "smooth"
    });

  });


  /* ---------------- HOW IT WORKS ---------------- */

  document.getElementById("learnMore").addEventListener("click", () => {

    document.querySelector(".how-section").scrollIntoView({
      behavior: "smooth"
    });

  });


  /* ---------------- ZONE MODAL ---------------- */

  function openZoneModal() {
    modalOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeZoneModal() {
    modalOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  changeZone.addEventListener("click", openZoneModal);
  closeModal.addEventListener("click", closeZoneModal);

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeZoneModal();
    }
  });


  /* ---------------- ZONE OPTIONS ---------------- */

  document.querySelectorAll(".zone-option").forEach(option => {

    option.addEventListener("click", () => {

      document.querySelectorAll(".zone-option")
        .forEach(item => item.classList.remove("active"));

      option.classList.add("active");

      selectedZone = option.dataset.zone;

    });

  });


  confirmZone.addEventListener("click", () => {

    zoneName.textContent = selectedZone;

    closeZoneModal();

    showToast(
      "Discovery zone updated",
      `${selectedZone} is now your active zone.`
    );

  });


  /* ---------------- SIGNAL BUTTONS ---------------- */

  document.querySelectorAll(".signal-btn").forEach(button => {

    button.addEventListener("click", () => {

      const person = button.dataset.person;

      if (button.classList.contains("sent")) {
        showToast(
          "Signal already sent",
          `Your signal to Anonymous ${person} is waiting.`
        );
        return;
      }

      button.classList.add("sent");
      button.innerHTML = 'Signal sent <span>✓</span>';

      showToast(
        "Signal sent ✦",
        `Anonymous ${person} will only connect if the interest is mutual.`
      );

    });

  });


  /* ---------------- REFRESH SIGNALS ---------------- */

  document.getElementById("refreshSignals").addEventListener("click", () => {

    const button = document.getElementById("refreshSignals");

    button.textContent = "Refreshing...";

    setTimeout(() => {

      button.textContent = "↻ Refresh";

      showToast(
        "Signals refreshed",
        "Your nearby discovery has been updated."
      );

    }, 900);

  });


  /* ---------------- PROFILE ---------------- */

  const profileTags = document.getElementById("profileTags");

  function updateProfileTags() {

    profileTags.innerHTML = "";

    if (selectedInterests.size === 0) {

      const tag = document.createElement("span");
      tag.textContent = "No interests selected";

      profileTags.appendChild(tag);

      return;
    }

    [...selectedInterests].slice(0, 5).forEach(interest => {

      const tag = document.createElement("span");
      tag.textContent = interest;

      profileTags.appendChild(tag);

    });

  }


  document.getElementById("editProfile").addEventListener("click", () => {

    document.getElementById("discover").scrollIntoView({
      behavior: "smooth"
    });

    showToast(
      "Edit your vibe",
      "Choose interests below to update your profile."
    );

  });


  document.getElementById("openProfile").addEventListener("click", () => {

    document.getElementById("profile").scrollIntoView({
      behavior: "smooth"
    });

  });


  /* ---------------- DISCOVERY TOGGLE ---------------- */

  const toggleMode = document.getElementById("toggleMode");
  const modeToggle = document.querySelector(".mode-toggle");

  let discoveryActive = true;

  toggleMode.addEventListener("click", () => {

    discoveryActive = !discoveryActive;

    modeToggle.classList.toggle("off", !discoveryActive);

    if (discoveryActive) {

      modeToggle.querySelector("strong").textContent = "Active";
      modeToggle.querySelector("small").textContent =
        "Discoverable nearby";

      showToast(
        "Discovery active",
        "You're visible inside your broad discovery zone."
      );

    } else {

      modeToggle.querySelector("strong").textContent = "Paused";
      modeToggle.querySelector("small").textContent =
        "Not discoverable";

      showToast(
        "Discovery paused",
        "You won't appear in nearby discovery."
      );

    }

  });


  /* ---------------- PRIVACY / SAFETY ---------------- */

  document.getElementById("privacyBtn").addEventListener("click", () => {

    showToast(
      "Privacy",
      "Vibe uses broad discovery zones instead of exposing exact location."
    );

  });


  document.getElementById("safetyBtn").addEventListener("click", () => {

    document.querySelector(".safety-section").scrollIntoView({
      behavior: "smooth"
    });

  });


  /* ---------------- SAVE PROFILE WHEN INTERESTS CHANGE ---------------- */

  interestCards.forEach(card => {

    card.addEventListener("click", updateProfileTags);

  });


  /* ---------------- ESCAPE MODAL ---------------- */

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      closeZoneModal();
    }

  });


});
