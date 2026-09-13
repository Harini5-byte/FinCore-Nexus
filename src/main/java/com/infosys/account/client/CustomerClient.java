package com.infosys.account.client;

import com.infosys.account.dto.Account.CustomerDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.UUID;
@FeignClient(
        name = "customermicroservice",
        url = "http://localhost:8081"
)
public interface CustomerClient {

    @GetMapping("/customers/{id}")
    CustomerDTO getCustomerById(@PathVariable("id") UUID id);

}