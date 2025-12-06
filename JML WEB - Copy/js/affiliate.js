/* -------------------------------------------
   MOBILE NAV (Affiliate Page Only)
------------------------------------------- */
const menuBtn = document.getElementById("menuToggleAffiliate");
const nav = document.getElementById("siteNavAffiliate");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", !expanded);
    nav.classList.toggle("open");
  });
}

/* -------------------------------------------
   YEAR AUTO-UPDATE (Footer)
------------------------------------------- */
const yearOut = document.getElementById("yearAffiliate");
if (yearOut) yearOut.textContent = new Date().getFullYear();

/* -------------------------------------------
   REVEAL ANIMATIONS
------------------------------------------- */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* -------------------------------------------
   CONDITIONAL EXPERIENCE FIELD
------------------------------------------- */
const promotedRadios = document.querySelectorAll('input[name="promotedBefore"]');
const experienceLabel = document.getElementById("experienceLabel");

if (promotedRadios && experienceLabel) {
  promotedRadios.forEach(radio =>
    radio.addEventListener("change", () => {
      if (radio.value === "Yes") {
        experienceLabel.classList.remove("hidden");
      } else {
        experienceLabel.classList.add("hidden");
      }
    })
  );
}

/* -------------------------------------------
   FORM + RULES POPUP SYSTEM
------------------------------------------- */

const form = document.getElementById("promoterForm");
const submitBtn = document.getElementById("promoterSubmit");
const clearBtn = document.getElementById("promoterClear");
const successBox = document.getElementById("promoterSuccess");

const rulesPopup = document.getElementById("rulesPopup");
const closeRulesBtn = document.getElementById("closeRules");
const acceptRulesBtn = document.getElementById("acceptRulesBtn");
const rulesCheckbox = document.getElementById("acceptRulesCheckbox");

let formPendingData = null;

/* ---------------------------
   1. VALIDATE FORM FIRST
--------------------------- */
function validateForm() {
  const requiredFields = form.querySelectorAll("[required]");

  for (let field of requiredFields) {
    if (!field.value.trim()) {
      field.focus();
      field.classList.add("error");
      setTimeout(() => field.classList.remove("error"), 1000);
      return false;
    }
  }
  return true;
}

/* ---------------------------
   2. OPEN RULES POPUP AFTER VALID
--------------------------- */
submitBtn.addEventListener("click", () => {
  if (!validateForm()) return;

  // store form data temporarily  
  const formData = new FormData(form);
  formPendingData = formData;

  // reset the modal state  
  rulesCheckbox.checked = false;
  acceptRulesBtn.disabled = true;

  openRulesPopup();
});

/* ---------------------------
   RULES POPUP OPEN / CLOSE
--------------------------- */
function openRulesPopup() {
  rulesPopup.classList.add("open");
  rulesPopup.setAttribute("aria-hidden", "false");
}

function closeRulesPopup() {
  rulesPopup.classList.remove("open");
  rulesPopup.setAttribute("aria-hidden", "true");
}

closeRulesBtn.addEventListener("click", closeRulesPopup);

rulesPopup.addEventListener("click", e => {
  if (e.target === rulesPopup) closeRulesPopup();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && rulesPopup.classList.contains("open")) {
    closeRulesPopup();
  }
});

/* ---------------------------
   ENABLE SUBMIT AFTER CHECKBOX
--------------------------- */
rulesCheckbox.addEventListener("change", () => {
  acceptRulesBtn.disabled = !rulesCheckbox.checked;
});

/* ---------------------------
   3. IF ACCEPTED → SEND TO NETLIFY
--------------------------- */
acceptRulesBtn.addEventListener("click", async () => {
  if (!rulesCheckbox.checked || !formPendingData) return;

  acceptRulesBtn.disabled = true; // stop double-clicking

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams([...formPendingData]).toString()
    });

    closeRulesPopup();

    // replace form with success
    form.classList.add("hidden");
    successBox.classList.remove("hidden");

    form.reset();
    formPendingData = null;

  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error(err);
  }
});

