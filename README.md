# شاهراه · The Royal Road

یک بازی نوبتی تک‌نفره با دو زبان هم‌زمان و رقیب رایانه‌ای. با پیمان و عوارض و دژسازی راهی از شوش به سارد باز کنید. نقشه برای بازی طراحی شده است. ذخیرهٔ بازی در مرورگر همان دستگاه است.
A bilingual single-player territory campaign inspired by Achaemenid Persia. Connect Susa to Sardis by the end of turn 14. All game resources ship locally, including orthographically rendered 3D city meshes and synthetic dialogue in both languages. Persian uses a device voice when available, otherwise bundled phonetic audio.

## cPanel
یک پوشهٔ خالی مثل public_html/royal-road بسازید و فایل ZIP مخصوص cPanel را داخل آن Extract کنید. سپس آدرس همان پوشه را با / در انتها باز کنید. index.html باید مستقیماً داخل آن باشد. راه‌اندازی نود یا پایگاه داده لازم نیست.
Extract the cPanel ZIP into an empty web directory. Open that directory URL with a trailing slash. Include the bundled .htaccess so Apache serves .mjs as JavaScript. Hosts without AllowOverride should configure that MIME mapping in cPanel MIME Types.

## VPS
به Node.js نسخهٔ ۲۰ یا جدیدتر نیاز دارید. بستهٔ VPS را باز کنید و در پوشهٔ package.json دستور زیر را اجرا کنید. وابستگی خارجی ندارد.
Extract the VPS archive. From its root, with Node.js 20+ installed, run:

    npm start

By default the service listens at http://127.0.0.1:3000. Point your domain's reverse proxy at this address; /healthz returns ok. For a public listener use HOST=0.0.0.0 PORT=3000 npm start. For automatic restarts, put the extracted files at /opt/royal-road (readable by the service), adjust the node path in royal-road.service to the result of command -v node, copy the unit to /etc/systemd/system/ and run sudo systemctl daemon-reload and sudo systemctl enable --now royal-road.service.
برای اجرای دائمی، مسیر node را در فایل سرویس تنظیم کنید و سرویس systemd را مطابق دستور بالا فعال کنید.

## Development and release
Run npm test for the game rule suite. Run python3 scripts/package.py to create deployment archives in dist/. Push a v1.0.0 tag to run the GitHub release workflow. It tests the game, rebuilds the two archives and attaches them to the release.

## 1.1 · دیده‌بانی و تدارکات
از «شروع دوباره» سطح دشواری را انتخاب کنید. مسیر پیشنهادی کمترین هزینهٔ پیمان‌ها را روی نقشهٔ فعلی نشان می‌دهد. دیدبان شهر هدف حرکت بعدی رقیب را مشخص می‌کند. لغو آخرین فرمان تا پایان نوبت یا بارگذاری مجدد در دسترس است. رویدادهای لشکرکشی همراه بازی ذخیره می‌شوند.
Choose Scout, Classic or Siege from Restart. Route planning finds the least expensive chain of treaties at current prices. Lookout previews the rival's next target. Undo reverses one order before ending the turn or reloading. The chronicle survives reloads. Existing version 1 saves continue with classic rules.

## 1.2 · کاروان‌سرا / The Caravanserai
بارگیری هر قرارداد یک فرمان می‌خواهد. با صاحب بار صحبت کنید، راه مقصد را به قلمرو خود وصل کنید و نشان گاری را روی نقشه دنبال کنید. در پایان نوبت، پس از حرکت رقیب، کاروان از نزدیک‌ترین مسیر خودی می‌رود. سفری که راهش بسته است منتظر می‌ماند. اگر محل توقف کاروان تصرف شود، می‌توانید قرارداد را از شوش دوباره بگیرید.
Each city has an original illustrated streetscape and fictional local voice. Three optional contracts involve bread for the watch, a courier relay and a river crossing. The campaign deadline still applies. Existing saves can take contracts immediately.
Both release ZIPs include synthetic English and Persian recordings for the new scenes. For a source checkout, install ffmpeg with libflite and espeak-ng, then run node scripts/record-scenes.mjs before packaging. Without rendering, source checkouts use available device voices for the new scenes.
