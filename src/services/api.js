export const apiService = {
  async getLugares() {
    return [
      {
        id: 1,
        nombre: 'Gustos Restaurant & Bar',
        categoria: 'comida',
        zona: 'Casco Histórico',
        direccion: 'Calle Comercio c/c Calle Lanceros, Casco Histórico',
        horario: 'Mier. a Dom. 12:00 PM - 11:00 PM',
        hasDelivery: true,
        descripcion: 'Gastronomía internacional, carnes gourmet, mariscos y coctelería.',
        descripcionLarga: 'Gustos es un punto de encuentro en pleno corazón del Casco Histórico de Puerto Cabello. Ofrece un ambiente climatizado y terraza colonial, ideal para almuerzos ejecutivos, cenas románticas y cócteles de autor.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        whatsapp: '584121234567',
        menu: [
          { id: 101, nombre: 'Parrilla Mar y Tierra (2 personas)', descripcion: 'Lomito, pollo, camarones y tostones con guasacaca', precio: 25 },
          { id: 102, nombre: 'Hamburguesa Gustos Gourmet', descripcion: '200g carne Angus, queso cheddar, tocineta y papas', precio: 10 },
          { id: 103, nombre: 'Coctel Mojito Porteño', descripcion: 'Ron blanco, menta fresca y fruta de la pasión', precio: 5 }
        ]
      },
      {
        id: 2,
        nombre: 'Casa Herrera (Centro Cultural y Museo)',
        categoria: 'eventos',
        zona: 'Casco Histórico',
        direccion: 'Calle Lanceros, frente a la Plaza Bolívar',
        horario: 'Mar. a Dom. 9:00 AM - 5:00 PM',
        hasDelivery: false,
        descripcion: 'Casona colonial del siglo XVIII, exposiciones de arte e historia porteña.',
        descripcionLarga: 'La Casa Herrera es una de las joyas arquitectónicas coloniales mejor conservadas del Casco Histórico de Puerto Cabello. Alberga galerías de arte itinerantes, eventos culturales, conversatorios e historia viva de la gesta emancipadora.',
        image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80',
        whatsapp: '584149876543',
        menu: [
          { id: 201, nombre: 'Entrada Guiada General', descripcion: 'Recorrido por las salas de exposición colonial', precio: 2 },
          { id: 202, nombre: 'Taller de Arte / Fotografía', descripcion: 'Actividades culturales los fines de semana', precio: 10 }
        ]
      },
      {
        id: 3,
        nombre: 'Bahía de Patanemo',
        categoria: 'playa',
        zona: 'Patanemo',
        direccion: 'Final Carretera Principal de Patanemo, al este de Puerto Cabello',
        horario: 'Lunes a Domingo 7:00 AM - 5:00 PM',
        hasDelivery: false,
        descripcion: 'Bahía paradisíaca rodeada de montañas, cocoteros y venta de cacao puro.',
        descripcionLarga: 'Una de las playas más icónicas de Carabobo. Cuenta con estacionamiento vigilado, kioscos gastronómicos de pescado frito y mariscos, alquiler de toldos y degustación de chocolates y bebidas artesanales a base de cacao de Patanemo.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        whatsapp: '584161112233',
        menu: [
          { id: 301, nombre: 'Plato Playero Pargo Frito', descripcion: 'Pargo entero con tostones, ensalada y queso', precio: 15 },
          { id: 302, nombre: 'Servicio de Toldo + 2 Sillas', descripcion: 'Ubicación preferencial frente al mar', precio: 10 },
          { id: 303, nombre: 'Bebida de Cacao Artesanal', descripcion: 'Preparado con cacao criollo de la hacienda', precio: 3 }
        ]
      },
      {
        id: 4,
        nombre: 'Isla Larga & Embarcadero Quizandal',
        categoria: 'playa',
        zona: 'Quizandal',
        direccion: 'Embarcadero de Quizandal, Sector Gañango',
        horario: 'Jue. a Dom. 8:00 AM - 4:00 PM',
        hasDelivery: false,
        descripcion: 'Aguas cristalinas, arrecifes y barcos hundidos para practicar snorkel.',
        descripcionLarga: 'Isla Larga forma parte del Parque Nacional San Esteban. Sus aguas calmas y transparentes la hacen perfecta para familias y amantes del snorkel, donde se pueden avistar peces tropicales alrededor de los cargueros hundidos Sesostris y Jaca de la Segunda Guerra Mundial.',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
        whatsapp: '584125556677',
        menu: [
          { id: 401, nombre: 'Pasaje Lancha Ida y Vuelta', descripcion: 'Traslado seguro en peñero Quizandal - Isla Larga', precio: 10 },
          { id: 402, nombre: 'Alquiler Máscara y Snorkel', descripcion: 'Uso por todo el día en la isla', precio: 5 }
        ]
      },
      {
        id: 5,
        nombre: 'Empanadas Tradicionales El Palito',
        categoria: 'comercio',
        zona: 'El Palito',
        direccion: 'Autopista Valencia - Puerto Cabello, Sector El Palito',
        horario: 'Lunes a Domingo 6:00 AM - 8:00 PM',
        hasDelivery: true,
        descripcion: 'Las famosas empanadas gigantes de cazón, mariscos, camarón y carne mechada.',
        descripcionLarga: 'Parada obligatoria al entrar o salir de Puerto Cabello. Empanadas recién fritas, crocantes y rellenas con guisos de mariscos frescos de la costa porteña acompañadas con las mejores guasacacas de la región.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80',
        whatsapp: '584129990011',
        menu: [
          { id: 501, nombre: 'Empanada de Cazón o Mariscos', descripcion: 'Maza crujiente rellena con guiso de pescado fresco', precio: 2 },
          { id: 502, nombre: 'Empanada Pabellón Playero', descripcion: 'Mechada, tajada, queso y caraotas', precio: 2.5 },
          { id: 503, nombre: 'Jugo Natural / Malta Fría', descripcion: 'Naranja, parchita o malta de botella', precio: 1.5 }
        ]
      }
    ];
  },

  async login(credentials) {
    return {
      token: 'fake-jwt-token',
      user: {
        email: credentials.email,
        rol: credentials.rol,
        nombre: credentials.rol === 'aliado' ? 'Aliado Porteño' : 'Cliente'
      }
    };
  }
};