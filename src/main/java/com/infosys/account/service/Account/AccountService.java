package com.infosys.account.service.Account;
import com.infosys.account.entity.Account.Account;
import java.util.List;

public interface AccountService {
    Account createAccount(Account account);

    List<Account> getAllAccounts();

    Account getAccountById(Long accountId);

    Account updateAccount(Long accountId, Account account);

    void deleteAccount(Long accountId);
}
