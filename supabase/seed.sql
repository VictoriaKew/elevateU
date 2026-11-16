-- Run this after schema.sql in the Supabase SQL editor.
-- Curated, publicly accessible resources from the workbook. The in-app importer
-- can be used later to bring in additional rows from Google Sheets.
insert into public.roadmap_resources (career_track, title, resource_type, description, url, sort_order) values
  ('Frontend Developer', 'The Odin Project: Foundations', 'Full Course', 'A free curriculum for learning HTML, CSS and JavaScript from scratch.', 'https://www.theodinproject.com', 1),
  ('Frontend Developer', 'JavaScript Mastery: React JS Crash Course', 'YouTube Video', 'A step-by-step tutorial for building modern web applications.', 'https://www.youtube.com/c/javascriptmastery', 2),
  ('Frontend Developer', 'Personal Portfolio Project', 'Project Challenge', 'Build and publish a responsive portfolio on GitHub Pages.', 'https://pages.github.com', 3),
  ('Frontend Developer', 'Frontend Mentor', 'Project Challenge', 'Build professional designs into working websites.', 'https://www.frontendmentor.io/challenges', 4),
  ('Backend Developer', 'FreeCodeCamp: Backend Development and APIs', 'Full Course', 'Build backend services with Node.js, Express and APIs.', 'https://www.freecodecamp.org', 1),
  ('Backend Developer', 'Traversy Media: Node.js Crash Course', 'YouTube Video', 'An introduction to backend concepts, routing and server setup.', 'https://www.youtube.com/c/TraversyMedia', 2),
  ('Backend Developer', 'Task Manager API Project', 'Project Challenge', 'Build a secure REST API with authentication and CRUD operations.', 'https://nodejs.org', 3),
  ('Backend Developer', 'Full Stack Open: University of Helsinki', 'Full Course', 'Learn modern backend architecture through practical exercises.', 'https://fullstackopen.com/en/', 4),
  ('Data Analyst', 'Kaggle: Intro to SQL and Pandas', 'Short Course', 'Interactive micro-courses for data manipulation and database querying.', 'https://www.kaggle.com/learn', 1),
  ('Data Analyst', 'Alex The Analyst: Data Analyst Bootcamp', 'YouTube Playlist', 'Videos covering Excel, SQL, Tableau and Python.', 'https://www.youtube.com/c/AlexTheAnalyst', 2),
  ('Data Analyst', 'EDA on a Public Dataset', 'Project Challenge', 'Clean and analyse a public dataset to find useful insights.', 'https://www.kaggle.com/datasets', 3),
  ('Data Analyst', 'Harvard CS50 SQL', 'Full Course', 'Learn advanced queries, data integrity and database optimisation.', 'https://cs50.harvard.edu/sql/', 4),
  ('UI/UX Designer', 'Figma Official Tutorials', 'Short Course', 'Learn the industry-standard design tool from its creators.', 'https://help.figma.com/hc/en-us', 1),
  ('UI/UX Designer', 'Jesse Showalter: UI/UX Process', 'YouTube Video', 'Learn to move from research to wireframes and prototypes.', 'https://www.youtube.com/c/JesseShowalter', 2),
  ('UI/UX Designer', 'E-commerce App Redesign', 'Project Challenge', 'Wireframe and prototype a modern shopping experience.', 'https://www.figma.com', 3),
  ('UI/UX Designer', 'Daily UI', 'Project Challenge', 'A 100-day series of UI design prompts for your portfolio.', 'https://www.dailyui.co/', 4),
  ('DevOps Engineer', 'AWS Skill Builder: Cloud Essentials', 'Full Course', 'Free official training on cloud infrastructure and deployment.', 'https://explore.skillbuilder.aws', 1),
  ('DevOps Engineer', 'TechWorld with Nana: DevOps Bootcamp', 'YouTube Video', 'A beginner guide to Docker, Kubernetes, CI/CD and Jenkins.', 'https://www.youtube.com/c/TechWorldwithNana', 2),
  ('DevOps Engineer', 'Dockerize a Web Application', 'Project Challenge', 'Package a web app into a Docker container and run it locally.', 'https://www.docker.com/101-tutorial', 3),
  ('DevOps Engineer', '100 Days of DevOps', 'Project Challenge', 'Open-source daily DevOps challenges across Linux, AWS and Kubernetes.', 'https://github.com/bregman-arie/devops-exercises', 4),
  ('AI/ML Engineer', 'Kaggle: Intro to Machine Learning', 'Full Course', 'Learn core models, validation and model fitting.', 'https://www.kaggle.com/learn/intro-to-machine-learning', 1),
  ('AI/ML Engineer', 'Andrej Karpathy: Neural Networks Zero to Hero', 'YouTube Video', 'Build neural networks from scratch in this practical masterclass.', 'https://www.youtube.com/c/AndrejKarpathy', 2),
  ('AI/ML Engineer', 'Housing Price Prediction Model', 'Project Challenge', 'Train a decision tree to predict property prices.', 'https://scikit-learn.org', 3),
  ('AI/ML Engineer', 'Fast.ai: Practical Deep Learning for Coders', 'Full Course', 'Hands-on deep-learning lessons for coders.', 'https://course.fast.ai/', 4)
