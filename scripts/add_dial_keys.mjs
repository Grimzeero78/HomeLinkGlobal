// Add the phone-dial + password-eye + 7km-radius i18n keys to every language
// (tr/{lang}.json), then re-run assemble_i18n.mjs to regenerate the I18N block.
import { readFileSync, writeFileSync } from 'fs';
const P = '/home/z/my-project/HuntInGlobal';

const KEYS = ['pw_needs','pw_notcommon','pw_show','pw_hide','phone_auto','phone_ph_local','dial_t','dial_q','dial_none','near_km_t','near_km_empty','near_km_d'];

const TR = {
  en: {
    pw_needs: 'Your password needs 4 things:', pw_notcommon: 'not an easy-to-guess word',
    pw_show: 'Show password', pw_hide: 'Hide password',
    phone_auto: 'Your country code is already set — tap the flag to change it', phone_ph_local: 'e.g. 712 345 678',
    dial_t: 'Country code', dial_q: 'Search country or code…', dial_none: 'Set code',
    near_km_t: 'Houses within {r} km of you', near_km_empty: 'No houses within {r} km of you yet',
    near_km_d: 'Only homes you can visit in person belong here — open the map to widen your hunt.',
  },
  sw: {
    pw_needs: 'Nenosiri lako linahitaji vitu 4:', pw_notcommon: 'si neno rahisi kubahatisha',
    pw_show: 'Onyesha nenosiri', pw_hide: 'Ficha nenosiri',
    phone_auto: 'Code ya nchi yako imewekwa — gusa bendera kubadilisha', phone_ph_local: 'mf. 712 345 678',
    dial_t: 'Code ya nchi', dial_q: 'Tafuta nchi au code…', dial_none: 'Weka code',
    near_km_t: 'Nyumba ndani ya km {r} kutoka kwako', near_km_empty: 'Hakuna nyumba bado ndani ya km {r} kutoka kwako',
    near_km_d: 'Hapa huonyeshwa tu nyumba unazoweza kutembelea binafsi — fungua ramani kupanua utafutaji wako.',
  },
  es: {
    pw_needs: 'Tu contraseña necesita 4 cosas:', pw_notcommon: 'que no sea fácil de adivinar',
    pw_show: 'Mostrar contraseña', pw_hide: 'Ocultar contraseña',
    phone_auto: 'El código de tu país ya está puesto — toca la bandera para cambiarlo', phone_ph_local: 'p. ej. 712 345 678',
    dial_t: 'Código de país', dial_q: 'Busca país o código…', dial_none: 'Poner código',
    near_km_t: 'Casas a menos de {r} km de ti', near_km_empty: 'Aún no hay casas a menos de {r} km de ti',
    near_km_d: 'Aquí solo van casas que puedes visitar en persona — abre el mapa para ampliar tu búsqueda.',
  },
  fr: {
    pw_needs: 'Votre mot de passe a besoin de 4 choses :', pw_notcommon: 'pas un mot facile à deviner',
    pw_show: 'Afficher le mot de passe', pw_hide: 'Masquer le mot de passe',
    phone_auto: "L'indicatif de votre pays est déjà défini — touchez le drapeau pour le changer", phone_ph_local: 'ex. 712 345 678',
    dial_t: 'Code du pays', dial_q: 'Chercher un pays ou un code…', dial_none: 'Définir le code',
    near_km_t: 'Maisons à moins de {r} km de vous', near_km_empty: 'Pas encore de maisons à moins de {r} km de vous',
    near_km_d: 'Seules les maisons que vous pouvez visiter en personne vont ici — ouvrez la carte pour élargir vos recherches.',
  },
  pt: {
    pw_needs: 'A sua senha precisa de 4 coisas:', pw_notcommon: 'não uma palavra fácil de adivinhar',
    pw_show: 'Mostrar senha', pw_hide: 'Ocultar senha',
    phone_auto: 'O código do seu país já está definido — toque na bandeira para mudar', phone_ph_local: 'ex. 712 345 678',
    dial_t: 'Código do país', dial_q: 'Procurar país ou código…', dial_none: 'Definir código',
    near_km_t: 'Casas a menos de {r} km de si', near_km_empty: 'Ainda não há casas a menos de {r} km de si',
    near_km_d: 'Só casas que pode visitar pessoalmente aparecem aqui — abra o mapa para ampliar a sua procura.',
  },
  ar: {
    pw_needs: 'كلمة المرور تحتاج إلى 4 أشياء:', pw_notcommon: 'ليست كلمة سهلة التخمين',
    pw_show: 'إظهار كلمة المرور', pw_hide: 'إخفاء كلمة المرور',
    phone_auto: 'رمز بلدك مضبوط بالفعل — انقر العلم لتغييره', phone_ph_local: 'مثال: 712 345 678',
    dial_t: 'رمز الدولة', dial_q: 'ابحث عن بلد أو رمز…', dial_none: 'تعيين الرمز',
    near_km_t: 'منازل على بُعد {r} كم منك', near_km_empty: 'لا توجد منازل بعد على بُعد {r} كم منك',
    near_km_d: 'هنا تظهر فقط المنازل التي يمكنك زيارتها شخصيًا — افتح الخريطة لتوسيع بحثك.',
  },
  hi: {
    pw_needs: 'आपके पासवर्ड में 4 चीज़ें चाहिए:', pw_notcommon: 'आसानी से अंदाज़ न लगाई जा सके',
    pw_show: 'पासवर्ड दिखाएँ', pw_hide: 'पासवर्ड छिपाएँ',
    phone_auto: 'आपके देश का कोड पहले से लगा है — बदलने के लिए झंडे पर टैप करें', phone_ph_local: 'जैसे 712 345 678',
    dial_t: 'देश का कोड', dial_q: 'देश या कोड खोजें…', dial_none: 'कोड चुनें',
    near_km_t: 'आपसे {r} किमी के भीतर घर', near_km_empty: 'अभी आपसे {r} किमी के भीतर कोई घर नहीं है',
    near_km_d: 'यहाँ सिर्फ वही घर दिखते हैं जिन्हें आप खुद जाकर देख सकें — खोज बढ़ाने के लिए नक्शा खोलें।',
  },
  bn: {
    pw_needs: 'আপনার পাসওয়ার্ডে 4টি জিনিস দরকার:', pw_notcommon: 'সহজে অনুমান করা যায় না এমন',
    pw_show: 'পাসওয়ার্ড দেখান', pw_hide: 'পাসওয়ার্ড লুকান',
    phone_auto: 'আপনার দেশের কোড আগেই বসানো আছে — বদলাতে পতাকায় ট্যাপ করুন', phone_ph_local: 'যেমন 712 345 678',
    dial_t: 'দেশের কোড', dial_q: 'দেশ বা কোড খুঁজুন…', dial_none: 'কোড দিন',
    near_km_t: 'আপনার থেকে {r} কিমি-র মধ্যে বাড়ি', near_km_empty: 'এখনও আপনার {r} কিমি-র মধ্যে কোনো বাড়ি নেই',
    near_km_d: 'এখানে শুধু সেই বাড়িগুলোই দেখানো হয় যেগুলো আপনি নিজে গিয়ে দেখতে পারেন — খোঁজ বাড়াতে ম্যাপ খুলুন।',
  },
  zh: {
    pw_needs: '密码需要满足4点：', pw_notcommon: '不是容易猜到的词',
    pw_show: '显示密码', pw_hide: '隐藏密码',
    phone_auto: '已自动填入您的国家区号 — 点按旗帜可更改', phone_ph_local: '如 712 345 678',
    dial_t: '国家区号', dial_q: '搜索国家或区号…', dial_none: '设置区号',
    near_km_t: '您{r}公里内的房屋', near_km_empty: '您{r}公里内暂无房屋',
    near_km_d: '这里只显示您可以亲自去看的房源 — 打开地图扩大寻找范围。',
  },
  ru: {
    pw_needs: 'Паролю нужны 4 вещи:', pw_notcommon: 'не простое для угадывания слово',
    pw_show: 'Показать пароль', pw_hide: 'Скрыть пароль',
    phone_auto: 'Код вашей страны уже выбран — нажмите на флаг, чтобы изменить', phone_ph_local: 'напр. 712 345 678',
    dial_t: 'Код страны', dial_q: 'Найти страну или код…', dial_none: 'Выбрать код',
    near_km_t: 'Дома в {r} км от вас', near_km_empty: 'Пока нет домов в {r} км от вас',
    near_km_d: 'Здесь только дома, которые можно посмотреть лично — откройте карту, чтобы расширить поиск.',
  },
  ur: {
    pw_needs: 'آپ کے پاس ورڈ کو 4 چیزوں کی ضرورت ہے:', pw_notcommon: 'آسانی سے اندازہ نہ لگایا جا سکے',
    pw_show: 'پاس ورڈ دکھائیں', pw_hide: 'پاس ورڈ چھپائیں',
    phone_auto: 'آپ کے ملک کا کوڈ پہلے سے لگا ہے — تبدیل کرنے کے لیے پرچم پر ٹیپ کریں', phone_ph_local: 'مثلاً 712 345 678',
    dial_t: 'ملک کا کوڈ', dial_q: 'ملک یا کوڈ تلاش کریں…', dial_none: 'کوڈ منتخب کریں',
    near_km_t: 'آپ سے {r} کلومیٹر کے اندر مکانات', near_km_empty: 'ابھی آپ کے {r} کلومیٹر کے اندر کوئی مکان نہیں',
    near_km_d: 'یہاں صرف وہی مکانات دکھائے جاتے ہیں جو آپ خود جا کر دیکھ سکیں — تلاش بڑھانے کے لیے نقشہ کھولیں۔',
  },
  id: {
    pw_needs: 'Kata sandi Anda butuh 4 hal:', pw_notcommon: 'bukan kata yang mudah ditebak',
    pw_show: 'Tampilkan kata sandi', pw_hide: 'Sembunyikan kata sandi',
    phone_auto: 'Kode negara Anda sudah diatur — ketuk bendera untuk mengubahnya', phone_ph_local: 'cth. 712 345 678',
    dial_t: 'Kode negara', dial_q: 'Cari negara atau kode…', dial_none: 'Atur kode',
    near_km_t: 'Rumah dalam {r} km dari Anda', near_km_empty: 'Belum ada rumah dalam {r} km dari Anda',
    near_km_d: 'Hanya rumah yang bisa Anda kunjungi langsung yang tampil di sini — buka peta untuk memperluas pencarian.',
  },
  de: {
    pw_needs: 'Dein Passwort braucht 4 Dinge:', pw_notcommon: 'kein leicht zu erratendes Wort',
    pw_show: 'Passwort zeigen', pw_hide: 'Passwort verbergen',
    phone_auto: 'Deine Landesvorwahl ist schon eingestellt — tippe auf die Flagge zum Ändern', phone_ph_local: 'z. B. 712 345 678',
    dial_t: 'Landesvorwahl', dial_q: 'Land oder Vorwahl suchen…', dial_none: 'Vorwahl wählen',
    near_km_t: 'Häuser im Umkreis von {r} km', near_km_empty: 'Noch keine Häuser im Umkreis von {r} km',
    near_km_d: 'Hier stehen nur Häuser, die du persönlich ansehen kannst — öffne die Karte für eine weitere Suche.',
  },
  ja: {
    pw_needs: 'パスワードに必要な4つのこと：', pw_notcommon: '簡単に推測できない語',
    pw_show: 'パスワードを表示', pw_hide: 'パスワードを隠す',
    phone_auto: '国コードは自動設定済み — タップして変更できます', phone_ph_local: '例 712 345 678',
    dial_t: '国コード', dial_q: '国またはコードを検索…', dial_none: 'コードを設定',
    near_km_t: 'あなたから{r}km以内の家', near_km_empty: 'まだ{r}km以内に家はありません',
    near_km_d: 'ここには実際に足を運べる家だけを表示 — 地図を開いて範囲を広げましょう。',
  },
  ko: {
    pw_needs: '비밀번호에 필요한 4가지:', pw_notcommon: '쉽게 맞힐 수 없는 단어',
    pw_show: '비밀번호 표시', pw_hide: '비밀번호 숨기기',
    phone_auto: '국가 코드가 이미 설정되어 있습니다 — 국기를 눌러 변경하세요', phone_ph_local: '예: 712 345 678',
    dial_t: '국가 코드', dial_q: '국가 또는 코드 검색…', dial_none: '코드 설정',
    near_km_t: '당신에게서 {r}km 이내의 집', near_km_empty: '아직 {r}km 이내에 집이 없습니다',
    near_km_d: '여기에는 직접 방문할 수 있는 집만 표시됩니다 — 지도를 열어 범위를 넓혀보세요.',
  },
  vi: {
    pw_needs: 'Mật khẩu của bạn cần 4 điều:', pw_notcommon: 'không phải từ dễ đoán',
    pw_show: 'Hiện mật khẩu', pw_hide: 'Ẩn mật khẩu',
    phone_auto: 'Mã quốc gia của bạn đã được đặt — chạm vào cờ để đổi', phone_ph_local: 'vd. 712 345 678',
    dial_t: 'Mã quốc gia', dial_q: 'Tìm quốc gia hoặc mã…', dial_none: 'Chọn mã',
    near_km_t: 'Nhà trong bán kính {r} km từ bạn', near_km_empty: 'Chưa có nhà nào trong bán kính {r} km từ bạn',
    near_km_d: 'Chỉ những nhà bạn có thể đến xem trực tiếp mới xuất hiện ở đây — mở bản đồ để mở rộng tìm kiếm.',
  },
  tr: {
    pw_needs: 'Şifrenizin 4 şeye ihtiyacı var:', pw_notcommon: 'kolayca tahmin edilebilecek bir kelime olmamalı',
    pw_show: 'Şifreyi göster', pw_hide: 'Şifreyi gizle',
    phone_auto: 'Ülke kodunuz zaten ayarlı — değiştirmek için bayrağa dokunun', phone_ph_local: 'örn. 712 345 678',
    dial_t: 'Ülke kodu', dial_q: 'Ülke veya kod ara…', dial_none: 'Kod seç',
    near_km_t: 'Size {r} km içindeki evler', near_km_empty: 'Henüz {r} km içinde ev yok',
    near_km_d: 'Burada yalnızca şahsen gidip görebileceğiniz evler yer alır — aramayı genişletmek için haritayı açın.',
  },
  it: {
    pw_needs: 'La tua password ha bisogno di 4 cose:', pw_notcommon: 'non una parola facile da indovinare',
    pw_show: 'Mostra password', pw_hide: 'Nascondi password',
    phone_auto: 'Il prefisso del tuo paese è già impostato — tocca la bandiera per cambiarlo', phone_ph_local: 'es. 712 345 678',
    dial_t: 'Prefisso del paese', dial_q: 'Cerca paese o prefisso…', dial_none: 'Imposta prefisso',
    near_km_t: 'Case entro {r} km da te', near_km_empty: 'Ancora nessuna casa entro {r} km da te',
    near_km_d: 'Qui compaiono solo case che puoi visitare di persona — apri la mappa per allargare la ricerca.',
  },
  fa: {
    pw_needs: 'رمز شما به 4 چیز نیاز دارد:', pw_notcommon: 'کلمه‌ای که به‌راحتی حدس زده نشود',
    pw_show: 'نمایش رمز', pw_hide: 'پنهان کردن رمز',
    phone_auto: 'کد کشور شما از قبل تنظیم شده — برای تغییر روی پرچم بزنید', phone_ph_local: 'مثلاً 712 345 678',
    dial_t: 'کد کشور', dial_q: 'جستجوی کشور یا کد…', dial_none: 'تنظیم کد',
    near_km_t: 'خانه‌های در شعاع {r} کیلومتری شما', near_km_empty: 'هنوز خانه‌ای در شعاع {r} کیلومتری شما نیست',
    near_km_d: 'این‌جا فقط خانه‌هایی دیده می‌شوند که می‌توانید حضوری ببینید — برای گسترش جست‌وجو نقشه را باز کنید.',
  },
  fil: {
    pw_needs: 'Kailangan ng password mo ang 4 na bagay:', pw_notcommon: 'hindi madaling hulaan',
    pw_show: 'Ipakita ang password', pw_hide: 'Itago ang password',
    phone_auto: 'Nakatakda na ang country code mo — pindutin ang bandila para palitan', phone_ph_local: 'hal. 712 345 678',
    dial_t: 'Country code', dial_q: 'Maghanap ng bansa o code…', dial_none: 'Itakda ang code',
    near_km_t: 'Mga bahay sa loob ng {r} km mula sa iyo', near_km_empty: 'Wala pang bahay sa loob ng {r} km mula sa iyo',
    near_km_d: 'Dito lang lumalabas ang mga bahay na puwede mong puntahan nang personal — buksan ang mapa para palawakin ang hanap.',
  },
  pl: {
    pw_needs: 'Twoje hasło potrzebuje 4 rzeczy:', pw_notcommon: 'niełatwe do odgadnięcia słowo',
    pw_show: 'Pokaż hasło', pw_hide: 'Ukryj hasło',
    phone_auto: 'Kod kraju jest już ustawiony — dotknij flagi, aby go zmienić', phone_ph_local: 'np. 712 345 678',
    dial_t: 'Kod kraju', dial_q: 'Szukaj kraju lub kodu…', dial_none: 'Ustaw kod',
    near_km_t: 'Domy w promieniu {r} km od Ciebie', near_km_empty: 'Jeszcze nie ma domów w promieniu {r} km od Ciebie',
    near_km_d: 'Pokazujemy tu tylko domy, które możesz obejrzeć osobiście — otwórz mapę, aby poszerzyć poszukiwania.',
  },
  nl: {
    pw_needs: 'Je wachtwoord heeft 4 dingen nodig:', pw_notcommon: 'geen makkelijk te raden woord',
    pw_show: 'Wachtwoord tonen', pw_hide: 'Wachtwoord verbergen',
    phone_auto: 'Je landcode is al ingesteld — tik op de vlag om te wijzigen', phone_ph_local: 'bijv. 712 345 678',
    dial_t: 'Landcode', dial_q: 'Zoek land of code…', dial_none: 'Code instellen',
    near_km_t: 'Huizen binnen {r} km van je', near_km_empty: 'Nog geen huizen binnen {r} km van je',
    near_km_d: 'Hier staan alleen huizen die je persoonlijk kunt bekijken — open de kaart om je zoekactie uit te breiden.',
  },
};

let added = 0;
for (const [lang, dict] of Object.entries(TR)) {
  const f = `${P}/scripts/tr/${lang}.json`;
  let j = {};
  try { j = JSON.parse(readFileSync(f, 'utf8')); } catch { j = {}; }
  for (const k of KEYS) j[k] = dict[k];
  writeFileSync(f, JSON.stringify(j, null, '\t') + '\n');
  added += KEYS.length;
  console.log(lang, '→', KEYS.length, 'keys');
}
console.log('total', added);
