import prisma from '../utils/prisma';

const STANDARD_KPIS = [
  { name: 'GHG Emissions', description: 'Greenhouse Gas Emissions' },
  { name: 'Energy Management', description: 'Efficiency and renewable usage' },
  { name: 'Water & Wastewater', description: 'Water consumption and treatment' },
  { name: 'Waste Management', description: 'Recycling and hazard disposal' },
  { name: 'Data Security', description: 'Cybersecurity and data privacy' },
  { name: 'Employee Health & Safety', description: 'Workplace safety metrics' },
  { name: 'Diversity & Inclusion', description: 'Workforce demographics' },
  { name: 'Labor Practices', description: 'Fair wages and rights' },
  { name: 'Supply Chain Management', description: 'Supplier ESG compliance' },
  { name: 'Business Ethics', description: 'Anti-corruption and compliance' }
];

const STANDARD_GROUPS = [
  { name: 'Employees', type: 'INTERNAL' },
  { name: 'Management', type: 'INTERNAL' },
  { name: 'Board Members', type: 'INTERNAL' },
  { name: 'Investors', type: 'EXTERNAL' },
  { name: 'Customers', type: 'EXTERNAL' },
  { name: 'Suppliers', type: 'EXTERNAL' },
  { name: 'Community', type: 'EXTERNAL' }
];

import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting Seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ecoryx.com' },
    update: {},
    create: {
      email: 'admin@ecoryx.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin User Ready: admin@ecoryx.com');

  await prisma.responseDetail.deleteMany();
  await prisma.response.deleteMany();
  await prisma.kPI.deleteMany();
  await prisma.stakeholderGroup.deleteMany();
  await prisma.survey.deleteMany();

  console.log('Cleaned database');

  const survey = await prisma.survey.create({
    data: {
      title: 'Global ESG Assessment 2024 (Demo)',
      status: 'ACTIVE'
    }
  });

  console.log(`Created Survey: ${survey.title}`);

  const kpiMap = new Map<string, string>();
  for (const kpiData of STANDARD_KPIS) {
    const kpi = await prisma.kPI.create({
      data: { ...kpiData, surveyId: survey.id }
    });
    kpiMap.set(kpi.name, kpi.id);
  }

  const groupMap = new Map<string, string>();
  for (const groupData of STANDARD_GROUPS) {
    const group = await prisma.stakeholderGroup.create({
      data: { ...groupData, surveyId: survey.id }
    });
    groupMap.set(group.name, group.id);
  }

  console.log('Added Metadata (KPIs & Groups)');

  const generateScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  for (const [groupName, groupId] of groupMap) {
    const isInternal = STANDARD_GROUPS.find(g => g.name === groupName)?.type === 'INTERNAL';
    const responseCount = 5;

    for (let i = 0; i < responseCount; i++) {
      const response = await prisma.response.create({
        data: {
          surveyId: survey.id,
          stakeholderGroupId: groupId
        }
      });

      for (const [kpiName, kpiId] of kpiMap) {
        let score = generateScore(4, 9);

        if (isInternal) {
          if (kpiName === 'Employee Health & Safety' || kpiName === 'Labor Practices') score = generateScore(8, 10);
          if (kpiName === 'Supply Chain Management') score = generateScore(3, 7);
        } else {
          if (kpiName === 'Data Security' || kpiName === 'Business Ethics') score = generateScore(9, 10);
          if (kpiName === 'Employee Health & Safety') score = generateScore(5, 8);
        }

        await prisma.responseDetail.create({
          data: {
            responseId: response.id,
            kpiId: kpiId,
            score: score
          }
        });
      }
    }
  }

  console.log('Simulated Responses generated.');
  console.log('Seeding Completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
