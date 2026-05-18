import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
  {
    slug: 'web-development',
    title: 'Web Development',
    description:
      'Build production-ready websites and web apps using HTML5, CSS3, JavaScript, and modern tooling. Includes deployment, Git, and freelancing fundamentals.',
    icon: '🌐',
    durationLabel: '7 months',
    level: 'MIXED' as const,
    status: 'ACTIVE' as const,
    curriculum: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'ES6+',
      'Git & GitHub',
      'Deployment',
      'Responsive Design',
      'Freelancing',
    ],
  },
  {
    slug: 'graphic-design',
    title: 'Graphic Design',
    description: 'Visual design fundamentals, typography, color theory, and industry-standard tools.',
    icon: '🎨',
    durationLabel: '12 weeks',
    level: 'BEGINNER' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    description: 'Product thinking, wireframing, prototyping, and user research.',
    icon: '✏️',
    durationLabel: '10 weeks',
    level: 'BEGINNER' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'SEO, content marketing, paid acquisition, and analytics for growing audiences.',
    icon: '📈',
    durationLabel: '8 weeks',
    level: 'BEGINNER' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
  {
    slug: 'data-analysis',
    title: 'Data Analysis',
    description: 'Excel, SQL, Python, and visualization for turning data into decisions.',
    icon: '📊',
    durationLabel: '14 weeks',
    level: 'INTERMEDIATE' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
  {
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Network security, threat detection, and hands-on defensive techniques.',
    icon: '🔐',
    durationLabel: '20 weeks',
    level: 'INTERMEDIATE' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
  {
    slug: 'mobile-development',
    title: 'Mobile Development',
    description: 'Build native and cross-platform mobile applications.',
    icon: '📱',
    durationLabel: 'TBA',
    level: 'INTERMEDIATE' as const,
    status: 'COMING_SOON' as const,
    curriculum: [],
  },
];

async function main() {
  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      create: course,
      update: course,
    });
  }
  console.log(`Seeded ${courses.length} courses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
