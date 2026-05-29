import { db } from './index';
import { users } from './schema/users';
import { adultosMayores } from './schema/adultosMayores';
import { relevamientos } from './schema/relevamientos';
import { ROLES } from '../../lib/constants/roles';
import { eq } from 'drizzle-orm';

// Contraseña plana: 'relapp2026'
const MOCK_PASSWORD_HASH = '$2b$10$CZGIpj4Of8TLfN9YVdgnNuy7S7bAoBwbLb..tiV7SWcAMaypa5hem';

async function main() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1'
  ) {
    throw new Error('Seed bloqueado en producción');
  }

  console.log('🌱 Iniciando la siembra de base de datos (Seed)...');

  try {
    // 1. Sembrar Usuarios
    const seedUsers = [
      {
        email: 'admin@relapp.com',
        passwordHash: MOCK_PASSWORD_HASH,
        role: ROLES.ADMIN,
      },
      {
        email: 'supervisor@relapp.com',
        passwordHash: MOCK_PASSWORD_HASH,
        role: ROLES.SUPERVISOR,
      },
      {
        email: 'social@relapp.com',
        passwordHash: MOCK_PASSWORD_HASH,
        role: ROLES.SOCIAL_WORKER,
      },
    ];

    for (const u of seedUsers) {
      await db
        .insert(users)
        .values({
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            passwordHash: u.passwordHash,
            role: u.role,
          },
        });

      console.log(`✓ Procesado usuario seed: ${u.email}`);
    }

    // Obtener los usuarios para asociar la autoría de creación
    const dbUsers = await db.select().from(users);
    const admin = dbUsers.find((u) => u.email === 'admin@relapp.com');
    const social = dbUsers.find((u) => u.email === 'social@relapp.com');

    if (!admin || !social) {
      throw new Error('No se encontraron los usuarios creados para relacionar las entidades.');
    }

    // 2. Sembrar Adultos Mayores
    const seedAdultos = [
      {
        nombre: 'Juan Carlos',
        apellido: 'Perez',
        dni: '12345678',
        fechaNacimiento: '1961-05-15',
        telefono: '1155554444',
        direccion: 'Calle Falsa 123',
        barrio: 'Palermo',
        observaciones: 'Paciente con movilidad ligeramente reducida pero independiente.',
        estado: 'ACTIVO' as const,
        createdBy: social.id,
      },
      {
        nombre: 'Maria Victoria',
        apellido: 'Gomez',
        dni: '87654321',
        fechaNacimiento: '1954-10-22',
        telefono: '1122223333',
        direccion: 'Av. Corrientes 4567',
        barrio: 'Almagro',
        observaciones: 'Sin patologías complejas reportadas.',
        estado: 'ACTIVO' as const,
        createdBy: social.id,
      },
      {
        nombre: 'Carlos Alberto',
        apellido: 'Rodriguez',
        dni: '11223344',
        fechaNacimiento: '1946-03-08',
        telefono: '1166667777',
        direccion: 'Rivadavia 890',
        barrio: 'Flores',
        observaciones: 'Requiere acompañamiento familiar regular.',
        estado: 'ACTIVO' as const,
        createdBy: admin.id,
      }
    ];

    for (const a of seedAdultos) {
      await db
        .insert(adultosMayores)
        .values(a)
        .onConflictDoNothing({ target: adultosMayores.dni });

      console.log(`✓ Procesado adulto mayor seed: ${a.nombre} ${a.apellido}`);
    }

    // Obtener los adultos mayores insertados para asociar los relevamientos
    const dbAdultos = await db.select().from(adultosMayores);
    const perez = dbAdultos.find((a) => a.dni === '12345678');
    const gomez = dbAdultos.find((a) => a.dni === '87654321');

    if (perez && gomez) {
      // 3. Sembrar Relevamientos de prueba
      const seedRelevamientos = [
        {
          adultoMayorId: perez.id,
          createdBy: social.id,
          tipoVivienda: 'Casa',
          tieneAgua: true,
          tieneLuz: true,
          tieneGas: false,
          hacinamiento: false,
          enfermedadesCronicas: 'Hipertensión arterial',
          nivelMovilidad: 'Independiente',
          tomaMedicamentos: true,
          ingresos: '450000.00',
          obraSocial: 'PAMI',
          redApoyo: 'Familiar',
          riesgoSocial: 'MEDIO' as const,
          estado: 'FINALIZADO' as const,
          observacionesGeneral: 'Paciente estable, asiste a controles médicos regulares.',
        },
        {
          adultoMayorId: gomez.id,
          createdBy: social.id,
          tipoVivienda: 'Departamento',
          tieneAgua: true,
          tieneLuz: true,
          tieneGas: true,
          hacinamiento: false,
          enfermedadesCronicas: 'Diabetes Tipo 2',
          nivelMovilidad: 'Usa bastón',
          tomaMedicamentos: true,
          ingresos: '380000.00',
          obraSocial: 'Ninguna',
          redApoyo: 'Vecinal',
          riesgoSocial: 'ALTO' as const,
          estado: 'BORRADOR' as const,
          observacionesGeneral: 'Pendiente de entrega de insumos de insulina por parte de la obra social anterior.',
        }
      ];

      for (const r of seedRelevamientos) {
        // Para evitar duplicación masiva en seeds sucesivos, validamos si ya tiene relevamientos
        const existing = await db
          .select()
          .from(relevamientos)
          .where(eq(relevamientos.adultoMayorId, r.adultoMayorId));

        if (existing.length === 0) {
          await db.insert(relevamientos).values(r);
          console.log(`✓ Procesado relevamiento seed para adulto mayor ID: ${r.adultoMayorId}`);
        }
      }
    }

    console.log('✅ Base de datos sembrada con éxito.');
  } catch (error) {
    console.error('❌ Error crítico durante la siembra de la base de datos.', error);
  } finally {
    process.exit(0);
  }
}

main();
