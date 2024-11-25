# Voting Application

A feature-rich voting application that ensures secure and seamless voting for users while maintaining robust admin control. This application provides **authentication** and **authorization** for both users and admins, ensuring a fair and transparent voting process.

---

## Features

### **User Features**
- **Secure Authentication:** Users must sign up and log in to access the application.
- **One Vote Per User:** Each user can vote only once for their preferred party, preventing duplicate votes.
- **Vote Privacy:** Votes are securely stored, ensuring privacy and integrity.

### **Admin Features**
- **Role-Based Access Control:** Admins have distinct privileges compared to users.
- **Admin-Only Access:**
  - Admins cannot vote.
  - Admins have exclusive rights to update, add, or modify voting-related details such as parties and voting rules.
- **Voting Monitoring:** Admins can view the voting progress and results in real time.

---

## Tech Stack
- **Backend:** [Node.js, Express.js]
- **Database:** [MongoDB]
- **Authentication:** JSON Web Tokens (JWT) for secure session handling.
- **Authorization:** Role-based access control (RBAC) to differentiate user and admin privileges.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Imlalitbishtt/voting-application.git
