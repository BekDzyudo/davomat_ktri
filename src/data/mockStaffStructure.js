// Institut xodimlari bo'limi hali backendga ulanmagan — https://ktri.uz/structure
// dagi rasmiy tuzilmadan olingan bo'lim/boshqarma nomlari va xodimlar soniga
// asoslangan vaqtinchalik (mock) ma'lumot. Aniq xodim ismlari kiritilmagan
// bo'limlar uchun `makeMembers` orqali generatsiya qilingan placeholder
// xodimlar ishlatiladi (backend ulanganda butunlay almashtiriladi).

const FIRST_NAMES = [
  'Aziz', 'Malika', 'Jasur', 'Kamola', 'Bekzod', 'Nilufar', 'Sardor', 'Gulnora',
  'Otabek', 'Zarina', 'Farrux', 'Shahnoza', "Ulug'bek", 'Madina', 'Davron', 'Sitora',
  'Rustam', 'Feruza', 'Anvar', 'Dilnoza', 'Sherali', 'Yulduz', 'Bobur', 'Muhabbat',
  'Sanjar', 'Gulbahor', 'Tohir', 'Nargiza', 'Islom', 'Sevinch',
]

const LAST_NAMES = [
  'Rahimov', 'Karimova', 'Yusupov', 'Nazarova', 'Tursunov', 'Abdullayeva', 'Xolmatov',
  'Ergasheva', 'Saidov', 'Umarova', 'Nematov', 'Sobirova', 'Qodirov', 'Ismoilova',
  "Jo'rayev", 'Mirzayeva', 'Ahmedov', 'Yoqubova', "G'ulomov", 'Xasanova',
]

const POSITIONS = ['Mutaxassis', 'Yetakchi mutaxassis', 'Bosh mutaxassis']

function hashSeed(label) {
  let h = 0
  for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) % 997
  return h
}

function makeMembers(label, total) {
  const seed = hashSeed(label)
  const members = []
  for (let i = 0; i < total; i++) {
    const fi = (seed * 7 + i * 3) % FIRST_NAMES.length
    const li = (seed * 5 + i * 11) % LAST_NAMES.length
    const position = i === 0 ? "Bo'lim boshlig'i" : POSITIONS[(seed + i) % POSITIONS.length]
    const mod = (seed + i) % 10
    const checkIn = mod === 0 ? null : mod <= 2 ? `09:0${mod}` : `08:${30 + ((seed + i * 3) % 29)}`
    members.push({ id: `${label}-${i}`, name: `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`, position, checkIn })
  }
  return members
}