on conflict (career_track, url) do update set title = excluded.title, resource_type = excluded.resource_type, description = excluded.description, sort_order = excluded.sort_order;

insert into public.wellness_resources (risk_level, title, resource_type, description, url) values
  ('Low', 'Open Sourcing Mental Illness Handbooks', 'Free Guide', 'Free mental-health handbooks written for people in technology.', 'https://osmihelp.org/resources'),
  ('Low', 'How to Avoid Burnout as a Programmer', 'Article', 'Practical habits for managing stress, screen time and balance.', 'https://www.freecodecamp.org/news/a-coders-guide-to-managing-stress-46f2bbb49a8e/'),
  ('Low', 'The Pomodoro Technique for Burnout Prevention', 'Article', 'Learn how timed focus sessions and breaks can reduce fatigue.', 'https://todoist.com/productivity-methods/pomodoro-technique'),
  ('Mid', 'Burnout Prevention and Recovery', 'Article', 'Recognise burnout signs and explore practical recovery tools.', 'https://www.helpguide.org/mental-health/stress/burnout-prevention-and-recovery'),
  ('High', 'Student support and mental health resources', 'Support Resource', 'If stress feels unmanageable, consider speaking with a qualified support service or campus counsellor.', 'https://www.who.int/health-topics/mental-health')
on conflict (risk_level, title) do update set resource_type = excluded.resource_type, description = excluded.description, url = excluded.url;

