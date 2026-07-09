package com.infosys.account.service.Account;
import com.infosys.account.Repository.Account.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.account.entity.Account.Account;

import java.util.List;
@Service
public class AccountServiceImpl implements AccountService{
    @Autowired
    private AccountRepository accountRepository;

    @Override
    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAllAccounts() {
        return (List<Account>) accountRepository.findAll();
    }

    @Override
    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId).orElse(null);
    }

    @Override
    public Account updateAccount(Long accountId, Account account) {
        Account existingAccount = accountRepository.findById(accountId).orElse(null);

        if(existingAccount != null){

            existingAccount.setAccountNumber(account.getAccountNumber());
            existingAccount.setAccountHolderName(account.getAccountHolderName());
            existingAccount.setAccountType(account.getAccountType());
            existingAccount.setBalance(account.getBalance());
            existingAccount.setStatus(account.getStatus());

            return accountRepository.save(existingAccount);
        }
        return null;
    }

    @Override
    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);

    }
}
