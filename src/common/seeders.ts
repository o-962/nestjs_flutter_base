function crud(name: string) {
  return [
    { name: `create_${name}` },
    { name: `read_${name}` },
    { name: `update_${name}` },
    { name: `delete_${name}` },
  ];
}

export const seeders = {
  roles: [
    {
      name: 'super_admin',
      permissions: [{ name: 'read_dashboard' }, ...crud('role')],
    },
    {
      name: 'student',
      permissions: [],
    },
    { name: 'special' },
    { name: 'banned' },
  ],
  auth: {
    first_name: 'omarxx',
    last_name: 'alkhatixxb',
    phone_number: '0791195473',
    email: 'o.alkhatib962@gmail.com',
    user_name: 'o.alkhatib.962',
  },
  user: {
    gender: 'male',
    last_login: '2025-07-01T00:00:00.000Z',
    birthdate: '2000-01-01',
    bio: 'This is a test user.',
  },
  course:
  {
    name: 'Course 1',
    icon: 'Course',
    price: 20,
    image: '/xxx',
  },
  syllabus: [
  {
    ref: "sec-1",
    title: "📘 Section 1: Introduction to Programming",
    description: "This section provides an overview of the course, covering the purpose, goals, and what students can expect to learn by the end. It sets the foundation for deeper technical topics.",
    content: [0.1, 0.2, 0.3],
    parent_ref: null
  },
  {
    ref: "sec-1.1",
    title: "🔹 1.1 Overview of Programming Concepts",
    description: "In this unit, students will explore key programming terms, understand how code works behind the scenes, and learn about the difference between compiled and interpreted languages.",
    content: [0.2, 0.1, 0.4],
    parent_ref: "sec-1"
  },
  {
    ref: "sec-1.1.1",
    title: "🔸 1.1.1 What is a Programming Language?",
    description: "This lesson introduces the definition of programming languages, examples such as Python, JavaScript, and C++, and why different languages are used for different applications.",
    content: [0.15, 0.25, 0.35],
    parent_ref: "sec-1.1"
  },
  {
    ref: "sec-1.1.2",
    title: "🔸 1.1.2 Compilation vs Interpretation",
    description: "Students will learn the difference between compiled and interpreted languages, with examples (e.g., C vs Python), and the pros and cons of each approach.",
    content: [0.05, 0.3, 0.25],
    parent_ref: "sec-1.1"
  },
  {
    ref: "sec-1.2",
    title: "🔹 1.2 Setting Up Your Development Environment",
    description: "Covers the process of installing code editors (like VS Code), setting up Node.js or Python, and writing the first \"Hello World\" program.",
    content: [0.3, 0.1, 0.2],
    parent_ref: "sec-1"
  },
  {
    ref: "sec-1.2.1",
    title: "🔸 1.2.1 Installing Visual Studio Code",
    description: "Step-by-step guide on installing VS Code on Windows/macOS/Linux, including extensions that help with productivity.",
    content: [0.12, 0.18, 0.27],
    parent_ref: "sec-1.2"
  },
  {
    ref: "sec-1.2.2",
    title: "🔸 1.2.2 Running Your First Program",
    description: "Teaches students how to write, run, and debug a simple program using the development environment they installed.",
    content: [0.09, 0.22, 0.31],
    parent_ref: "sec-1.2"
  }
]
,
  translations: [
    {
      name: 'arabic',
      icon: 'icon-arabic',
      lang: 'ar',
      translations: [
        {
          key: 'hi',
          value: 'x',
        },
      ],
    },
    {
      name: 'English',
      icon: 'icon-arabic',
      lang: 'en',
      translations: [
        {
          key: 'hi',
          value: 'hi english',
        },
      ],
    },
  ],
};
