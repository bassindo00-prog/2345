const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleCatalogs = [
  // ─── 1. RPH Music Publishing ──────────────────────────────────────────────────
  {
    songId: 'PUB-RPH-001',
    title: 'ADA AKU DISINI',
    artist: 'DESTA MAHENRA',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=ADA+AKU+DISINI+DESTA+MAHENRA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('ADA AKU DISINI DESTA MAHENRA')
  },
  {
    songId: 'PUB-RPH-002',
    title: 'KETIKA TANGAN DAN KAKI BERKATA',
    artist: 'CHRISYE',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KETIKA+TANGAN+DAN+KAKI+BERKATA+CHRISYE',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KETIKA TANGAN DAN KAKI BERKATA CHRISYE')
  },
  {
    songId: 'PUB-RPH-003',
    title: 'TOMBO ATI',
    artist: 'OPICK',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TOMBO+ATI+OPICK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('TOMBO ATI OPICK')
  },
  {
    songId: 'PUB-RPH-004',
    title: 'RAPUH',
    artist: 'OPICK',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=RAPUH+OPICK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('RAPUH OPICK')
  },
  {
    songId: 'PUB-RPH-005',
    title: 'RAMADHAN TIBA',
    artist: 'OPICK',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=RAMADHAN+TIBA+OPICK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('RAMADHAN TIBA OPICK')
  },
  {
    songId: 'PUB-RPH-006',
    title: 'DENGAN NAFAS-MU',
    artist: 'UNGU',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DENGAN+NAFASMU+UNGU',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DENGAN NAFAS-MU UNGU')
  },
  {
    songId: 'PUB-RPH-007',
    title: 'PARA PENCARI-MU',
    artist: 'UNGU',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PARA+PENCARIMU+UNGU',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PARA PENCARI-MU UNGU')
  },
  {
    songId: 'PUB-RPH-008',
    title: 'ANDAI KU TAHU',
    artist: 'UNGU',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=ANDAI+KU+TAHU+UNGU',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('ANDAI KU TAHU UNGU')
  },
  {
    songId: 'PUB-RPH-009',
    title: 'CINTA RASUL',
    artist: 'HADDAD ALWI & SULIS',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CINTA+RASUL+HADDAD+ALWI+SULIS',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CINTA RASUL HADDAD ALWI SULIS')
  },
  {
    songId: 'PUB-RPH-010',
    title: 'SAJADAH PANJANG',
    artist: 'BIMBO',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SAJADAH+PANJANG+BIMBO',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SAJADAH PANJANG BIMBO')
  },
  {
    songId: 'PUB-RPH-011',
    title: 'RINDU RASUL',
    artist: 'BIMBO',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=RINDU+RASUL+BIMBO',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('RINDU RASUL BIMBO')
  },
  {
    songId: 'PUB-RPH-012',
    title: 'PINTU SORGA',
    artist: 'GIGI',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PINTU+SORGA+GIGI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PINTU SORGA GIGI')
  },
  {
    songId: 'PUB-RPH-013',
    title: 'PERDAMAIAN',
    artist: 'GIGI',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PERDAMAIAN+GIGI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PERDAMAIAN GIGI')
  },
  {
    songId: 'PUB-RPH-014',
    title: 'CARI BERKAH (CABE)',
    artist: 'WALI',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CARI+BERKAH+WALI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CARI BERKAH WALI')
  },
  {
    songId: 'PUB-RPH-015',
    title: 'TOBAT MAKSIAT (TOMAT)',
    artist: 'WALI',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TOBAT+MAKSIAT+WALI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('TOBAT MAKSIAT WALI')
  },

  // ─── 2. Halo Entertainment Indonesia (HEI) ────────────────────────────────────
  {
    songId: 'PUB-HEI-001',
    title: 'PESONA SENJA',
    artist: 'LINTANG KEMUKUS',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PESONA+SENJA+LINTANG+KEMUKUS',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PESONA SENJA LINTANG KEMUKUS')
  },
  {
    songId: 'PUB-HEI-002',
    title: 'BIDADARI TAK BERSAYAP',
    artist: 'ANJI',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BIDADARI+TAK+BERSAYAP+ANJI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('BIDADARI TAK BERSAYAP ANJI')
  },
  {
    songId: 'PUB-HEI-003',
    title: 'SURAT CINTA UNTUK STARLA',
    artist: 'VIRGOUN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SURAT+CINTA+UNTUK+STARLA+VIRGOUN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SURAT CINTA UNTUK STARLA VIRGOUN')
  },
  {
    songId: 'PUB-HEI-004',
    title: 'BUKTI',
    artist: 'VIRGOUN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BUKTI+VIRGOUN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('BUKTI VIRGOUN')
  },
  {
    songId: 'PUB-HEI-005',
    title: 'SELAMAT (SELAMAT TINGGAL)',
    artist: 'VIRGOUN FT. AUDY',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SELAMAT+SELAMAT+TINGGAL+VIRGOUN+AUDY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SELAMAT TINGGAL VIRGOUN AUDY')
  },
  {
    songId: 'PUB-HEI-006',
    title: 'SAAT BAHAGIA',
    artist: 'UNGU FT. ANDIEN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SAAT+BAHAGIA+UNGU+ANDIEN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SAAT BAHAGIA UNGU ANDIEN')
  },
  {
    songId: 'PUB-HEI-007',
    title: 'DIA',
    artist: 'ANJI',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DIA+ANJI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DIA ANJI')
  },
  {
    songId: 'PUB-HEI-008',
    title: 'MENUNGGU KAMU',
    artist: 'ANJI',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MENUNGGU+KAMU+ANJI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MENUNGGU KAMU ANJI')
  },
  {
    songId: 'PUB-HEI-009',
    title: 'PEDIH',
    artist: 'LAST CHILD',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PEDIH+LAST+CHILD',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PEDIH LAST CHILD')
  },
  {
    songId: 'PUB-HEI-010',
    title: 'DUKA',
    artist: 'LAST CHILD',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DUKA+LAST+CHILD',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DUKA LAST CHILD')
  },
  {
    songId: 'PUB-HEI-011',
    title: 'DIARY DEPRESIKU',
    artist: 'LAST CHILD',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DIARY+DEPRESIKU+LAST+CHILD',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DIARY DEPRESIKU LAST CHILD')
  },
  {
    songId: 'PUB-HEI-012',
    title: 'PERGI PAGI PULANG PAGI',
    artist: 'ARMADA',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PERGI+PAGI+PULANG+PAGI+ARMADA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PERGI PAGI PULANG PAGI ARMADA')
  },
  {
    songId: 'PUB-HEI-013',
    title: 'ASAL KAU BAHAGIA',
    artist: 'ARMADA',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=ASAL+KAU+BAHAGIA+ARMADA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('ASAL KAU BAHAGIA ARMADA')
  },
  {
    songId: 'PUB-HEI-014',
    title: 'KEKASIH BAYANGAN',
    artist: 'CAKRA KHAN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KEKASIH+BAYANGAN+CAKRA+KHAN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KEKASIH BAYANGAN CAKRA KHAN')
  },
  {
    songId: 'PUB-HEI-015',
    title: 'KESEDIhANKU',
    artist: 'SAMMY SIMORANGKIR',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KESEDIhANKU+SAMMY+SIMORANGKIR',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KESEDIhANKU SAMMY SIMORANGKIR')
  },

  // ─── 3. Khana Music Publishing ────────────────────────────────────────────────
  {
    songId: 'PUB-KHN-001',
    title: 'BINTANG DI HATI',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BINTANG+DI+HATI+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('BINTANG DI HATI MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-002',
    title: 'GANTUNG',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=GANTUNG+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('GANTUNG MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-003',
    title: 'KETIKA CINTA BERTASBIH',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KETIKA+CINTA+BERTASBIH+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KETIKA CINTA BERTASBIH MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-004',
    title: 'DENTANG',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DENTANG+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DENTANG MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-005',
    title: 'JIKA',
    artist: 'MELLY GOESLAW FT. ARI LASSO',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JIKA+MELLY+GOESLAW+ARI+LASSO',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('JIKA MELLY GOESLAW ARI LASSO')
  },
  {
    songId: 'PUB-KHN-006',
    title: 'BUNDA',
    artist: 'MELLY GOESLAW (POTRET)',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BUNDA+POTRET+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('BUNDA POTRET MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-007',
    title: 'KU BAHAGIA',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KU+BAHAGIA+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KU BAHAGIA MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-008',
    title: 'CINTA SEJATI',
    artist: 'BUNGA CITRA LESTARI (BCL)',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CINTA+SEJATI+BCL+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CINTA SEJATI BCL MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-009',
    title: 'KARENA KUCINTA KAU',
    artist: 'BUNGA CITRA LESTARI (BCL)',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KARENA+KUCINTA+KAU+BCL',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KARENA KUCINTA KAU BCL')
  },
  {
    songId: 'PUB-KHN-010',
    title: 'HATI YANG TERPILIH',
    artist: 'ROSSA',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=HATI+YANG+TERPILIH+ROSSA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('HATI YANG TERPILIH ROSSA')
  },
  {
    songId: 'PUB-KHN-011',
    title: 'TEGAR',
    artist: 'ROSSA',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TEGAR+ROSSA+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('TEGAR ROSSA MELLY GOESLAW')
  },
  {
    songId: 'PUB-KHN-012',
    title: 'AYAT-AYAT CINTA',
    artist: 'ROSSA',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=AYAT+AYAT+CINTA+ROSSA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('AYAT-AYAT CINTA ROSSA')
  },
  {
    songId: 'PUB-KHN-013',
    title: 'MENGHITUNG HARI',
    artist: 'KRISDAYANTI',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MENGHITUNG+HARI+KRISDAYANTI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MENGHITUNG HARI KRISDAYANTI')
  },
  {
    songId: 'PUB-KHN-014',
    title: 'COBALAH UNTUK SETIA',
    artist: 'KRISDAYANTI',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=COBALAH+UNTUK+SETIA+KRISDAYANTI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('COBALAH UNTUK SETIA KRISDAYANTI')
  },
  {
    songId: 'PUB-KHN-015',
    title: 'SESUATU',
    artist: 'SYAHRINI',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SESUATU+SYAHRINI+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SESUATU SYAHRINI MELLY GOESLAW')
  },

  // ─── 4. Universal Music Publishing Indonesia ──────────────────────────────────
  {
    songId: 'PUB-UMP-001',
    title: 'JANJI SETIA',
    artist: 'TIARA ANDINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JANJI+SETIA+TIARA+ANDINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('JANJI SETIA TIARA ANDINI')
  },
  {
    songId: 'PUB-UMP-002',
    title: 'MERASA INDAH',
    artist: 'TIARA ANDINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MERASA+INDAH+TIARA+ANDINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MERASA INDAH TIARA ANDINI')
  },
  {
    songId: 'PUB-UMP-003',
    title: 'USAI',
    artist: 'TIARA ANDINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=USAI+TIARA+ANDINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('USAI TIARA ANDINI')
  },
  {
    songId: 'PUB-UMP-004',
    title: 'PESAN TERAKHIR',
    artist: 'LYODRA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PESAN+TERAKHIR+LYODRA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PESAN TERAKHIR LYODRA')
  },
  {
    songId: 'PUB-UMP-005',
    title: 'SANG DEWI',
    artist: 'LYODRA FT. ANDI RIANTO',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SANG+DEWI+LYODRA+ANDI+RIANTO',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SANG DEWI LYODRA ANDI RIANTO')
  },
  {
    songId: 'PUB-UMP-006',
    title: 'SISA RASA',
    artist: 'MAHALINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SISA+RASA+MAHALINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SISA RASA MAHALINI')
  },
  {
    songId: 'PUB-UMP-007',
    title: 'KISAH SEMPURNA',
    artist: 'MAHALINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KISAH+SEMPURNA+MAHALINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KISAH SEMPURNA MAHALINI')
  },
  {
    songId: 'PUB-UMP-008',
    title: 'MELAWAN RESTU',
    artist: 'MAHALINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MELAWAN+RESTU+MAHALINI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MELAWAN RESTU MAHALINI')
  },
  {
    songId: 'PUB-UMP-009',
    title: 'TAK INGIN USAI',
    artist: 'KEISYA LEVRONKA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TAK+INGIN+USAI+KEISYA+LEVRONKA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('TAK INGIN USAI KEISYA LEVRONKA')
  },
  {
    songId: 'PUB-UMP-010',
    title: 'PILIHAN YANG TERBAIK',
    artist: 'ZIVA MAGNOLYA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PILIHAN+YANG+TERBAIK+ZIVA+MAGNOLYA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PILIHAN YANG TERBAIK ZIVA MAGNOLYA')
  },
  {
    songId: 'PUB-UMP-011',
    title: 'PERI CINTAKU',
    artist: 'ZIVA MAGNOLYA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PERI+CINTAKU+ZIVA+MAGNOLYA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PERI CINTAKU ZIVA MAGNOLYA')
  },
  {
    songId: 'PUB-UMP-012',
    title: 'RAYU',
    artist: 'MARION JOLA FT. LALEILMANINO',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=RAYU+MARION+JOLA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('RAYU MARION JOLA')
  },
  {
    songId: 'PUB-UMP-013',
    title: 'JANGAN',
    artist: 'MARION JOLA FT. RAYI PUTRA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JANGAN+MARION+JOLA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('JANGAN MARION JOLA')
  },
  {
    songId: 'PUB-UMP-014',
    title: 'KESEMPURNAAN CINTA',
    artist: 'RIZKY FEBIAN',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KESEMPURNAAN+CINTA+RIZKY+FEBIAN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KESEMPURNAAN CINTA RIZKY FEBIAN')
  },
  {
    songId: 'PUB-UMP-015',
    title: 'CUEK',
    artist: 'RIZKY FEBIAN',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CUEK+RIZKY+FEBIAN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CUEK RIZKY FEBIAN')
  },

  // ─── 5. Warner Chappell Music Indonesia ───────────────────────────────────────
  {
    songId: 'PUB-WCM-001',
    title: 'HARAPAN SEMU',
    artist: 'BAGAS RAN',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=HARAPAN+SEMU+BAGAS+RAN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('HARAPAN SEMU BAGAS RAN')
  },
  {
    songId: 'PUB-WCM-002',
    title: 'CELENGAN RINDU',
    artist: 'FIERSA BESARI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CELENGAN+RINDU+FIERSA+BESARI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CELENGAN RINDU FIERSA BESARI')
  },
  {
    songId: 'PUB-WCM-003',
    title: 'WAKTU YANG SALAH',
    artist: 'FIERSA BESARI FT. TANTRI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=WAKTU+YANG+SALAH+FIERSA+BESARI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('WAKTU YANG SALAH FIERSA BESARI')
  },
  {
    songId: 'PUB-WCM-004',
    title: 'GARIS TERDEPAN',
    artist: 'FIERSA BESARI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=GARIS+TERDEPAN+FIERSA+BESARI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('GARIS TERDEPAN FIERSA BESARI')
  },
  {
    songId: 'PUB-WCM-005',
    title: 'APRIL',
    artist: 'FIERSA BESARI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=APRIL+FIERSA+BESARI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('APRIL FIERSA BESARI')
  },
  {
    songId: 'PUB-WCM-006',
    title: 'SAMPAI JADI DEBU',
    artist: 'BANDA NEIRA',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SAMPAI+JADI+DEBU+BANDA+NEIRA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SAMPAI JADI DEBU BANDA NEIRA')
  },
  {
    songId: 'PUB-WCM-007',
    title: 'YANG PATAH TUMBUH, YANG HILANG BERGANTI',
    artist: 'BANDA NEIRA',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=YANG+PATAH+TUMBUH+BANDA+NEIRA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('YANG PATAH TUMBUH BANDA NEIRA')
  },
  {
    songId: 'PUB-WCM-008',
    title: 'PELAN-PELAN SAJA',
    artist: 'KOTAK',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PELAN+PELAN+SAJA+KOTAK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PELAN PELAN SAJA KOTAK')
  },
  {
    songId: 'PUB-WCM-009',
    title: 'MASIH CINTA',
    artist: 'KOTAK',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MASIH+CINTA+KOTAK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MASIH CINTA KOTAK')
  },
  {
    songId: 'PUB-WCM-010',
    title: 'BERAKSI',
    artist: 'KOTAK',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BERAKSI+KOTAK',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('BERAKSI KOTAK')
  },
  {
    songId: 'PUB-WCM-011',
    title: 'SUATU SAAT NANTI',
    artist: 'HANIN DHIYA',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SUATU+SAAT+NANTI+HANIN+DHIYA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SUATU SAAT NANTI HANIN DHIYA')
  },
  {
    songId: 'PUB-WCM-012',
    title: 'REHAT',
    artist: 'KUNTO AJI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=REHAT+KUNTO+AJI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('REHAT KUNTO AJI')
  },
  {
    songId: 'PUB-WCM-013',
    title: 'PILU MEMBIRU',
    artist: 'KUNTO AJI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PILU+MEMBIRU+KUNTO+AJI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('PILU MEMBIRU KUNTO AJI')
  },
  {
    songId: 'PUB-WCM-014',
    title: 'ZONA NYAMAN',
    artist: 'FOURTWNTY',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=ZONA+NYAMAN+FOURTWNTY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('ZONA NYAMAN FOURTWNTY')
  },
  {
    songId: 'PUB-WCM-015',
    title: 'FANA MERAH JAMBU',
    artist: 'FOURTWNTY',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=FANA+MERAH+JAMBU+FOURTWNTY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('FANA MERAH JAMBU FOURTWNTY')
  },

  // ─── 6. BREAKOUT Publishing / Sony Music ──────────────────────────────────────
  {
    songId: 'PUB-BRK-001',
    title: 'GW MAH GITU ORANG NYA',
    artist: 'FAREL PROJECT',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=FAREL+PROJECT+GW+MAH+GITU+ORANG+NYA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('FAREL PROJECT GW MAH GITU ORANG NYA')
  },
  {
    songId: 'PUB-BRK-002',
    title: 'MENDUNG TANPO UDAN',
    artist: 'FAREL PROJECT',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MENDUNG+TANPO+UDAN+FAREL+PROJECT',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MENDUNG TANPO UDAN FAREL PROJECT')
  },
  {
    songId: 'PUB-BRK-003',
    title: 'CINTA TERAKHIR',
    artist: 'AVELIN & THE BAND',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CINTA+TERAKHIR+AVELIN',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CINTA TERAKHIR AVELIN')
  },
  {
    songId: 'PUB-BRK-004',
    title: 'LANGKAH PASTI',
    artist: 'THE OVERGROUND',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=LANGKAH+PASTI+THE+OVERGROUND',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('LANGKAH PASTI THE OVERGROUND')
  },
  {
    songId: 'PUB-BRK-005',
    title: 'DAN',
    artist: 'SHEILA ON 7',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DAN+SHEILA+ON+7',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('DAN SHEILA ON 7')
  },
  {
    songId: 'PUB-BRK-006',
    title: 'SEPHIA',
    artist: 'SHEILA ON 7',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SEPHIA+SHEILA+ON+7',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('SEPHIA SHEILA ON 7')
  },
  {
    songId: 'PUB-BRK-007',
    title: 'KISAH KLASIK',
    artist: 'SHEILA ON 7',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KISAH+KLASIK+SHEILA+ON+7',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KISAH KLASIK SHEILA ON 7')
  },
  {
    songId: 'PUB-BRK-008',
    title: 'JANJI SUCI',
    artist: 'GLENN FREDLY',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JANJI+SUCI+GLENN+FREDLY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('JANJI SUCI GLENN FREDLY')
  },
  {
    songId: 'PUB-BRK-009',
    title: 'KASIH PUTIH',
    artist: 'GLENN FREDLY',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KASIH+PUTIH+GLENN+FREDLY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KASIH PUTIH GLENN FREDLY')
  },
  {
    songId: 'PUB-BRK-010',
    title: 'AKHIR CERITA CINTA',
    artist: 'GLENN FREDLY',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=AKHIR+CERITA+CINTA+GLENN+FREDLY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('AKHIR CERITA CINTA GLENN FREDLY')
  },
  {
    songId: 'PUB-BRK-011',
    title: 'CINTA KARENA CINTA',
    artist: 'JUDIKA',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CINTA+KARENA+CINTA+JUDIKA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('CINTA KARENA CINTA JUDIKA')
  },
  {
    songId: 'PUB-BRK-012',
    title: 'JIKALAU KAU CINTA',
    artist: 'JUDIKA',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JIKALAU+KAU+CINTA+JUDIKA',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('JIKALAU KAU CINTA JUDIKA')
  },
  {
    songId: 'PUB-BRK-013',
    title: 'KASIH TAK SAMPAI',
    artist: 'PADI',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KASIH+TAK+SAMPAI+PADI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('KASIH TAK SAMPAI PADI')
  },
  {
    songId: 'PUB-BRK-014',
    title: 'MENANTI SEBUAH JAWABAN',
    artist: 'PADI',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MENANTI+SEBUAH+JAWABAN+PADI',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MENANTI SEBUAH JAWABAN PADI')
  },
  {
    songId: 'PUB-BRK-015',
    title: 'MENANGIS SEMALAM',
    artist: 'AUDY',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=MENANGIS+SEMALAM+AUDY',
    driveLink: 'https://drive.google.com/drive/search?q=' + encodeURIComponent('MENANGIS SEMALAM AUDY')
  }
];

