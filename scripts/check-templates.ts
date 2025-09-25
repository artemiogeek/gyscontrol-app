import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    console.log('🔍 Verificando plantillas en la base de datos...\n');

    // Check independent equipment templates
    const equipmentTemplates = await prisma.plantillaEquipoIndependiente.findMany({
      select: { id: true, nombre: true, createdAt: true }
    });

    console.log('📦 Plantillas de Equipos Independientes:');
    if (equipmentTemplates.length === 0) {
      console.log('   No hay plantillas de equipos');
    } else {
      equipmentTemplates.forEach(template => {
        console.log(`   - ${template.id}: ${template.nombre} (${template.createdAt})`);
      });
    }

    // Check independent service templates
    const serviceTemplates = await prisma.plantillaServicioIndependiente.findMany({
      select: { id: true, nombre: true, createdAt: true }
    });

    console.log('\n🔧 Plantillas de Servicios Independientes:');
    if (serviceTemplates.length === 0) {
      console.log('   No hay plantillas de servicios');
    } else {
      serviceTemplates.forEach(template => {
        console.log(`   - ${template.id}: ${template.nombre} (${template.createdAt})`);
      });
    }

    // Check independent expense templates
    const expenseTemplates = await prisma.plantillaGastoIndependiente.findMany({
      select: { id: true, nombre: true, createdAt: true }
    });

    console.log('\n💰 Plantillas de Gastos Independientes:');
    if (expenseTemplates.length === 0) {
      console.log('   No hay plantillas de gastos');
    } else {
      expenseTemplates.forEach(template => {
        console.log(`   - ${template.id}: ${template.nombre} (${template.createdAt})`);
      });
    }

    // Check complete templates
    const completeTemplates = await prisma.plantilla.findMany({
      select: { id: true, nombre: true, tipo: true, createdAt: true }
    });

    console.log('\n📋 Plantillas Completas:');
    if (completeTemplates.length === 0) {
      console.log('   No hay plantillas completas');
    } else {
      completeTemplates.forEach(template => {
        console.log(`   - ${template.id}: ${template.nombre} (${template.tipo}) (${template.createdAt})`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar plantillas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();