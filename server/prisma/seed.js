import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/client-next/index.js';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12) {
  throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres) antes de ejecutar el seed.');
}

const passwordHash = await bcrypt.hash(password, 12);

try {
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: {
      name: 'Administrador',
      email,
      passwordHash,
      role: 'ADMIN',
    },
    select: { id: true },
  });

  const featuredPlaces = [
    {
      id: 'sitio-fortin-solano',
      nombre: 'Fortín Solano',
      categoria: 'eventos',
      zona: 'Parque Nacional San Esteban',
      direccion: 'Cerro El Vigía, Puerto Cabello, Carabobo',
      descripcion: 'Fortificación histórica construida en 1766 sobre el cerro El Vigía, con vistas hacia Puerto Cabello.',
      descripcionLarga: 'El Fortín Solano fue construido en 1766 para proteger Puerto Cabello y el antiguo camino hacia Valencia. Se encuentra en el cerro El Vigía, dentro del Parque Nacional San Esteban. Confirma el acceso y los horarios antes de visitarlo.',
      image: '/images/fortin-solano.jpg',
      imageCredit: 'BhrandonG',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Fort%C3%ADn_Solano_-_Puerto_Cabello.jpg',
      imageLicense: 'CC BY-SA 4.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    {
      id: 'sitio-playa-patanemo',
      nombre: 'Playa de Patanemo',
      categoria: 'playa',
      zona: 'Patanemo',
      direccion: 'Parroquia Patanemo, municipio Puerto Cabello, Carabobo',
      descripcion: 'Playa de la costa de Puerto Cabello, en la parroquia Patanemo.',
      descripcionLarga: 'Patanemo es una localidad costera del municipio Puerto Cabello, conocida por su playa y su entorno natural. Consulta las condiciones de acceso, servicios disponibles y recomendaciones locales antes de viajar.',
      image: '/images/playa-patanemo.jpg',
      imageCredit: 'Periergeia',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Playa_de_Patanemo_(Municipio_Puerto_Cabello,_Estado_Carabobo,_Venezuela).jpg',
      imageLicense: 'CC BY-SA 3.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      id: 'sitio-isla-larga',
      nombre: 'Isla Larga',
      categoria: 'playa',
      zona: 'Parque Nacional San Esteban',
      direccion: 'Acceso marítimo desde Quizandal; confirma el transporte antes de salir',
      descripcion: 'Destino insular de Puerto Cabello con costa, aguas claras y restos de un naufragio visibles en la imagen.',
      descripcionLarga: 'Isla Larga es un destino costero asociado al Parque Nacional San Esteban. El traslado depende de embarcaciones y condiciones del mar; verifica disponibilidad, normas del parque y recomendaciones vigentes antes de planificar la visita.',
      image: '/images/isla-larga.jpg',
      imageCredit: 'Julioreylagarto',
      imageSource: 'https://commons.wikimedia.org/wiki/File:ISLA_LARGA_-_CARABOBO_01.JPG',
      imageLicense: 'CC BY-SA 3.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      id: 'sitio-castillo-libertador',
      nombre: 'Castillo Libertador',
      categoria: 'eventos',
      zona: 'Malecón',
      direccion: 'Frente al Malecón de Puerto Cabello, Carabobo',
      descripcion: 'Fortificación histórica ubicada frente al Malecón de Puerto Cabello.',
      descripcionLarga: 'El Castillo Libertador forma parte del paisaje histórico del frente marítimo de Puerto Cabello. Confirma si está abierto al público y sus condiciones de acceso antes de visitarlo.',
      image: '/images/castillo-libertador.jpg',
      imageCredit: 'Marylin Torres',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Castillo_libertador.JPG',
      imageLicense: 'CC BY-SA 3.0',
      imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  ];

  for (const place of featuredPlaces) {
    await prisma.place.upsert({
      where: { id: place.id },
      update: {},
      create: {
        ...place,
        status: 'APPROVED',
        isFeatured: ['sitio-fortin-solano', 'sitio-playa-patanemo'].includes(place.id),
        createdById: admin.id,
      },
    });
  }

  await prisma.place.deleteMany({
    where: {
      id: {
        in: [
          'demo-restaurante-porteno',
          'demo-posada-costera',
          'demo-emprendimiento-local',
          'demo-evento-cultural',
        ],
      },
    },
  });
} finally {
  await prisma.$disconnect();
}