async function main() {
  console.log(`Menyimpan ${sampleCatalogs.length} katalog lagu ke database PostgreSQL...`);

  // Ensure Catalog table exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Catalog" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "songId" TEXT UNIQUE NOT NULL,
      "title" TEXT NOT NULL,
      "artist" TEXT NOT NULL,
      "publisher" TEXT NOT NULL,
      "status" TEXT DEFAULT 'Aktif',
      "youtubeLink" TEXT,
      "driveLink" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  let count = 0;
  for (const item of sampleCatalogs) {
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "Catalog" ("id", "songId", "title", "artist", "publisher", "status", "youtubeLink", "driveLink", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT ("songId") DO UPDATE SET
        "title" = EXCLUDED."title",
        "artist" = EXCLUDED."artist",
        "publisher" = EXCLUDED."publisher",
        "status" = EXCLUDED."status",
        "youtubeLink" = EXCLUDED."youtubeLink",
        "driveLink" = EXCLUDED."driveLink",
        "updatedAt" = NOW();
      `,
      item.songId,
      item.title,
      item.artist,
      item.publisher,
      item.status,
      item.youtubeLink,
      item.driveLink
    );
    count++;
  }

  const total = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "Catalog"`);
  console.log(`✅ Sukses! Total lagu terdaftar di tabel Catalog: ${total[0]?.c || count}`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding catalogs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
