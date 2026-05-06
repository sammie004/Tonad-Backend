CBT Examination System
A modern gamified CBT (Computer-Based Testing) platform built to make exam preparation more interactive, competitive, and engaging for students preparing for examinations such as WAEC and NECO.
The system combines traditional online examinations with social and competitive learning features to create a smarter learning ecosystem for students.
Features


Secure authentication and authorization


Computer-based examinations and quizzes


Subject and topic-based question banks


Real-time tournaments and competitions


Global and subject-based leaderboards


Gamified learning with XP, levels, ratings, and achievements


Performance analytics and progress tracking


Friend system and social interactions


Real-time in-app messaging and chat rooms


Notifications system


Role-based access control for admins, moderators, and students


Tech Stack
Backend


Node.js


Express.js


MySQL


Socket.IO


Authentication & Security


JWT Authentication


Password Hashing


Role-Based Access Control (RBAC)


Realtime Features


WebSockets / Socket.IO


Live chat


Real-time tournament updates


Live leaderboards


System Goals
The goal of this project is to:


Improve student engagement through gamification


Encourage competitive and collaborative learning


Provide accessible CBT practice for students


Deliver real-time performance insights and analytics


Build a scalable educational platform with social features


Architecture
The project follows a modular monolithic architecture to maintain scalability while keeping development manageable.
Example structure:
src/├── auth/├── users/├── exams/├── questions/├── tournaments/├── chat/├── leaderboard/├── analytics/└── common/
Database Design
The system uses a relational database structure with:


UUID/ULID-based public identifiers


Foreign key constraints


Many-to-many relationship tables


Optimized indexing for scalability and performance


Future Improvements


AI-powered recommendations


Adaptive testing


Voice/video study rooms


Mobile application support


Anti-cheat monitoring systems


Regional and national rankings


Push notifications


Offline practice mode


Author
Built by Ndih Samuel.