/* -------------------------------------------
   CLEAR BUTTON
------------------------------------------- */
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    form.reset();
    experienceLabel.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("promoterForm");
  const submitBtn = document.getElementById("promoterSubmit");
  const clearBtn = document.getElementById("promoterClear");
  const successBox = document.getElementById("promoterSuccess");

  // Conditional experience field
  const experienceLabel = document.getElementById("experienceLabel");
  const promotedBeforeRadios = document.querySelectorAll("input[name='promotedBefore']");

  promotedBeforeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "Yes") {
        experienceLabel.classList.remove("hidden");
        experienceLabel.classList.add("fade-in");
      } else {
        experienceLabel.classList.add("hidden");
      }
    });
  });

  // RULES MODAL
  const rulesModal = document.getElementById("rulesModal");
  const rulesClose = document.getElementById("rulesClose");
  const rulesAgree = document.getElementById("rulesAgree");

  function openRules() {
    rulesModal.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeRules() {
    rulesModal.classList.remove("visible");
    document.body.style.overflow = "";
  }

  rulesClose.addEventListener("click", closeRules);

  // CLEAR FORM
  clearBtn.addEventListener("click", () => {
    form.reset();
    successBox.classList.add("hidden");
  });

  // FIRST CLICK → SHOW RULES
  submitBtn.addEventListener("click", () => {
    openRules();
  });

  // ACTUAL SUBMISSION AFTER AGREEING
  rulesAgree.addEventListener("click", () => {
    closeRules();

    const formData = new FormData(form);

    fetch("/", {
      method: "POST",
      body: formData
    })
      .then(() => {
        form.reset();
        showSuccess();
      })
      .catch(err => console.error("Affiliate submission error: ", err));
  });

  // SUCCESS MESSAGE SHOW
  function showSuccess() {
    successBox.classList.remove("hidden");
    successBox.style.opacity = "0";

    setTimeout(() => {
      successBox.style.opacity = "1";
    }, 50);
  }

});

/* affiliate.js — promoter form flow (modal confirm -> submit) */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promoterForm");
  if (!form) return;

  const submitBtn = document.getElementById("promoterSubmit");
  const clearBtn = document.getElementById("promoterClear");
  const successBox = document.getElementById("promoterSuccess");
  const experienceLabel = document.getElementById("experienceLabel");
  const radios = document.querySelectorAll("input[name='promotedBefore']");

  // wire experience show/hide
  radios.forEach(r => r.addEventListener("change", () => {
    if (r.value === "Yes") experienceLabel.classList.remove("hidden"); else experienceLabel.classList.add("hidden");
  }));

  // modal detection (support multiple markup variants)
  const rulesPopup = document.getElementById("rulesPopup"); // older variant
  const rulesModal = document.getElementById("rulesModal"); // newer variant
  const modalEl = rulesModal || rulesPopup || null;

  // accept/close elements (support both sets)
  const acceptBtn = document.getElementById("acceptRulesBtn") || document.getElementById("rulesAgree") || null;
  const acceptCheckbox = document.getElementById("acceptRulesCheckbox") || document.getElementById("acceptRulesCheckbox") || null;
  const closeBtn = document.getElementById("closeRules") || document.getElementById("rulesClose") || null;

  // helpers to open/close modal
  function openModal() {
    if (!modalEl) {
      // fallback: directly submit if no modal exists
      doSubmit();
      return;
    }
    modalEl.classList.add("open", "visible");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // reset modal UI if checkbox present
    if (acceptBtn) acceptBtn.disabled = !!acceptCheckbox && !acceptCheckbox.checked;
    if (acceptCheckbox) acceptCheckbox.checked = false;
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove("open", "visible");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // validate required fields
  function validateForm() {
    const requireds = form.querySelectorAll("[required]");
    for (let f of requireds) {
      if (!f.value || !String(f.value).trim()) {
        f.focus();
        f.classList.add("error");
        setTimeout(() => f.classList.remove("error"), 900);
        return false;
      }
    }
    return true;
  }

  // actually submit via fetch to Netlify
  function doSubmit() {
    const data = new FormData(form);
    fetch("/", { method: "POST", body: data })
      .then(() => {
        form.reset();
        if (successBox) {
          successBox.classList.remove("hidden");
          successBox.style.opacity = 0;
          setTimeout(() => successBox.style.opacity = 1, 50);
        }
      })
      .catch(err => {
        console.error("Affiliate submit error:", err);
        alert("Could not submit application. Please try again.");
      });
  }

  // wire submit button -> open modal (after validation)
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (!validateForm()) return;
      openModal();
    });
  }

  // wire clear
  if (clearBtn) clearBtn.addEventListener("click", () => {
    form.reset();
    if (successBox) successBox.classList.add("hidden");
    if (experienceLabel) experienceLabel.classList.add("hidden");
  });

  // modal close
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modalEl) {
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalEl && modalEl.classList.contains("open")) closeModal();
    }
  });

  // enable accept button only when checkbox checked (if checkbox exists)
  if (acceptCheckbox && acceptBtn) {
    acceptCheckbox.addEventListener("change", () => acceptBtn.disabled = !acceptCheckbox.checked);
  }

  // accept button -> submit
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      // if there's a checkbox, ensure it's checked
      if (acceptCheckbox && !acceptCheckbox.checked) return;
      closeModal();
      doSubmit();
    });
  }
});
