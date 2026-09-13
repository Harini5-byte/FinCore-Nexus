package com.infosys.account;
import com.infosys.account.entity.Account.Account;
import jakarta.annotation.PostConstruct;
import com.infosys.account.Repository.Account.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Component;

@Component

public class AccountDataLoader {
    @Autowired
    private AccountRepository accountRepository;

    @PostConstruct
    public void loadData(){

        if(!accountRepository.existsByAccountNumber("100000002")){

            Account account2 = new Account();

            account2.setAccountNumber("100000002");
            account2.setAccountHolderName("Krishna");
            account2.setAccountType("Savings");
            account2.setBalance(5000.0);
            account2.setStatus("ACTIVE");

            accountRepository.save(account2);

        }

    }
    }