export const staffStructure = {
  id: 'director',
  title: "Kasbiy ta'limni rivojlantirish instituti direktori",
  members: [
    {
      id: 'kadirov-xayot',
      name: 'Kadirov Xayot Sharipovich',
      position: "Kasbiy ta'limni rivojlantirish instituti direktori",
      checkIn: null,
    },
  ],
  children: [
    {
      id: 'strategik-bolim',
      title: "Strategik rivojlantirish va xalqaro aloqalar bo'limi",
      members: makeMembers('strategik', 2),
      layout: 'side',
    },
    {
      id: 'orinbosar-talim',
      title: "Direktorning kasbiy ta'limni rejalashtirish va rivojlantirish bo'yicha o'rinbosari",
      members: [
        {
          id: 'shoyqulov-baxtiyor',
          name: 'Shoyqulov Baxtiyor Bakirovich',
          position: "Direktorning kasbiy ta'limni rejalashtirish va rivojlantirish bo'yicha o'rinbosari",
          checkIn: null,
        },
      ],
      children: [
        {
          id: 'boshqarma-innovatsion',
          title: "Kasbiy ta'limni innovatsion rivojlantirish boshqarmasi",
          members: [
            { id: 'adolat-yusupova', name: 'Adolat Yusupova', position: 'Bosh mutaxassis', checkIn: '08:40' },
            { id: 'sobirjon-ravshanov', name: 'Sobirjon Ravshanov', position: 'Bosh mutaxassis', checkIn: '08:35' },
            { id: 'sherzod-raximov', name: 'Sherzod Raximov', position: "Bo'lim boshlig'i", checkIn: '08:59' },
          ],
          children: [
            {
              id: 'bolim-dasturlar',
              title: "Ta'lim dasturlarini ishlab chiqish va mehnat bozori bilan integratsiyalash bo'limi",
              members: makeMembers('dasturlar', 10),
            },
            {
              id: 'bolim-yangi-tex',
              title: "Yangi ta'lim texnologiyalarini joriy etish bo'limi",
              members: makeMembers('yangitex', 10),
            },
            {
              id: 'bolim-dual',
              title: "Dual va xalqaro ta'lim dasturlarini ishlab chiqish va muvofiqlashtirish bo'limi",
              members: makeMembers('dual', 10),
            },
          ],
        },
        {
          id: 'boshqarma-akt',
          title: 'Axborot-kommunikatsiya texnologiyalarini joriy etish boshqarmasi',
          members: [
            { id: 'karamat-dilmurodov', name: 'Karamat Dilmurodov', position: 'Bosh mutaxassis', checkIn: '09:05' },
            { id: 'tohir-xudayberganov', name: 'Tohir Xudayberganov', position: "Bo'lim boshlig'i", checkIn: '08:34' },
          ],
          children: [
            {
              id: 'lab-raqamlashtirish',
              title: "Kasbiy ta'limni raqamlashtirish laboratoriyasi",
              members: [
                { id: 'qaxramon-rozmatov', name: "Qaxramon Ro'zmatov", position: 'Yetakchi mutaxassis', checkIn: null },
                { id: 'soxib-toychiyev', name: "Soxib To'ychiyev", position: "Bo'lim boshlig'i", checkIn: '08:35' },
                { id: 'maftuna-toxtasinova', name: "Maftuna To'xtasinova", position: 'Yetakchi mutaxassis', checkIn: '08:58' },
                { id: 'otkam-umbarov', name: "O'tkam Umbarov", position: 'Yetakchi mutaxassis', checkIn: '08:56' },
                { id: 'nodira-aliyeva', name: 'Nodira Aliyeva', position: 'Mutaxassis', checkIn: '08:47' },
                { id: 'javlon-ergashev', name: 'Javlon Ergashev', position: 'Mutaxassis', checkIn: '08:52' },
              ],
            },
            {
              id: 'bolim-raqamli-kontent',
              title: "Raqamli ta'lim kontentlarini ishlab chiqish bo'limi",
              members: [
                { id: 'shoxbozbek-tuxtasinov', name: 'Shoxbozbek Tuxtasinov', position: "Bo'lim boshlig'i", checkIn: '08:58' },
                { id: 'samariddin-urinov', name: 'Samariddin Urinov', position: 'Yetakchi mutaxassis', checkIn: '08:48' },
                { id: 'doniyor-abdujalilov', name: 'Doniyor Abdujalilov', position: 'Yetakchi mutaxassis', checkIn: '09:00' },
                { id: 'rasulbek-qodirov', name: 'Rasulbek Qodirov', position: 'Yetakchi mutaxassis', checkIn: null },
                { id: 'malika-sattorova', name: 'Malika Sattorova', position: 'Mutaxassis', checkIn: '08:44' },
                { id: 'aziz-rahimov', name: 'Aziz Rahimov', position: 'Mutaxassis', checkIn: '08:59' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'orinbosar-malaka',
      title: "Malaka oshirish va qayta tayyorlash bo'yicha direktor o'rinbosari",
      members: [
        {
          id: 'temirov-xushnud',
          name: 'Temirov Xushnud Jamolovich',
          position: "Malaka oshirish va qayta tayyorlash bo'yicha direktor o'rinbosari",
          checkIn: null,
        },
      ],
      children: [
        {
          id: 'boshqarma-oquv-metodik',
          title: "Malaka oshirish va qayta tayyorlash jarayonini o'quv-metodik ta'minlash boshqarmasi",
          members: makeMembers('oquvmetodik', 3),
          children: [
            {
              id: 'bolim-kadrlar-tashkil',
              title: "Kadrlarni qayta tayyorlash va malaka oshirishni tashkil etish bo'limi",
              members: makeMembers('kadrlartashkil', 4),
            },
            {
              id: 'bolim-sifat-monitoring',
              title: "Ta'lim sifatini baholash va monitoring bo'limi",
              members: makeMembers('sifatmonitoring', 3),
            },
            {
              id: 'bolim-ilmiy-transfer',
              title: "Ilmiy tadqiqotlar, fan va ta'lim texnologiyalari transfer bo'limi",
              members: makeMembers('ilmiytransfer', 3),
            },
          ],
        },
        {
          id: 'fakultet-boshqaruv-kadrlar',
          title: "Kasbiy ta'lim boshqaruv kadrlarini qayta tayyorlash va malakasini oshirish fakulteti",
          members: makeMembers('boshqaruvkadrlar', 3),
          children: [
            { id: 'kafedralar', title: 'Kafedralar', members: makeMembers('kafedralar', 15) },
            {
              id: 'texnikum-fakultetlari',
              title:
                "Ilg'or kasbiy mahorat texnikumlaridagi institutning qayta tayyorlash va malaka oshirish fakultetlari",
              members: makeMembers('texnikumfak', 10),
            },
          ],
        },
      ],
    },
    {
      id: 'orinbosar-moliya',
      title: "Moliyaviy va iqtisodiy masalalar bo'yicha direktor o'rinbosari",
      members: [
        {
          id: 'muxammadyunusova-moxistara',
          name: 'Muxammadyunusova Moxistara Muxammadilxom qizi',
          position: "Moliyaviy va iqtisodiy masalalar bo'yicha direktor o'rinbosari",
          checkIn: null,
        },
      ],
      children: [
        { id: 'bolim-buxgalteriya', title: "Buxgalteriya va moliya-iqtisod bo'limi", members: makeMembers('buxgalteriya', 3) },
        { id: 'devonxona-arxiv', title: 'Devonxona va arxiv', members: makeMembers('devonxona', 2) },
        { id: 'bolim-hujjatlar', title: "Qat'iy tartibdagi hujjatlar bilan ishlash bo'limi", members: makeMembers('hujjatlar', 3) },
        { id: 'bolim-xojalik', title: "Xo'jalik-foydalanish bo'limi", members: makeMembers('xojalik', 10) },
      ],
    },
    {
      id: 'inson-resurslari-bolim',
      title: "Inson resurslarini rivojlantirish va boshqarish bo'limi",
      members: makeMembers('insonresurslari', 2),
      layout: 'side',
    },
  ],
}
