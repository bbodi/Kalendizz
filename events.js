/**
 * =====================================================
 * EVENTS DEFINITION
 * =====================================================
 * 
 * To add a new event, copy the template below
 * and add it to the EVENTS array:
 * 
 * {
 *   id: 'unique-id',            // Unique identifier
 *   title: 'Event name',        // Display name
 *   link: 'https://...',        // Link URL (opens on click)
 *   image: 'https://...',       // Cover image URL (shows on hover)
 *   start: '2026-01-15',        // Start date (YYYY-MM-DD)
 *   end: '2026-01-15',          // End date (YYYY-MM-DD)
 *   color: '#ffffff',           // Text color (optional)
 *   backgroundColor: '#03bd9e'  // Background color (optional)
 * }
 * 
 * =====================================================
 */

const EVENTS = [
  {
    id: 'evt-1',
    flag: '🇵🇱',
    title: 'Exodus Kizomba Congress - IV Edition',
    start: '2026-01-28',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/534072715666146',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/541493749_814749354437661_1485437284540262103_n-1024x537.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-2',
    flag: '🇬🇧',
    title: 'ABCD Festival 2026',
    start: '2026-01-29',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/1004319487956017',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/495813682_1291098259690651_3833006027626830639_n-1024x379.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-3',
    flag: '🇺🇸',
    title: 'New York SBKZ Congress',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/966984131673331',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/528600441_747310308224293_3831503578117871924_n-1024x379.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-4',
    flag: '🇨🇭',
    title: 'BERN IS KIZOMBA WEEKEND 2026',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/1163418868792582',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/540595534_1238077408331206_2849132326752099888_n-1024x576.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-5',
    flag: '🇫🇷',
    title: 'HAKUNA MATATA FESTIVAL',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/2653617304834345',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/531448293_633249593141403_7077100280836580302_n-819x1024.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-6',
    flag: '🇨🇭',
    title: 'Urban Kiz Temptation Festival',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/1772576683461891',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/542757491_122267005490029136_6097713128918031722_n-819x1024.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-7',
    title: 'Urban Kiz Temptation Bodensee',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/1772576683461891',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/542757491_122267005490029136_6097713128918031722_n-1-819x1024.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-8',
    flag: '🇧🇪',
    title: 'LATIN DREAMS FESTIVAL 2026',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/3821866304746520',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/572018524_1358939112691379_4249799341609326264_n-1024x536.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-9',
    title: "🇫🇷So'Nice Bachata & Kizomba Masters",
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/2772257682983062',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/490902041_1241623380729002_4237435645217163362_n-1024x536.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-10',
    flag: '🇵🇹',
    title: 'SABOR A CABO VERDE Festival',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/643976074711407',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/504555308_1273483681453398_8865087791522336610_n-819x1024.jpg',
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-11',
    flag: '🇷🇴',
    title: 'Queens & Kings - Royals of Kiz',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/994110349372920',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/499634672_122228689178216946_3821152380252513274_n-1024x379.jpeg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-12',
    title: 'TA BOM African Rhythms',
    start: '2026-01-30',
    end: '2026-02-01',
    link: 'https://www.facebook.com/events/9676477769049285',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/488888333_999865425614460_2236531616901068959_n-1024x379.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-13',
    flag: '🇸🇮',
    title: 'KIZZ KISS Festival 2026',
    start: '2026-02-05',
    end: '2026-02-08',
    link: 'https://www.facebook.com/events/1197320138404954',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/500257989_1130711345755563_2677424750842130774_n-1024x533.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-14',
    flag: '🇩🇿',
    title: 'Algeria Festival Bordeaux 5',
    start: '2026-02-05',
    end: '2026-02-08',
    link: 'https://www.facebook.com/events/652078487361267',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/541695448_801293535745362_2800985698789975512_n-671x1024.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-15',
    flag: '🇨🇿',
    title: 'PRAGUE KWANZA FESTIVAL 2026',
    start: '2026-02-05',
    end: '2026-02-08',
    link: 'https://www.facebook.com/events/958645879237331',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/492067253_1317635819826047_7590985807104887025_n-1024x536.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-16',
    flag: '🇫🇷',
    title: 'BE COOL FESTIVAL 4 Edition',
    start: '2026-02-06',
    end: '2026-02-08',
    link: 'https://www.facebook.com/events/1193376698880948',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/498130314_2527370037603037_7221174210956689629_n-1-1024x534.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-17',
    flag: '🇦🇴',
    title: 'WE LOVE ANGOLA Trip 2026',
    start: '2026-02-10',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/644437561501724',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/480277085_122149929260383492_630689249345421622_n-1024x536.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-18',
    flag: '🇩🇪',
    title: 'SAMSTAG DA MUXIMA IV',
    start: '2026-02-13',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/609427632250942',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/486452940_673150271815578_8149851464266408537_n-819x1024.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-19',
    flag: '🇫🇮',
    title: 'Kiz&Connect Weekender',
    start: '2026-02-13',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/1377297003825782',
    image: 'https://kizomba-world.com/wp-content/uploads/2026/01/615284433_122150964236894053_2150358929333682753_n-3-1024x576.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-20',
    flag: '🇪🇸',
    title: 'MAGIC WINTER 2026 VIGO',
    start: '2026-02-13',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/1099805625131175',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/544567605_642613348899531_4209675225197152413_n-1024x576.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-21',
    flag: '🇫🇷',
    title: 'Kizatours Afro Legacy Festival',
    start: '2026-02-13',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/1669984580259811',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/485028198_939352735025416_7942292994800766363_n-1024x536.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-22',
    flag: '🇫🇷',
    title: 'Back 2 Basic Kizomba Winter',
    start: '2026-02-13',
    end: '2026-02-15',
    link: 'https://www.facebook.com/events/1318845236103416',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/514965555_1301946138605101_5902702015255730633_n-1024x534.jpg',
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-23',
    title: 'BK Caribbean Sensation Cruise',
    start: '2026-02-19',
    end: '2026-02-22',
    link: 'https://www.facebook.com/events/960325165491432',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/473049737_122100052196725339_6221014015856323080_n-1024x536.jpg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-24',
    flag: '🇫🇷',
    title: 'Wakanda Festival Paris 5th',
    start: '2026-02-19',
    end: '2026-02-22',
    link: 'https://www.facebook.com/events/1840625616753828',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/480978890_942253341325715_8177712493088071091_n-1024x430.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-25',
    flag: '🇫🇷',
    title: 'FREEDOM ROMANTIC FESTIVAL 9',
    start: '2026-02-20',
    end: '2026-02-22',
    link: 'https://www.facebook.com/events/656495683568934',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/518353100_1865155240740806_5236100282639269394_n-1024x532.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-26',
    title: "L'immersion Caribbean Dream",
    start: '2026-02-21',
    end: '2026-02-22',
    link: 'https://www.facebook.com/events/918132140078543',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/485597444_651448190974864_5882259482024275207_n-1024x534.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-27',
    flag: '🇲🇽',
    title: 'MKC + LOGIA 2026 SURVIVORS',
    start: '2026-02-26',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/1007054967956410',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/491913698_1263772281877942_506627479780281778_n-819x1024.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-28',
    flag: '🇭🇷',
    title: 'Baila Conmigo Congress Latino',
    start: '2026-02-27',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/976777167965822',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/487216417_122184286436266054_8231893921377046020_n-1024x577.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-29',
    flag: '🇵🇹',
    title: 'Eme Kia Festival',
    start: '2026-02-27',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/690548050082278',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/491088362_597933649950198_8937725698738044368_n-1024x534.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-30',
    flag: '🇫🇷',
    title: 'LATINA SOL KIZ FESTIVAL',
    start: '2026-02-27',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/640614591781073',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/536658878_122118417950946854_5142850053373189152_n-1024x576.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-31',
    flag: '🇸🇪',
    title: 'DIAMONDS FOREVER EDITION 3',
    start: '2026-02-27',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/1393534388522086',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/535552556_1836981443842315_3645824195186685364_n-1024x536.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-32',
    flag: '🇪🇸',
    title: 'VI SBK WEEKEND OURENSE',
    start: '2026-02-27',
    end: '2026-03-01',
    link: 'https://www.facebook.com/events/727158222970961',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/500349285_1105665741599120_827803536514564508_n-724x1024.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-33',
    flag: '🇪🇪',
    title: 'KIZOMBA TALLINN FESTIVAL 2026',
    start: '2026-03-05',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/918959480410135',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/514088552_735069248900295_1230525090355696490_n-1024x581.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-34',
    flag: '🇧🇬',
    title: '15TH Intl Salsa Bachata Kizomba',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/1071071021772535',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/552384444_1391726736288298_853664064980720169_n-1024x577.jpeg',
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-35',
    flag: '🇵🇭',
    title: 'Boracay Latin Dance Festival',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/763922692947707',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/499670545_1279848284142764_1764604651546050752_n.jpg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-36',
    flag: '🇵🇹',
    title: 'Djumbai Afro Festival 5th',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/938658478477525',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/493093656_1233815015421718_6327881903742187709_n-1024x1024.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-37',
    flag: '🇩🇪',
    title: 'Royalkizz 5th Edition',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/940213301617116',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/487088164_10228820840094079_4900095985990768093_n-1024x533.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-38',
    flag: '🇫🇷',
    title: 'Eclipse Kizomba Festival 2nd',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/1429530971499668',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/515506400_122210370482089342_526924187275302832_n-1024x536.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-39',
    flag: '🇨🇭',
    title: 'SHATTAKIZ WEEKENDER',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/1429530971499668',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/528749724_2262685357478291_4588482001557100732_n-1024x534.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-40',
    flag: '🇫🇷',
    title: 'Je Veux Juste Danser 3',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/698934832945973',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/544987985_24768356166121527_8533833420898444519_n-1024x859.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-41',
    flag: '🇫🇷',
    title: 'WEEK-END A DANSER IV',
    start: '2026-03-06',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/1198016791737914',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/544898011_122251791284235580_2849749885060139399_n-1024x576.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-42',
    title: 'Kyiv Dance Festival GRAND',
    start: '2026-03-07',
    end: '2026-03-08',
    link: 'https://www.facebook.com/events/2262568250872408',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/561156520_1218069577027663_3217454692809969430_n-1024x576.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-43',
    flag: '🇫🇷',
    title: 'I WILL DANCE Festival 5',
    start: '2026-03-12',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/1197400349059658',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/501608130_1021584523497454_7652334188606921294_n-1024x536.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-44',
    flag: '🇷🇴',
    title: 'Carpathian Latino Fest 5th',
    start: '2026-03-12',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/1062121732511799',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/549394614_122176930904538761_4460024133327282813_n-1024x576.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-45',
    flag: '🇷🇴',
    title: 'Angolan Dances Weekend Romania',
    start: '2026-03-13',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/865899973039528',
    image: 'https://kizomba-world.com/wp-content/uploads/2026/01/603729261_859455946838305_869553867875428705_n-1024x641.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-46',
    flag: '🇨🇦',
    title: 'SEMPRE KIZOMBA SEMBA WEEKENDER',
    start: '2026-03-13',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/800843099011660',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/555042771_801147319537386_9126548649145793946_n-1024x576.jpg',
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-47',
    flag: '🇮🇹',
    title: 'KARMA International Festival',
    start: '2026-03-13',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/1393271762395803',
    image: 'https://kizomba-world.com/wp-content/uploads/2026/01/616108154_1399102672227214_4480051643991144594_n-2-733x1024.jpg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-48',
    flag: '🇪🇸',
    title: 'KIM MADRID 2026',
    start: '2026-03-13',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/724735086766217',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/512672796_1146987507470366_9107148148690188516_n.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-49',
    flag: '🇨🇭',
    title: 'TENTAÇÃO WINTER Zurich',
    start: '2026-03-13',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/725893219988431',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/552490720_10228785373490794_1185221868849932898_n-1024x534.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-50',
    flag: '🇫🇷',
    title: 'Ski Latino 26 La Plagne',
    start: '2026-03-14',
    end: '2026-03-15',
    link: 'https://www.facebook.com/events/713872781717527',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/563432110_1298878538703401_7419520215659822633_n-1024x536.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-51',
    flag: '🇩🇪',
    title: 'Wonderland Berlin Festival',
    start: '2026-03-18',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/649411800910622',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/549791344_755700050626948_7655708048844471884_n-1024x512.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-52',
    flag: '🇹🇷',
    title: 'ISTANBUL WORLD DANCE CONGRESS',
    start: '2026-03-18',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/1827036121222164',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/547762729_122174803220577624_8726416500825362454_n-1024x384.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-53',
    flag: '🇪🇸',
    title: 'La Kizomba Festival 2nd',
    start: '2026-03-20',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/1380124799664558',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/488079656_122124956948714213_2354779070397767733_n-1024x576.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-54',
    flag: '🇮🇹',
    title: 'LoveMI Kizomba Festival 2nd',
    start: '2026-03-20',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/1467399280884164',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/526653457_122174787416379000_7517335946403928163_n-1024x577.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-55',
    flag: '🇦🇹',
    title: 'Kizbomba Evolution 2026',
    start: '2026-03-20',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/676820304797988',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/497125258_1250943027033594_7333242999221147121_n-1024x530.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-56',
    flag: '🇬🇧',
    title: 'Kizomba Festival London Spring',
    start: '2026-03-20',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/1435063530871256',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/520569133_122174238122445246_4338348479865493542_n-1024x575.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-57',
    flag: '🇪🇸',
    title: 'LOVES KIZOMBA ORIGINS 2026',
    start: '2026-03-20',
    end: '2026-03-22',
    link: 'https://www.facebook.com/events/1170700618133393',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/487703890_122130248000675149_1767781404712637348_n-724x1024.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-58',
    flag: '🇮🇹',
    title: 'SIN FRONTERAS Taormina Sicily',
    start: '2026-03-26',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/535390966178565',
    image: null,
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-59',
    flag: '🇺🇸',
    title: 'DC Cherry Blossom Kizomba',
    start: '2026-03-26',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/1582417556051395',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/496925774_1214651397116394_3975199078060948576_n.jpg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-60',
    flag: '🇷🇴',
    title: 'Cluj Kizomba Festival 8th',
    start: '2026-03-26',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/1312174937220660',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/531404583_1319059586891730_1322627657309668272_n-1024x537.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-61',
    title: 'Black & White Intl Congress',
    start: '2026-03-26',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/531753026187350',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/515437065_1117979167046328_7934209274925781775_n-1024x536.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-62',
    flag: '🇫🇷',
    title: 'KIZ RELAX MTP FESTIVAL 3',
    start: '2026-03-27',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/679133424574928',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/543095813_122241082670242868_3623856054048782055_n-1024x576.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-63',
    flag: '🇫🇷',
    title: 'Dax Kizomba Weekender',
    start: '2026-03-27',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/1266813371844083',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/550926077_10235707733301341_7484576297760270608_n-1024x576.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-64',
    flag: '🇳🇱',
    title: 'Amsterdam KizzArena Spring',
    start: '2026-03-27',
    end: '2026-03-29',
    link: 'https://www.facebook.com/events/2416473305415278',
    image: 'https://kizomba-world.com/wp-content/uploads/2026/01/558819835_1117639647167522_6055157178263752487_n-1024x986.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-65',
    flag: '🇧🇪',
    title: 'Suave Dance Festival Easter',
    start: '2026-04-02',
    end: '2026-04-05',
    link: 'https://www.facebook.com/events/1857909168145945',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/597861553_122109632787102503_4607205757282900797_n-1024x534.jpg',
    backgroundColor: '#e67e22',
    color: '#ffffff'
  },
  {
    id: 'evt-66',
    flag: '🇳🇱',
    title: 'I Love Kizomba Rotterdam 2nd',
    start: '2026-04-03',
    end: '2026-04-05',
    link: 'https://www.facebook.com/events/1874003083464281',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/559474675_1615954173169488_2020447630730124116_n-2.jpg',
    backgroundColor: '#2ecc71',
    color: '#ffffff'
  },
  {
    id: 'evt-67',
    flag: '🇨🇦',
    title: 'Victoria Intl Kizomba 7th',
    start: '2026-04-03',
    end: '2026-04-05',
    link: 'https://www.facebook.com/events/1018836737121988',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/518412439_122163228344546711_5077946707010456115_n-1024x1024.jpg',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  {
    id: 'evt-68',
    flag: '🇭🇺',
    title: 'Diamond Kizomba Festival',
    start: '2026-04-03',
    end: '2026-04-05',
    link: 'https://www.facebook.com/events/1910777399750539',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/09/493524528_122111003576832409_5849709409154574045_n-1024x534.jpg',
    backgroundColor: '#e91e63',
    color: '#ffffff'
  },
  {
    id: 'evt-69',
    flag: '🇫🇷',
    title: 'Pau Royal Kizomba 3rd',
    start: '2026-04-03',
    end: '2026-04-05',
    link: 'https://www.facebook.com/events/648144664519621',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/518504254_10231223531716907_866190242714709714_n-1024x576.jpg',
    backgroundColor: '#00bcd4',
    color: '#ffffff'
  },
  {
    id: 'evt-70',
    flag: '🇪🇸',
    title: 'Hot Tropical Dance Málaga',
    start: '2026-04-08',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/1960971431409094/',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/505446990_1183945410202554_682145148841910254_n-817x1024.jpg',
    backgroundColor: '#ff5722',
    color: '#ffffff'
  },
  {
    id: 'evt-71',
    flag: '🇹🇭',
    title: 'Coco Loco Pattaya Latin',
    start: '2026-04-09',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/2996840950495777',
    image: 'https://kizomba-world.com/wp-content/uploads/2026/01/517594603_122116508588910792_2699562321340163909_n.jpg',
    backgroundColor: '#673ab7',
    color: '#ffffff'
  },
  {
    id: 'evt-72',
    flag: '🇵🇱',
    title: 'Frenzy Easter Edition 2026',
    start: '2026-04-09',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/1192824395900705/',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/566208149_843773821512559_6743152380130309097_n-1024x534.jpg',
    backgroundColor: '#795548',
    color: '#ffffff'
  },
  {
    id: 'evt-73',
    flag: '🇫🇷',
    title: 'TARRAXO SPRING LYON 4th',
    start: '2026-04-09',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/3510412992588021',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/10/540970993_802583228763278_8223902592749535257_n-1024x534.jpg',
    backgroundColor: '#e74c3c',
    color: '#ffffff'
  },
  {
    id: 'evt-74',
    flag: '🇧🇪',
    title: 'KIZZ ME BACHAMORE Belgium',
    start: '2026-04-10',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/1198289688348884',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/565671933_1133804948889162_3557652580408353260_n-1024x537.jpg',
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  {
    id: 'evt-75',
    flag: '🇮🇹',
    title: 'Crazy Kiz Spring Italy 4.0',
    start: '2026-04-10',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/1848449342665305',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/583324253_1163120049294485_3683689477407079947_n-819x1024.jpg',
    backgroundColor: '#9b59b6',
    color: '#ffffff'
  },
  {
    id: 'evt-76',
    flag: '🇩🇪',
    title: 'Treveris Dance Festival',
    start: '2026-04-10',
    end: '2026-04-12',
    link: 'https://www.facebook.com/events/1012020030748728',
    image: 'https://kizomba-world.com/wp-content/uploads/2025/11/580565707_122146479146723584_7761510578485224642_n-1024x534.jpg',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-77',
    // flag: '🇦🇱',
    title: 'Albania Kizomba Festival',
    start: '2026-10-07',
    end: '2026-10-13',
    link: 'https://www.facebook.com/events/1814520295937385/',
    image: '',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-78',
    flag: '🇳🇱',
    title: 'FlavourKizz',
    start: '2026-11-12',
    end: '2026-11-15',
    link: 'https://www.facebook.com/events/1609516733388732',
    image: '',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-79',
    flag: '🇷🇴',
    title: 'Alchemey Kizomba Festival',
    start: '2026-07-31',
    end: '2026-08-02',
    link: 'https://www.facebook.com/events/1603262817709390',
    image: '',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  },
  {
    id: 'evt-80',
    flag: '🇦🇹',
    title: 'Crystal Kizomba Congress',
    start: '2026-04-16',
    end: '2026-04-19',
    link: 'https://www.facebook.com/events/766742382918080',
    image: '',
    backgroundColor: '#1abc9c',
    color: '#ffffff'
  }
];

// Do not modify the line below!
window.EVENTS = EVENTS;
