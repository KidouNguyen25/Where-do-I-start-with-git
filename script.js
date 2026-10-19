(() => {
  const root = document.documentElement;
  const vi = root.lang === "vi";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  root.classList.add("js");

  // reading progress bar
  const bar = document.querySelector(".progress");
  const onScroll = () => {
    const max = root.scrollHeight - root.clientHeight;
    bar.style.width = (max > 0 ? (root.scrollTop / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // copy buttons
  document.querySelectorAll("pre.code").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy";
    btn.type = "button";
    btn.textContent = vi ? "Chép" : "Copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector("code").textContent.trim());
        btn.textContent = vi ? "Đã chép" : "Copied";
        btn.classList.add("done");
      } catch {
        btn.textContent = vi ? "Lỗi" : "Failed";
      }
      setTimeout(() => {
        btn.textContent = vi ? "Chép" : "Copy";
        btn.classList.remove("done");
      }, 1500);
    });
    pre.appendChild(btn);
  });

  // reveal on scroll
  const reveal = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

  // active nav link
  const links = new Map();
  document.querySelectorAll('.nav a[href^="#"]').forEach((a) => links.set(a.getAttribute("href").slice(1), a));
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("active"));
      const a = links.get(e.target.id);
      if (a) { a.classList.add("active"); a.scrollIntoView({ block: "nearest", inline: "center" }); }
    }),
    { rootMargin: "-30% 0px -60% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  // keep #section when switching language
  document.querySelectorAll("a.lang").forEach((a) => {
    const base = a.getAttribute("href").split("#")[0];
    const update = () => { a.href = base + location.hash; };
    addEventListener("hashchange", update);
    update();
  });

  // run an async loop only while the element is on screen
  function whileVisible(el, play) {
    let token = 0;
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { const my = ++token; play(() => my === token); }
        else token++;
      });
    }, { threshold: 0.3 }).observe(el);
  }

  // typing terminal demo
  document.querySelectorAll(".term").forEach((term) => {
    const body = term.querySelector(".term-body");
    const lines = [...body.querySelectorAll("p")].map((p) => ({ cls: p.className, text: p.textContent }));
    if (reduce) return;
    whileVisible(term, async (alive) => {
      term.classList.add("playing");
      while (alive()) {
        body.textContent = "";
        for (const l of lines) {
          if (!alive()) return;
          const p = document.createElement("p");
          p.className = l.cls;
          body.appendChild(p);
          if (l.cls === "c") {
            for (const ch of l.text) {
              if (!alive()) return;
              p.textContent += ch;
              await sleep(38);
            }
            await sleep(350);
          } else {
            p.textContent = l.text;
            await sleep(280);
          }
        }
        await sleep(3200);
      }
    });
  });

  // VS Code source control demo
  document.querySelectorAll(".scm").forEach((scm) => {
    if (reduce) { scm.classList.add("s1", "s2", "s3"); return; }
    const msg = scm.querySelector(".scm-msg");
    const text = msg.dataset.msg;
    whileVisible(scm, async (alive) => {
      while (alive()) {
        scm.className = "scm";
        msg.textContent = "";
        await sleep(1200);
        if (!alive()) return;
        scm.classList.add("s1");
        await sleep(700);
        scm.classList.add("s2");
        await sleep(900);
        for (const ch of text) {
          if (!alive()) return;
          msg.textContent += ch;
          await sleep(55);
        }
        scm.classList.add("s3");
        await sleep(900);
        scm.classList.add("s4");
        await sleep(500);
        scm.classList.add("s5");
        msg.textContent = "";
        await sleep(3000);
      }
    });
  });
})();
