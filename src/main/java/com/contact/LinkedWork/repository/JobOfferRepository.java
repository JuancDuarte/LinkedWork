package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByUserIdAndActiveTrue(Long userId);
    
    List<JobOffer> findAllByActiveTrue();
    
    Optional<JobOffer> findByIdAndActiveTrue(Long id);
    
    List<JobOffer> findByCompanyAndActiveTrue(String company);
}