-- Remaining workbook roadmap rows. Supabase is the live source of these resources.
insert into public.roadmap_resources (career_track, title, resource_type, description, url, sort_order) values
  ('Frontend Developer', 'freeCodeCamp: Responsive Web Design', 'Full Course', 'Interactive HTML and CSS certification.', 'https://www.freecodecamp.org/learn/responsive-web-design/', 5),
  ('Frontend Developer', 'Traversy Media: HTML and CSS Crash Course', 'YouTube Video', 'A strong foundation in UI structure and styling.', 'https://www.youtube.com/watch?v=mU6anWqZJcc', 6),
  ('Frontend Developer', 'Scrimba: Learn React', 'Full Course', 'Interactive React lessons where you can edit code in the browser.', 'https://scrimba.com/learn/learnreact', 7),
  ('Frontend Developer', 'Web Dev Simplified: Flexbox and Grid', 'YouTube Video', 'A visual guide to modern responsive layouts.', 'https://www.youtube.com/watch?v=fYq5PXgSsbE', 8),
  ('Frontend Developer', 'JavaScript30 by Wes Bos', 'Project Challenge', 'Build 30 vanilla JavaScript projects without frameworks.', 'https://javascript30.com/', 9),
  ('Backend Developer', 'Harvard CS50W', 'Full Course', 'Build robust web systems with Python, JavaScript, APIs and databases.', 'https://cs50.harvard.edu/web/', 5),
  ('Backend Developer', 'freeCodeCamp: FastAPI Course for Beginners', 'YouTube Video', 'Learn modern Python APIs, routing and database integration.', 'https://www.youtube.com/watch?v=0sOvCWFmrtA', 6),
  ('Backend Developer', 'RealWorld', 'Project Challenge', 'Build a functional Medium-style backend against clear API specifications.', 'https://github.com/gothinkster/realworld', 7),
  ('Backend Developer', 'Hussein Nasser: Backend Engineering Playlist', 'YouTube Playlist', 'Explore networking, databases and API design.', 'https://youtube.com/playlist?list=PLQnljOFTspQUNnO4p00ua_C5mKTfldiYT', 8),
  ('Backend Developer', 'Roadmap.sh: Backend Project Ideas', 'Project Challenge', 'Guided architecture challenges from beginner to advanced.', 'https://roadmap.sh/backend/projects', 9),
  ('Data Analyst', 'Alex The Analyst: Data Analyst Bootcamp Playlist', 'YouTube Playlist', 'A complete playlist covering the data analyst toolkit.', 'https://youtube.com/playlist?list=PLUaB-1hjhk8FE_XZ87vPPSfHqb6OcM0cF', 6),
  ('Data Analyst', 'StrataScratch', 'Project Challenge', 'Practice real-world SQL and Python interview challenges.', 'https://www.stratascratch.com/', 7),
  ('Data Analyst', 'Ken Jee: Data Science and Analyst Project', 'YouTube Playlist', 'Build a data project from scraping through dashboarding.', 'https://www.youtube.com/playlist?list=PL2zq7klxX5ASFejJj80ob9ZAnBHdz5O1t', 8),
  ('Data Analyst', 'DataLemur', 'Project Challenge', 'Solve SQL interview questions and dataset challenges.', 'https://datalemur.com/', 9),
  ('UI/UX Designer', 'Coursera: Google UX Design Certificate', 'Full Course', 'Learn the design process from research through testing.', 'https://www.coursera.org/professional-certificates/google-ux-design', 5),
  ('UI/UX Designer', 'DesignCourse: UI/UX Crash Course', 'YouTube Video', 'A beginner introduction to visual design principles and tools.', 'https://youtu.be/c9Wg6Cb_YlU', 6),
  ('UI/UX Designer', 'Interaction Design Foundation: UX Literature', 'Full Course', 'Free articles and textbook chapters on UX principles.', 'https://ixdf.org/literature', 7),
  ('UI/UX Designer', 'Learn UI/UX in 30 Days', 'YouTube Playlist', 'A free series on the foundational principles of UI and UX.', 'https://youtube.com/playlist?list=PL0lNJEnwfVVOQ8qKmLoT7tLdTDKhEDzmG', 8),
  ('UI/UX Designer', 'UX Tools: Design Challenges', 'Project Challenge', 'Design solutions for realistic product scenarios.', 'https://www.uxtools.co/challenges', 9),
  ('DevOps Engineer', 'AWS Educate: Cloud Operations', 'Full Course', 'Official cloud foundations and deployment training.', 'https://aws.amazon.com/education/awseducate/', 5),
  ('DevOps Engineer', 'freeCodeCamp: DevOps Engineering Course', 'YouTube Video', 'An overview of Linux, networking and cloud infrastructure.', 'https://www.youtube.com/watch?v=j5Zsa_eOXeY', 6),
  ('DevOps Engineer', 'KodeKloud: Docker for Beginners', 'Full Course', 'A hands-on introduction to containers and Docker images.', 'https://kodekloud.com/courses/docker-for-the-absolute-beginner/', 7),
  ('DevOps Engineer', 'freeCodeCamp: DevOps Complete Playlist', 'YouTube Playlist', 'A beginner-to-advanced DevOps learning playlist.', 'https://youtube.com/playlist?list=PLWKjhJtqVAbkzvvpY12KkfiIGso9A_Ixs', 8),
  ('DevOps Engineer', 'Roadmap.sh: DevOps Project Ideas', 'Project Challenge', 'Architecture guides for deploying and monitoring applications.', 'https://roadmap.sh/devops/projects', 9),
  ('AI/ML Engineer', 'freeCodeCamp: PyTorch for Deep Learning', 'YouTube Video', 'Build neural networks and computer-vision models with PyTorch.', 'https://www.youtube.com/watch?v=V_xro1bcAuA', 5),
  ('AI/ML Engineer', 'DrivenData', 'Project Challenge', 'Data-science competitions with real-world social impact.', 'https://www.drivendata.org/competitions/', 6),
  ('AI/ML Engineer', 'Coursera: Machine Learning Specialization', 'Full Course', 'A beginner-friendly three-course introduction to machine learning.', 'https://www.coursera.org/specializations/machine-learning-introduction', 7),
  ('AI/ML Engineer', 'Sentdex: Practical Machine Learning with Python', 'YouTube Playlist', 'A code-first approach to machine-learning algorithms.', 'https://youtube.com/playlist?list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v', 8),
  ('AI/ML Engineer', 'Hugging Face Open-Source Tasks', 'Project Challenge', 'Turn pre-trained models into useful Gradio applications.', 'https://huggingface.co/tasks', 9)
on conflict (career_track, url) do update set title = excluded.title, resource_type = excluded.resource_type, description = excluded.description, sort_order = excluded.sort_order;
