# FinCore Nexus — Setup Instructions

These `application.properties` files are **intentionally excluded** from this
repository (see `.gitignore`) because they contain real MySQL and email
passwords. To run this project locally, create the file at each path below
and fill in your **own** password.

---

## eurekaserver
`eurekaserver/src/main/resources/application.properties`
```
spring.application.name=EUREKA-SERVER
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```
(No database, no password needed here.)

---

## apigateway
`apigateway/src/main/resources/application.properties`
```
spring.application.name=API-GATEWAY
server.port=8080

logging.level.org.springframework.cloud.gateway=DEBUG

spring.cloud.gateway.server.webflux.routes[0].id=customer-service
spring.cloud.gateway.server.webflux.routes[0].uri=http://localhost:8081
spring.cloud.gateway.server.webflux.routes[0].predicates[0]=Path=/api/customers,/api/customers/**

spring.cloud.gateway.server.webflux.routes[1].id=account-service
spring.cloud.gateway.server.webflux.routes[1].uri=http://localhost:8082
spring.cloud.gateway.server.webflux.routes[1].predicates[0]=Path=/api/accounts,/api/accounts/**

spring.cloud.gateway.server.webflux.routes[2].id=transaction-service
spring.cloud.gateway.server.webflux.routes[2].uri=http://localhost:8083
spring.cloud.gateway.server.webflux.routes[2].predicates[0]=Path=/api/transactions,/api/transactions/**

spring.cloud.gateway.server.webflux.routes[3].id=loan-service
spring.cloud.gateway.server.webflux.routes[3].uri=http://localhost:8084
spring.cloud.gateway.server.webflux.routes[3].predicates[0]=Path=/api/loans,/api/loans/**

spring.cloud.gateway.server.webflux.routes[4].id=payment-service
spring.cloud.gateway.server.webflux.routes[4].uri=http://localhost:8085
spring.cloud.gateway.server.webflux.routes[4].predicates[0]=Path=/api/payments,/api/payments/**

spring.cloud.gateway.server.webflux.routes[5].id=kyc-service
spring.cloud.gateway.server.webflux.routes[5].uri=http://localhost:8086
spring.cloud.gateway.server.webflux.routes[5].predicates[0]=Path=/kyc,/kyc/**,/ocr/**,/facematch/**,/liveness/**,/risk/**,/compliance/**,/audit/**

spring.cloud.gateway.server.webflux.default-filters[0]=DedupeResponseHeader=Access-Control-Allow-Origin Access-Control-Allow-Credentials
```
(No database, no password needed here.)

---

## customerservice
`customerservice/src/main/resources/application.properties`
```
spring.application.name=CUSTOMER-SERVICE
server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/customerdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

---

## accountservice
`accountservice/src/main/resources/application.properties`
```
spring.application.name=ACCOUNT-SERVICE
server.port=8082

spring.datasource.url=jdbc:mysql://localhost:3306/fincore_account?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

---

## transactionservice
`transactionservice/src/main/resources/application.properties`
```
spring.application.name=TRANSACTION-SERVICE
server.port=8083

spring.datasource.url=jdbc:mysql://localhost:3306/fincore_transaction?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
```

---

## loanservice
`loanservice/src/main/resources/application.properties`
```
spring.application.name=LOAN-SERVICE
server.port=8084

spring.datasource.url=jdbc:mysql://localhost:3306/fincore_loan?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

account.service.url=http://localhost:8082
```

---

## paymentservice
`paymentservice/src/main/resources/application.properties`
```
spring.application.name=PAYMENT-SERVICE
server.port=8085

spring.datasource.url=jdbc:mysql://localhost:3306/fincore_payment?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# ACCOUNT SERVICE
account.service.url=http://localhost:8082

# EMAIL (for payment notifications)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_GMAIL_ADDRESS_HERE
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## kyc-service
`kyc-service/src/main/resources/application.properties`
```
spring.application.name=kyc-service

spring.datasource.url=jdbc:mysql://localhost:3306/kycdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

eureka.client.enabled=false
spring.cloud.discovery.enabled=false
server.port=8086
```

---

## Running order
1. eurekaserver
2. accountservice
3. paymentservice
4. apigateway
5. customerservice
6. kyc-service
7. transactionservice / loanservice (any time after eurekaserver)
8. Frontend: `cd Frontend`, `npm install`, `npm run dev`
