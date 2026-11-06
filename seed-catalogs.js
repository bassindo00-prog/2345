const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleCatalogs = [
  // RPH Music Publishing
  {
    songId: 'PUB-RPH-001',
    title: 'ADA AKU DISINI',
    artist: 'DESTA MAHENRA',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=ADA+AKU+DISINI+DESTA+MAHENRA',
    driveLink: 'https://drive.google.com/drive/folders/rph-desta-master'
  },
  {
    songId: 'PUB-RPH-002',
    title: 'KETIKA TANGAN DAN KAKI BERKATA',
    artist: 'CHRISYE / RPH',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KETIKA+TANGAN+DAN+KAKI+BERKATA',
    driveLink: 'https://drive.google.com/drive/folders/rph-chrisye-master'
  },
  {
    songId: 'PUB-RPH-003',
    title: 'TOMBO ATI',
    artist: 'OPICK',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TOMBO+ATI+OPICK',
    driveLink: 'https://drive.google.com/drive/folders/rph-opick-tomboati'
  },
  {
    songId: 'PUB-RPH-004',
    title: 'RAPUH',
    artist: 'OPICK',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=RAPUH+OPICK',
    driveLink: 'https://drive.google.com/drive/folders/rph-opick-rapuh'
  },
  {
    songId: 'PUB-RPH-005',
    title: 'DENGAN NAFAS-MU',
    artist: 'UNGU',
    publisher: 'RPH Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DENGAN+NAFASMU+UNGU',
    driveLink: 'https://drive.google.com/drive/folders/rph-ungu-nafasmu'
  },

  // Halo Entertainment Indonesia (HEI)
  {
    songId: 'PUB-HEI-001',
    title: 'PESONA SENJA',
    artist: 'LINTANG KEMUKUS',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PESONA+SENJA+LINTANG+KEMUKUS',
    driveLink: 'https://drive.google.com/drive/folders/halo-pesona-senja'
  },
  {
    songId: 'PUB-HEI-002',
    title: 'BIDADARI TAK BERSAYAP',
    artist: 'ANJI',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BIDADARI+TAK+BERSAYAP+ANJI',
    driveLink: 'https://drive.google.com/drive/folders/halo-anji-bidadari'
  },
  {
    songId: 'PUB-HEI-003',
    title: 'SURAT CINTA UNTUK STARLA',
    artist: 'VIRGOUN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SURAT+CINTA+UNTUK+STARLA+VIRGOUN',
    driveLink: 'https://drive.google.com/drive/folders/halo-virgoun-starla'
  },
  {
    songId: 'PUB-HEI-004',
    title: 'SAAT BAHAGIA',
    artist: 'UNGU FT. ANDIEN',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SAAT+BAHAGIA+UNGU+ANDIEN',
    driveLink: 'https://drive.google.com/drive/folders/halo-ungu-andien'
  },
  {
    songId: 'PUB-HEI-005',
    title: 'DIA',
    artist: 'ANJI',
    publisher: 'Halo Entertainment Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=DIA+ANJI',
    driveLink: 'https://drive.google.com/drive/folders/halo-anji-dia'
  },

  // Khana Music Publishing
  {
    songId: 'PUB-KHN-001',
    title: 'BINTANG DI HATI',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=BINTANG+DI+HATI+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/folders/khana-melly-goeslaw'
  },
  {
    songId: 'PUB-KHN-002',
    title: 'GANTUNG',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=GANTUNG+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/folders/khana-melly-gantung'
  },
  {
    songId: 'PUB-KHN-003',
    title: 'KETIKA CINTA BERTASBIH',
    artist: 'MELLY GOESLAW',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KETIKA+CINTA+BERTASBIH+MELLY+GOESLAW',
    driveLink: 'https://drive.google.com/drive/folders/khana-melly-kcb'
  },
  {
    songId: 'PUB-KHN-004',
    title: 'CINTA SEJATI',
    artist: 'BUNGA CITRA LESTARI',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CINTA+SEJATI+BCL',
    driveLink: 'https://drive.google.com/drive/folders/khana-bcl-cintasejati'
  },
  {
    songId: 'PUB-KHN-005',
    title: 'TENTANG SESEORANG',
    artist: 'ANDA PERDANA',
    publisher: 'Khana Music Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TENTANG+SESEORANG+ANDA+PERDANA',
    driveLink: 'https://drive.google.com/drive/folders/khana-anda-perdana'
  },

  // PT. Damarlangit Khatulistiwa
  {
    songId: 'PUB-BRK-001',
    title: '130 TAHUN',
    artist: 'SALIMIN',
    publisher: 'PT. Damarlangit Khatulistiwa',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/watch?v=dJ4RdklsRM0',
    driveLink: 'https://drive.google.com/drive/folders/breakout-master-130tahun'
  },
  {
    songId: 'PUB-BRK-002',
    title: '3 TAHUN 3 BULAN 3 HARI',
    artist: 'NAIS JULYANS',
    publisher: 'PT. Damarlangit Khatulistiwa',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/watch?v=JJm57VE7yqY',
    driveLink: 'https://drive.google.com/drive/folders/breakout-master-3tahun'
  },

  // BREAKOUT Publishing / Sony Music
  {
    songId: 'PUB-BRK-003',
    title: 'GW MAH GITU ORANG NYA',
    artist: 'FAREL PROJECT',
    publisher: 'BREAKOUT Publishing / Sony Music',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=FAREL+PROJECT+GW+MAH+GITU+ORANG+NYA',
    driveLink: 'https://drive.google.com/drive/folders/farel-project-master'
  },
  {
    songId: 'PUB-BRK-005',
    title: 'CINTA TERAKHIR',
    artist: 'AVELIN & THE BAND',
    publisher: 'BREAKOUT Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=AVELIN+CINTA+TERAKHIR',
    driveLink: 'https://drive.google.com/drive/folders/avelin-cinta-terakhir'
  },
  {
    songId: 'PUB-BRK-010',
    title: 'LANGKAH PASTI',
    artist: 'THE OVERGROUND',
    publisher: 'BREAKOUT Publishing',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=LANGKAH+PASTI+THE+OVERGROUND',
    driveLink: 'https://drive.google.com/drive/folders/the-overground-master-wav'
  },

  // Universal Music Publishing Indonesia
  {
    songId: 'PUB-UMP-001',
    title: 'JANJI SETIA',
    artist: 'TIARA ANDINI',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=JANJI+SETIA+TIARA+ANDINI',
    driveLink: 'https://drive.google.com/drive/folders/tiara-janji-setia-wav'
  },
  {
    songId: 'PUB-UMP-002',
    title: 'PESAN TERAKHIR',
    artist: 'LYODRA GINTING',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PESAN+TERAKHIR+LYODRA',
    driveLink: 'https://drive.google.com/drive/folders/lyodra-pesan-terakhir'
  },
  {
    songId: 'PUB-UMP-003',
    title: 'TAK INGIN USAI',
    artist: 'KEISYA LEVRONKA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=TAK+INGIN+USAI+KEISYA',
    driveLink: 'https://drive.google.com/drive/folders/keisya-tak-ingin-usai'
  },
  {
    songId: 'PUB-UMP-004',
    title: 'KISAH SEMPURNA',
    artist: 'MAHALINI RAHARJA',
    publisher: 'Universal Music Publishing Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=KISAH+SEMPURNA+MAHALINI',
    driveLink: 'https://drive.google.com/drive/folders/mahalini-kisah-sempurna'
  },

  // Warner Chappell Music Indonesia
  {
    songId: 'PUB-WCM-001',
    title: 'HARAPAN SEMU',
    artist: 'BAGAS RAN',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=HARAPAN+SEMU+BAGAS+RAN',
    driveLink: 'https://drive.google.com/drive/folders/warner-bagas-ran'
  },
  {
    songId: 'PUB-WCM-002',
    title: 'SAMPAI JADI DEBU',
    artist: 'BANDA NEIRA',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=SAMPAI+JADI+DEBU+BANDA+NEIRA',
    driveLink: 'https://drive.google.com/drive/folders/warner-banda-neira'
  },
  {
    songId: 'PUB-WCM-003',
    title: 'PELUKKU UNTUK PELIKMU',
    artist: 'FIERSA BESARI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=PELUKKU+UNTUK+PELIKMU+FIERSA',
    driveLink: 'https://drive.google.com/drive/folders/warner-fiersa-pelukku'
  },
  {
    songId: 'PUB-WCM-004',
    title: 'CELENGAN RINDU',
    artist: 'FIERSA BESARI',
    publisher: 'Warner Chappell Music Indonesia',
    status: 'Aktif',
    youtubeLink: 'https://www.youtube.com/results?search_query=CELENGAN+RINDU+FIERSA',
    driveLink: 'https://drive.google.com/drive/folders/warner-fiersa-celengan'
  }
];

async function main() {
  console.log('Seeding sample catalogs...');
  for (const item of sampleCatalogs) {
    const existing = await prisma.catalog.findFirst({
      where: { songId: item.songId }
    });
    if (existing) {
      await prisma.catalog.update({
        where: { id: existing.id },
        data: item
      });
    } else {
      await prisma.catalog.create({
        data: item
      });
    }
  }
  const total = await prisma.catalog.count();
  console.log(`Success! Total songs in Catalog table: ${total}`);
}

main().finally(() => prisma.$disconnect());
