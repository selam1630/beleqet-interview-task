import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Beleqet database...');

  // ── Job Categories ─────────────────────────────────────────────────────────
  const rawJobCategories = [
    "Accounting And Finance", "Advisory And Consultancy", "Aeronautics And Aerospace",
    "Agriculture", "Architecture And Urban Planning", "Beauty And Grooming",
    "Broker And Case Closer", "Business And Commerce", "Chemical And Biomedical Engineering",
    "Clothing And Textile", "Construction And Civil Engineering", "Creative Art And Design",
    "Customer Service And Care", "Data Mining And Analytics", "Documentation And Writing Services",
    "Entertainment", "Environmental And Energy Engineering", "Event Management And Organization",
    "Fashion Design", "Food And Drink Preparation Or Service", "Gardening And Landscaping",
    "Health Care", "Horticulture", "Hospitality And Tourism", "Human Resource And Talent Management",
    "Information Technology", "Installation And Maintenance Technician", "Janitorial And Other Office Services",
    "Labor Work And Masonry", "Law", "Livestock And Animal Husbandry", "Logistic And Supply Chain",
    "Manufacturing And Production", "Marketing And Advertisement", "Mechanical And Electrical Engineering",
    "Media And Communication", "Multimedia Content Production", "Pharmaceutical",
    "Project Management And Administration", "Psychiatry, Psychology And Social Work",
    "Purchasing And Procurement", "Research And Data Analytics", "Sales And Promotion",
    "Secretarial And Office Management", "Security And Safety", "Shop And Office Attendant",
    "Software Design And Development", "Teaching And Tutor", "Training And Consultancy",
    "Training And Mentorship", "Translation And Transcription", "Transportation",
    "Transportation And Delivery", "Veterinary", "Woodwork And Carpentry"
  ];

  const categories = await Promise.all(
    rawJobCategories.map(cat => {
      const slug = cat.toLowerCase().replace(/[, ]+/g, '-').replace(/-+$/g, '');
      return prisma.jobCategory.upsert({
        where: { slug },
        update: {},
        create: { slug, label: cat, icon: 'briefcase' } // generic icon as default
      });
    })
  );
  console.log('✅ Job categories created');

  // ── Demo employer + jobs ───────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('SecurePass123!', 12);
  const employer = await prisma.user.upsert({
    where: { email: 'demo.employer@beleqet.com' },
    update: {},
    create: {
      email: 'demo.employer@beleqet.com',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Employer',
      role: 'EMPLOYER',
      emailVerified: true,
    },
  });

  const company = await prisma.company.upsert({
    where: { userId: employer.id },
    update: {
      name: 'Beleqet Talent Partners',
      verified: true,
    },
    create: {
      userId: employer.id,
      name: 'Beleqet Talent Partners',
      description: 'A verified employer account used to showcase live job listings.',
      industry: 'Human Resource And Talent Management',
      location: 'Addis Ababa, Ethiopia',
      verified: true,
    },
  });

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const demoJobs = [
    {
      title: 'Full Stack Developer',
      description:
        'Build and maintain modern hiring platform features across a Next.js frontend and NestJS backend. You will work with PostgreSQL, Redis queues, and API integrations.',
      location: 'Addis Ababa, Ethiopia',
      type: 'FULL_TIME',
      categorySlug: 'software-design-and-development',
      featured: true,
      tags: ['React', 'Next.js', 'NestJS', 'PostgreSQL'],
      salaryMin: 30000,
      salaryMax: 50000,
    },
    {
      title: 'Digital Marketing Specialist',
      description:
        'Plan campaigns, manage social channels, and improve job seeker acquisition through data-driven marketing.',
      location: 'Addis Ababa, Ethiopia',
      type: 'HYBRID',
      categorySlug: 'marketing-and-advertisement',
      featured: true,
      tags: ['SEO', 'Content', 'Analytics'],
      salaryMin: 18000,
      salaryMax: 30000,
    },
    {
      title: 'Customer Support Officer',
      description:
        'Support employers and candidates, resolve account issues, and maintain a high-quality user experience.',
      location: 'Addis Ababa, Ethiopia',
      type: 'FULL_TIME',
      categorySlug: 'customer-service-and-care',
      featured: true,
      tags: ['Customer Care', 'Communication'],
      salaryMin: 12000,
      salaryMax: 20000,
    },
    {
      title: 'Remote UI/UX Designer',
      description:
        'Design clean job search and employer dashboard experiences. Portfolio with web or mobile product examples required.',
      location: 'Remote',
      type: 'REMOTE',
      categorySlug: 'creative-art-and-design',
      featured: true,
      tags: ['Figma', 'Product Design', 'Research'],
      salaryMin: 25000,
      salaryMax: 45000,
    },
    {
      title: 'Senior Accountant',
      description:
        'Own monthly reporting, general ledger review, and finance operations for a growing service company.',
      location: 'Addis Ababa, Ethiopia',
      type: 'FULL_TIME',
      categorySlug: 'accounting-and-finance',
      featured: false,
      tags: ['Accounting', 'Finance', 'Reporting'],
      salaryMin: 22000,
      salaryMax: 35000,
    },
  ];

  for (const demoJob of demoJobs) {
    const category = categoryBySlug.get(demoJob.categorySlug) ?? categories[0];
    const existing = await prisma.job.findFirst({
      where: { title: demoJob.title, companyId: company.id },
      select: { id: true },
    });

    const data = {
      title: demoJob.title,
      description: demoJob.description,
      location: demoJob.location,
      type: demoJob.type as never,
      status: 'PUBLISHED' as never,
      featured: demoJob.featured,
      tags: demoJob.tags,
      salaryMin: demoJob.salaryMin,
      salaryMax: demoJob.salaryMax,
      categoryId: category.id,
      companyId: company.id,
      companyName: company.name,
      vacancies: 1,
      currency: 'ETB',
    };

    if (existing) {
      await prisma.job.update({ where: { id: existing.id }, data });
    } else {
      await prisma.job.create({ data });
    }
  }

  console.log('✅ Demo employer and jobs created');

  // ── Freelance Categories ───────────────────────────────────────────────────
  await Promise.all([
    prisma.freelanceCategory.upsert({ where: { slug: 'graphic-design' },    update: {}, create: { slug: 'graphic-design',    label: 'Graphic Design',      icon: 'palette' } }),
    prisma.freelanceCategory.upsert({ where: { slug: 'web-development' },   update: {}, create: { slug: 'web-development',   label: 'Web Development',     icon: 'code-2' } }),
    prisma.freelanceCategory.upsert({ where: { slug: 'digital-marketing' }, update: {}, create: { slug: 'digital-marketing', label: 'Digital Marketing',   icon: 'megaphone' } }),
    prisma.freelanceCategory.upsert({ where: { slug: 'video-animation' },   update: {}, create: { slug: 'video-animation',   label: 'Video & Animation',   icon: 'clapperboard' } }),
    prisma.freelanceCategory.upsert({ where: { slug: 'writing' },           update: {}, create: { slug: 'writing',           label: 'Writing & Translation', icon: 'pen-line' } }),
  ]);
  console.log('✅ Freelance categories created');

  console.log('\n🎉 Database seeded successfully with Production Categories!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
