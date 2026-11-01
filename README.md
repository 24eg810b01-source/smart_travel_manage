# Smart Travel Management System

A web-based travel management platform built with React.js, Tailwind CSS, and designed to connect with Spring Boot REST services and a MySQL 8.0 relational database.

---

## 1. Quick Start (Frontend React Application)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` (comes with Node.js) or `pnpm` / `yarn`

### Installation & Local Run
1. **Clone or extract** the project files to your local folder:
   ```bash
   cd smart-travel-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173` (or the port displayed in your terminal).

4. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 2. MySQL Database Setup

The application comes with the complete relational DDL script in `schema.sql`.

### Connection Configuration
- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `smart_travel_db`
- **Username**: `root`
- **Password**: `@dulapuram18`

### Import into MySQL:
1. Open your terminal or MySQL Workbench:
   ```bash
   mysql -u root -p
   # Enter password: @dulapuram18
   ```
2. Execute the included SQL file:
   ```sql
   source schema.sql;
   ```
   Or run directly from shell:
   ```bash
   mysql -u root -p@dulapuram18 < schema.sql
   ```

---

## 3. Spring Boot Backend Configuration

If connecting to a standalone Spring Boot 3.x backend, configure `src/main/resources/application.properties`:

```properties
# Server Port
server.port=8080

# MySQL Database Connection
spring.datasource.url=jdbc:mysql://localhost:3306/smart_travel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=@dulapuram18
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=3

# Hibernate JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
```

### Enable CORS for the React Frontend
In your Spring Boot `WebMvcConfigurer`:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## 4. Key Application Features

- **Dashboard**: Real-time KPI summaries, upcoming trip spotlight, countdown, and quick reservation feed.
- **Trip Calendar**: Interactive month grid and agenda view with one-click `.ics` export for Google/Apple Calendar.
- **Real-Time Bookings**: Live reservation tracker with status simulation (Pending, Confirmed, In Transit, Completed) and printable electronic vouchers.
- **Expense Tracking**: Budget vs. actual spending, multi-currency conversion (USD, EUR, GBP, JPY, INR), category breakdown, and CSV report export.
- **Collaborative Planning**: Shareable itinerary links, team invitations, and activity voting/comment threads.
- **Admin Console**: Destination management, user role control (RBAC: USER, CO_PLANNER, ADMIN), and system audit trail.
- **Architecture Hub**: Built-in MySQL schema inspector, connection tester, and live SQL query console.
