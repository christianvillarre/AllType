(() => { const hero = document.querySelector(".hero"); if (!hero) return; const currentHero = "home";  const stormFrames = [1, 2, 3, 4].map(
    number => `/images/optimized/lightning${number}.webp`
  ).concat(
    "/images/optimized/lightning-ground.webp",
    "/images/optimized/lightning-clouds.webp",
    "/images/optimized/lightning-ground-left.webp",
    "/images/optimized/lightning-clouds-left.webp"
  );

  function preloadStormFrames() {
    const loadImage = source => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = source;
      if (image.complete && image.naturalWidth) resolve(image);
    });

    return Promise.all([
      loadImage("/images/Alltype Web BG.jpg"),
      ...stormFrames.map(loadImage)
    ]).then(([background, ...frames]) => {
      if (!background || frames.some(frame => !frame)) return stormFrames;

      // Keep the photographed clouds fixed and extract only the brighter strike.
      const canvas = document.createElement("canvas");
      canvas.width = frames[0].naturalWidth;
      canvas.height = Math.round(canvas.width * background.naturalHeight / background.naturalWidth);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return stormFrames;

      try {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        const clouds = context.getImageData(0, 0, canvas.width, canvas.height).data;
        return frames.map((frame, frameIndex) => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(frame, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          const strike = context.createImageData(canvas.width, canvas.height);
          const isGroundStrike = frameIndex === 4 || frameIndex === 6;
          for (let index = 0; index <pixels.length; index += 4) {
            const brightnessGain = Math.max(
              pixels[index] - clouds[index],
              pixels[index + 1] - clouds[index + 1],
              pixels[index + 2] - clouds[index + 2]
            );
            strike.data[index] = pixels[index];
            strike.data[index + 1] = pixels[index + 1];
            strike.data[index + 2] = pixels[index + 2];
            // Feather translated frame boundaries so no rectangular seam flashes.
            const x = (index / 4) % canvas.width;
            const y = Math.floor(index / 4 / canvas.width);
            const edgeDistance = Math.min(x, canvas.width - 1 - x, y, canvas.height - 1 - y);
            const edgeProgress = Math.max(0, Math.min(1, edgeDistance / (canvas.width * (frameIndex === 6 || frameIndex === 7 ? .12 : .045))));
            const edgeFade = edgeProgress * edgeProgress * (3 - 2 * edgeProgress);
            strike.data[index + 3] = edgeFade * Math.max(0, Math.min(255,
              (brightnessGain - (isGroundStrike ? 18 : 24)) * (isGroundStrike ? 4 : 3)
            ));
          }
          context.putImageData(strike, 0, 0);
          return canvas.toDataURL("image/png");
        });
      } catch (error) {
        console.warn("Using original lightning frames", error);
        return stormFrames;
      }
    });
  }

  window.lightningLayersPromise = preloadStormFrames();

    const lightningCloudFrame = hero?.querySelector(".hero-lightning-cloudframe");
    const lightningCloudFrameSecondary = hero?.querySelector(".hero-lightning-cloudframe-secondary");
    const lightningGlow = hero?.querySelector(".hero-lightning-glow");
    const lightningGround = hero?.querySelector(".hero-lightning-ground");
    const lightningSkywash = hero?.querySelector(".hero-lightning-skywash");
    const lightningImpact = hero?.querySelector(".hero-lightning-impact");
    let heroInView = true;
    function clearLightning() {
      lightningCloudFrame.style.transition = "none";
      lightningCloudFrameSecondary.style.transition = "none";
      lightningGlow.style.transition = "none";
      lightningSkywash.style.transition = "none";
      lightningImpact.style.transition = "none";
      lightningCloudFrame.style.opacity = 0;
      lightningCloudFrameSecondary.style.opacity = 0;
      lightningGlow.style.opacity = 0;
      lightningGround.style.opacity = 0;
      lightningSkywash.style.opacity = 0;
      lightningImpact.style.opacity = 0;
      lightningGround.style.clipPath = "none";
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        heroInView = entries[0].isIntersecting;
        if (!heroInView) clearLightning();
      }, { threshold: .05 }).observe(hero);
    }
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const lightningSpots = [
      { cloudX: "22%", impactX: "28%", groundIndex: 6, cloudIndex: 7, otherCloudIndex: 5, groundShift: "-4%", rest: 3100 },
      { cloudX: "68%", impactX: "68%", groundIndex: 4, cloudIndex: 5, otherCloudIndex: 7, groundShift: "0%", rest: 3500 },
      { cloudX: "33%", impactX: "39%", groundIndex: 6, cloudIndex: 7, otherCloudIndex: 5, groundShift: "7%", rest: 3200 },
      { cloudX: "82%", impactX: "82%", groundIndex: 4, cloudIndex: 5, otherCloudIndex: 7, groundShift: "14%", rest: 3400 }
    ];
    const stormActive = () => !document.hidden && heroInView && currentHero === "home" && !hero.classList.contains("hero-has-selection");

    const cycleLightning = async () => {
      const layers = await window.lightningLayersPromise;
      if (!layers?.[4] || !layers?.[5] || !layers?.[6] || !layers?.[7]) return;
      let strikeNumber = 0;
      await pause(600);
      while (hero.isConnected) {
        if (!stormActive()) {
          clearLightning();
          await pause(400);
          continue;
        }

        const spot = lightningSpots[strikeNumber++ % lightningSpots.length];
        hero.classList.toggle("hero-right-strike", spot.groundIndex === 4);
        lightningGround.src = layers[spot.groundIndex];
        lightningCloudFrame.src = layers[spot.cloudIndex];
        lightningCloudFrameSecondary.src = layers[spot.otherCloudIndex];
        hero.style.setProperty("--strike-cloud-x", spot.cloudX);
        hero.style.setProperty("--strike-impact-x", spot.impactX);
        lightningCloudFrame.style.transform = `translateX(${parseFloat(spot.groundShift) * .5}%)`;
        lightningGround.style.transform = `translateX(${spot.groundShift})`;
        lightningGround.style.clipPath = "none";
        lightningCloudFrame.style.transition = "opacity .09s ease-out";
        lightningCloudFrameSecondary.style.transition = "opacity .12s ease-out";
        lightningGlow.style.transition = "opacity .09s ease-out";
        lightningSkywash.style.transition = "opacity .09s ease-out";
        lightningImpact.style.transition = "opacity .09s ease-out";

        // Some bolts have almost no warning; others follow a brief cloud flicker.
        const leadIns = [
          [[.08, .04, .12, 130]],
          [[.28, .14, .32, 120], [.06, .03, .08, 160]],
          [[.04, .02, .06, 90]],
          [[.4, .22, .45, 110], [.1, .05, .12, 170], [.2, .1, .25, 90]]
        ];
        const leadIn = leadIns[(strikeNumber - 1) % leadIns.length];
        for (const [sky, glow, cloud, hold] of leadIn) {
          if (!stormActive()) break;
          lightningSkywash.style.opacity = sky;
          lightningGlow.style.opacity = glow;
          lightningCloudFrame.style.opacity = cloud;
          lightningCloudFrameSecondary.style.opacity = sky * .18;
          await pause(hold);
        }
        if (!stormActive()) { clearLightning(); continue; }

        // A photographed single channel reaches the horizon in one fast flash.
        lightningGround.style.opacity = 1;
        lightningCloudFrame.style.opacity = .9;
        lightningCloudFrameSecondary.style.opacity = .4;
        lightningSkywash.style.opacity = 1;
        lightningGlow.style.opacity = .78;
        lightningImpact.style.opacity = 1;
        await pause(110);
        if (!stormActive()) { clearLightning(); continue; }
        lightningGround.style.opacity = .12;
        lightningCloudFrame.style.opacity = .42;
        lightningCloudFrameSecondary.style.opacity = .28;
        lightningSkywash.style.opacity = .42;
        lightningGlow.style.opacity = .3;
        lightningImpact.style.opacity = .25;
        await pause(125);

        // Return strokes follow the same channel while the cloud bank stays illuminated.
        if (!stormActive()) { clearLightning(); continue; }
        lightningGround.style.clipPath = "none";
        lightningGround.style.opacity = .82;
        lightningCloudFrame.style.opacity = .78;
        lightningSkywash.style.opacity = .86;
        lightningGlow.style.opacity = .62;
        await pause(70);
        lightningGround.style.opacity = 0;
        lightningCloudFrame.style.opacity = .4;
        lightningSkywash.style.opacity = .42;
        await pause(135);
        if (!stormActive()) { clearLightning(); continue; }
        lightningGround.style.opacity = .48;
        lightningGround.style.clipPath = "none";
        lightningCloudFrame.style.opacity = .67;
        lightningSkywash.style.opacity = .72;
        await pause(55);
        lightningGround.style.opacity = 0;
        if (strikeNumber % lightningSpots.length === 0) {
          // The final position gets one smaller, separate strike after the main channel.
          await pause(115);
          if (!stormActive()) { clearLightning(); continue; }
          lightningGround.style.clipPath = "none";
          lightningGround.style.opacity = .7;
          lightningCloudFrame.style.opacity = .76;
          lightningSkywash.style.opacity = .82;
          lightningGlow.style.opacity = .5;
          await pause(75);
          lightningGround.style.opacity = 0;
        }
        lightningImpact.style.opacity = 0;
        lightningSkywash.style.transition = "opacity 1.2s ease-out";
        lightningGlow.style.transition = "opacity 1.2s ease-out";
        lightningCloudFrame.style.transition = "opacity 1.2s ease-out";
        lightningCloudFrameSecondary.style.transition = "opacity 1.2s ease-out";
        lightningSkywash.style.opacity = .42;
        lightningGlow.style.opacity = .3;
        lightningCloudFrame.style.opacity = .45;
        lightningCloudFrameSecondary.style.opacity = .3;
        await pause(250);
        if (!stormActive()) { clearLightning(); continue; }
        lightningSkywash.style.transition = "opacity .12s ease-out";
        lightningGlow.style.transition = "opacity .12s ease-out";
        lightningCloudFrame.style.transition = "opacity .12s ease-out";
        lightningCloudFrameSecondary.style.transition = "opacity .12s ease-out";
        lightningSkywash.style.opacity = .62;
        lightningGlow.style.opacity = .42;
        lightningCloudFrame.style.opacity = .66;
        lightningCloudFrameSecondary.style.opacity = .46;
        await pause(85);
        lightningSkywash.style.transition = "opacity 1.25s ease-out";
        lightningGlow.style.transition = "opacity 1.25s ease-out";
        lightningCloudFrame.style.transition = "opacity 1.25s ease-out";
        lightningCloudFrameSecondary.style.transition = "opacity 1.25s ease-out";
        lightningSkywash.style.opacity = 0;
        lightningGlow.style.opacity = 0;
        lightningCloudFrame.style.opacity = 0;
        lightningCloudFrameSecondary.style.opacity = 0;
        // Distant electrical activity continues through the quiet space between bolts.
        const ambientFlashes = [
          [.34, .08, .24, 500],
          [.04, .05, .04, 400],
          [.08, .38, .27, 500],
          [.26, .24, .2, 450],
          [.03, .04, .03, 350],
          [.12, .3, .18, 500]
        ];
        for (const [nearCloud, farCloud, sky, hold] of ambientFlashes) {
          if (!stormActive()) break;
          lightningCloudFrame.style.transition = "opacity .4s ease-in-out";
          lightningCloudFrameSecondary.style.transition = "opacity .4s ease-in-out";
          lightningSkywash.style.transition = "opacity .4s ease-in-out";
          lightningCloudFrame.style.opacity = nearCloud;
          lightningCloudFrameSecondary.style.opacity = farCloud;
          lightningSkywash.style.opacity = sky;
          await pause(hold);
        }
        lightningCloudFrame.style.opacity = 0;
        lightningCloudFrameSecondary.style.opacity = 0;
        lightningSkywash.style.opacity = 0;
        await pause(spot.rest - 2700);
      }
    };
    cycleLightning();


})();