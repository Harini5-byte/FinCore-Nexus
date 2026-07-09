package com.infosys.account.Repository.Account;
import org.springframework.data.repository.CrudRepository;

import com.infosys.account.entity.Account.Account;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends CrudRepository<Account, Long> {
    boolean existsByAccountNumber(String accountNumber);

}


