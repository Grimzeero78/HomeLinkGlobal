// Owner fixes round 2: add v_bedsitter + units_vac_l, rewrite units_hint in every tr/{lang}.json
import { readFileSync, writeFileSync } from 'fs';
const P = '/home/z/my-project/HuntInGlobal';
const LANGS = ['en','sw','es','fr','pt','ar','hi','bn','zh','ru','ur','id','de','ja','ko','vi','tr','it','fa','fil','pl','nl'];
const K = {
  v_bedsitter: {
    en:'Bedsitter', sw:'Bedsitter', es:'Habitación-estudio', fr:'Chambre-studio', pt:'Quarto-sala',
    ar:'غرفة وصالة', hi:'बेडसिटर', bn:'বেডসিটার', zh:'单间公寓', ru:'Комната-студия', ur:'بیڈ سٹر',
    id:'Kamar studio', de:'Einzimmerwohnung', ja:'ワンルーム', ko:'원룸', vi:'Phòng trọ một phòng',
    tr:'Tek odalı ev', it:'Camera-studio', fa:'اتاق و آشپزخانه', fil:'Kuwarto-sala', pl:'Pokój z aneksem', nl:'Kamer met kookhoek',
  },
  units_vac_l: {
    en:'How many vacant units are available?', sw:'Ni vyumba tupu ngapi vinavyopatikana?',
    es:'¿Cuántas unidades vacantes hay disponibles?', fr:"Combien d'unités vacantes sont disponibles ?",
    pt:'Quantas unidades vagas há disponíveis?', ar:'كم وحدة شاغرة متاحة؟',
    hi:'कितनी खाली यूनिट उपलब्ध हैं?', bn:'কতগুলো খালি ইউনিট পাওয়া যাচ্ছে?', zh:'有几间空房可租？',
    ru:'Сколько свободных юнитов доступно?', ur:'کتنی خالی یونٹس دستیاب ہیں؟', id:'Berapa unit kosong yang tersedia?',
    de:'Wie viele freie Einheiten sind verfügbar?', ja:'空室は何室ありますか？', ko:'빈 유닛이 몇 개 있나요?',
    vi:'Có bao nhiêu phòng trống?', tr:'Kaç boş ünite mevcut?', it:'Quante unità libere sono disponibili?',
    fa:'چند واحد خالی موجود است؟', fil:'Ilang bakanteng unit ang available?', pl:'Ile wolnych lokali jest dostępnych?',
    nl:'Hoeveel vrije eenheden zijn er beschikbaar?',
  },
  units_hint: {
    en:'Renters see exactly this — how many vacant rooms are available to move into right now. Update the count anytime in <b>My listings</b> as rooms fill.',
    sw:'Wapangaji huona hivi hasa — ni vyumba tupu ngapi vinavyopatikana kwa kuhamia sasa hivi. Sasisha idadi wakati wowote kwenye <b>Matangazo yangu</b> kadiri vyumba vinapojaa.',
    es:'Los inquilinos ven exactamente esto: cuántas habitaciones vacantes hay disponibles para mudarse ahora mismo. Actualiza el número cuando quieras en <b>Mis anuncios</b> a medida que se llenen.',
    fr:'Les locataires voient exactement ceci : combien de chambres vacantes sont disponibles pour emménager dès maintenant. Mettez le nombre à jour à tout moment dans <b>Mes annonces</b> à mesure qu\'elles se remplissent.',
    pt:'Os inquilinos veem exatamente isto: quantas casas vagas estão disponíveis para mudar agora mesmo. Atualize o número a qualquer momento em <b>Meus anúncios</b> à medida que as casas se encherm.',
    ar:'يرى المستأجرون بالضبط هذا: كم غرفة شاغرة متاحة للانتقال إليها الآن. حدِّث العدد في أي وقت من <b>إعلاناتي</b> كلما امتلأت الغرف.',
    hi:'किरायेदार ठीक यही देखते हैं — अभी कितने खाली कमरे शिफ्ट होने के लिए उपलब्ध हैं। कमरे भरते जाने पर <b>मेरे लिस्टिंग</b> में कभी भी संख्या अपडेट करें।',
    bn:'ভাড়াটিরা ঠিক এটাই দেখে — এখন কতগুলো খালি ঘরে ওঠা যাবে। ঘর ভরতে থাকলে <b>আমার লিস্টিং</b>-এ যেকোনো সময় সংখ্যা আপডেট করুন।',
    zh:'租客看到的正是这个——现在有几间空房可以立即入住。房间住满后，随时可以在<b>我的房源</b>里更新数量。',
    ru:'Арендаторы видят именно это — сколько свободных комнат доступно для заселения прямо сейчас. Обновляйте число в любое время в <b>Моих объявлениях</b> по мере заполнения.',
    ur:'کرایہ دار بالکل یہی دیکھتے ہیں — ابھی کتنے خالی کمرے فوراً رہائش کے لیے دستیاب ہیں۔ کمرے بھرتے جائیں تو <b>میری لسٹنگز</b> میں کبھی بھی تعداد اپ ڈیٹ کریں۔',
    id:'Penyewa melihat persis ini — berapa banyak kamar kosong yang bisa ditempati sekarang. Perbarui jumlahnya kapan saja di <b>Listings saya</b> seiring kamar terisi.',
    de:'Mieter sehen genau das — wie viele freie Zimmer sofort zum Einzug verfügbar sind. Aktualisiere die Zahl jederzeit unter <b>Meine Inserate</b>, während sich Zimmer füllen.',
    ja:'入居者が見るのはまさにこれ — 今すぐ入れる空き部屋の数です。埋まるにつれて<b>マイリスティング</b>でいつでも更新できます。',
    ko:'세입자에게 보이는 것은 바로 이것 — 지금 바로 입주할 수 있는 빈방 수입니다. 방이 찰 때마다 <b>내 숙소 목록</b>에서 언제든 업데이트하세요.',
    vi:'Người thuê thấy chính xác điều này — hiện có bao nhiêu phòng trống để vào ở ngay. Cập nhật số lượng bất cứ lúc nào trong <b>Tin đăng của tôi</b> khi phòng dần đầy.',
    tr:'Kiracılar tam olarak bunu görür — hemen taşınılabilecek kaç boş oda var. Odalar doldukça <b>İlanlarım</b> bölümünden sayıyı istediğin zaman güncelle.',
    it:'Gli inquilini vedono esattamente questo — quante stanze libere sono disponibili per traslocare subito. Aggiorna il numero quando vuoi in <b>I miei annunci</b> man mano che si riempiono.',
    fa:'مستأجرها دقیقاً همین را می‌بینند — چند اتاق خالی برای اسباب‌کشی فوری موجود است. هر وقت خواستید در <b>آگهی‌های من</b> عدد را به‌روز کنید.',
    fil:'Eksaktong ito ang nakikita ng mga nangungupahan — ilang bakanteng kuwarto ang pwedeng lipatan ngayon. I-update ang bilang anumang oras sa <b>Mga listing ko</b> habang napupuno ang mga kuwarto.',
    pl:'Najemcy widzą dokładnie to — ile wolnych pokoi jest dostępnych do natychmiastowego zamieszkania. Aktualizuj liczbę w dowolnym momencie w <b>Moje ogłoszenia</b> w miarę zapełniania pokoi.',
    nl:'Huurders zien precies dit — hoeveel vrije kamers er nu meteen beschikbaar zijn om in te trekken. Werk het aantal altijd bij in <b>Mijn advertenties</b> naarmate kamers vol raken.',
  },
};
let n = 0;
for (const lang of LANGS) {
  const f = `${P}/scripts/tr/${lang}.json`;
  const d = JSON.parse(readFileSync(f, 'utf8'));
  for (const [k, m] of Object.entries(K)) d[k] = m[lang];
  writeFileSync(f, JSON.stringify(d, null, 1) + '\n');
  n++;
}
console.log(`patched ${n} tr files`);
