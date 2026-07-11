package com.infosys.account;
import org.springframework.cloud.openfeign.EnableFeignClients;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableFeignClients
public class AccountmicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AccountmicroserviceApplication.class, args);
        System.out.println("welcome to springboot");
	}

}
