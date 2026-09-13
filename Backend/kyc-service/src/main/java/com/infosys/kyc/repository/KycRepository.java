package com.infosys.kyc.repository;

import com.infosys.kyc.entity.Kyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycRepository extends JpaRepository<Kyc, Long> {

    List<Kyc> findByCustomerId(Long customerId);
}